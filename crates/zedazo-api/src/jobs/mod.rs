pub use crate::dto::{JobEvent, JobManifest, JobRecord, JobStatus};

use std::collections::BTreeSet;
use std::sync::Arc;

use tokio::sync::broadcast;
use zedazo_core::application::process::{
    self, ArtifactKind, JobId, ProcessPhase, ProcessRequest, ProgressReporter, RulesConfigSource,
};

use crate::app::AppState;
use crate::dto::artifact_kind_str;

pub struct ApiProgress {
    tx: broadcast::Sender<JobEvent>,
    seq: std::sync::atomic::AtomicU64,
}

impl ApiProgress {
    pub fn new(tx: broadcast::Sender<JobEvent>) -> Self {
        Self {
            tx,
            seq: std::sync::atomic::AtomicU64::new(1),
        }
    }

    fn emit(&self, event: &str, data: serde_json::Value) {
        let id = self.seq.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let _ = self.tx.send(JobEvent {
            id,
            event: event.to_string(),
            data,
        });
    }
}

impl ProgressReporter for ApiProgress {
    fn phase(&self, phase: ProcessPhase) {
        self.emit(
            "phase",
            serde_json::json!({ "phase": format!("{:?}", phase) }),
        );
    }
    fn metric(&self, name: &str, value: u64) {
        self.emit(
            "metric",
            serde_json::json!({ "name": name, "value": value }),
        );
    }
    fn message(&self, msg: &str) {
        self.emit("message", serde_json::json!({ "message": msg }));
    }
}

pub fn spawn_job(state: AppState, job_id: String) {
    tokio::task::spawn_blocking(move || {
        if let Err(e) = run_job_sync(&state, &job_id) {
            tracing::error!(%job_id, error = %e, "job falló");
            let rt = tokio::runtime::Handle::current();
            rt.block_on(async {
                let mut jobs = state.jobs.write().await;
                if let Some(rec) = jobs.get_mut(&job_id) {
                    rec.manifest.status = JobStatus::Failed;
                    rec.manifest.error = Some(e.to_string());
                    rec.manifest.completed_at = Some(now_rfc3339());
                    save_manifest(&state, &rec.manifest);
                }
            });
        }
    });
}

fn run_job_sync(state: &AppState, job_id: &str) -> anyhow::Result<()> {
    let handle = tokio::runtime::Handle::current();
    let (rec_snapshot, tx) = handle.block_on(async {
        let jobs = state.jobs.read().await;
        let rec = jobs
            .get(job_id)
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("job no encontrado"))?;
        let events = state.events.read().await;
        let tx = events
            .get(job_id)
            .cloned()
            .ok_or_else(|| anyhow::anyhow!("sin canal de eventos"))?;
        Ok::<_, anyhow::Error>((rec, tx))
    })?;

    {
        let mut jobs = handle.block_on(state.jobs.write());
        if let Some(r) = jobs.get_mut(job_id) {
            r.manifest.status = JobStatus::Validating;
            r.manifest.started_at = Some(now_rfc3339());
            save_manifest(state, &r.manifest);
        }
    }

    let job_dir = state.storage.ensure_job_dir(job_id)?;
    let input = job_dir.join("input.vcf");
    let upload_path = state
        .storage
        .upload_path(&rec_snapshot.manifest.input.upload_id);
    if !input.exists() {
        std::fs::copy(&upload_path, &input)?;
    }

    let config = if let Some(toml) = &rec_snapshot.config_toml {
        RulesConfigSource::TomlInline(toml.clone())
    } else {
        RulesConfigSource::BuiltIn
    };

    let mut arts: BTreeSet<ArtifactKind> =
        rec_snapshot.requested_artifacts.iter().copied().collect();
    if arts.is_empty() {
        arts.insert(ArtifactKind::Vcf);
        arts.insert(ArtifactKind::AuditTsv);
        arts.insert(ArtifactKind::StatsJson);
        arts.insert(ArtifactKind::Csv);
        arts.insert(ArtifactKind::Json);
    }

    let progress: Arc<dyn ProgressReporter> = Arc::new(ApiProgress::new(tx.clone()));
    let req = ProcessRequest {
        job_id: JobId(job_id.to_string()),
        input_path: input,
        working_directory: job_dir.clone(),
        config,
        requested_artifacts: arts,
        source_override: "auto".into(),
        dry_run: false,
        strict: false,
        cancellation: rec_snapshot.cancel.clone(),
        progress,
    };

    if rec_snapshot.cancel.is_cancelled() {
        handle.block_on(async {
            let mut jobs = state.jobs.write().await;
            if let Some(r) = jobs.get_mut(job_id) {
                r.manifest.status = JobStatus::Cancelled;
                r.manifest.completed_at = Some(now_rfc3339());
                save_manifest(state, &r.manifest);
            }
        });
        return Ok(());
    }

    let result = process::run(&req)?;

    handle.block_on(async {
        let mut jobs = state.jobs.write().await;
        if let Some(r) = jobs.get_mut(job_id) {
            if r.cancel.is_cancelled() {
                r.manifest.status = JobStatus::Cancelled;
            } else {
                r.manifest.status = JobStatus::Completed;
                r.manifest.summary = Some(result.summary.clone());
                r.contact_views = result.contact_views.clone();
                r.duplicate_groups = result.duplicate_groups.clone();
                r.warnings = result.warnings.clone();
                r.manifest.artifacts = result
                    .artifacts
                    .iter()
                    .map(|a| artifact_kind_str(a.kind).to_string())
                    .collect();
                // Persistir contactos para consultas
                let contacts_path = job_dir.join("contacts_view.json");
                let _ = std::fs::write(
                    &contacts_path,
                    serde_json::to_string_pretty(&result.contact_views).unwrap_or_default(),
                );
                let dup_path = job_dir.join("duplicates_view.json");
                let _ = std::fs::write(
                    &dup_path,
                    serde_json::to_string_pretty(&result.duplicate_groups).unwrap_or_default(),
                );
            }
            r.manifest.completed_at = Some(now_rfc3339());
            save_manifest(state, &r.manifest);
        }
    });

    Ok(())
}

pub fn save_manifest(state: &AppState, manifest: &JobManifest) {
    let path = state
        .storage
        .job_dir(&manifest.job_id)
        .join("manifest.json");
    if let Ok(s) = serde_json::to_string_pretty(manifest) {
        let _ = std::fs::write(path, s);
    }
}

pub fn now_rfc3339() -> String {
    chrono::Utc::now().to_rfc3339()
}
