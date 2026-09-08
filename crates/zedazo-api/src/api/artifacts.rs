use axum::body::Body;
use axum::extract::{Path, State};
use axum::http::{header, StatusCode};
use axum::response::Response;

use crate::app::AppState;
use crate::dto::{parse_artifact_kind, JobStatus};
use zedazo_core::application::process::ArtifactKind;

pub async fn download(
    State(state): State<AppState>,
    Path((job_id, kind)): Path<(String, String)>,
) -> Result<Response, StatusCode> {
    let jobs = state.jobs.read().await;
    let rec = jobs.get(&job_id).ok_or(StatusCode::NOT_FOUND)?;
    if rec.manifest.status != JobStatus::Completed {
        return Err(StatusCode::CONFLICT);
    }
    let kind = parse_artifact_kind(&kind).ok_or(StatusCode::BAD_REQUEST)?;
    let filename = match kind {
        ArtifactKind::Vcf => "output.vcf",
        ArtifactKind::AuditTsv => "audit.tsv",
        ArtifactKind::StatsJson => "stats.json",
        ArtifactKind::StatsMarkdown => "stats.md",
        ArtifactKind::Csv => "contacts.csv",
        ArtifactKind::Json => "contacts.json",
    };
    let path = state.storage.job_dir(&job_id).join(filename);
    state
        .storage
        .assert_under_root(&path)
        .map_err(|_| StatusCode::FORBIDDEN)?;
    if !path.exists() {
        return Err(StatusCode::NOT_FOUND);
    }
    let data = std::fs::read(&path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let ctype = mime_guess::from_path(filename)
        .first_or_octet_stream()
        .essence_str()
        .to_string();
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, ctype)
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{filename}\""),
        )
        .body(Body::from(data))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}
