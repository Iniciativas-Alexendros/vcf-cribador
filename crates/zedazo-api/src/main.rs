//! Zedazo API — adaptador HTTP sobre zedazo-core (ADR-0015).

use tracing_subscriber::EnvFilter;
use zedazo_api::app;
use zedazo_api::auth;
use zedazo_api::dto::JobStatus;
use zedazo_api::jobs::now_rfc3339;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env().add_directive("zedazo_api=info".parse()?))
        .init();

    let state = app::AppState::from_env()?;
    let bind = std::env::var("ZEDAZO_BIND").unwrap_or_else(|_| "127.0.0.1:8080".into());
    auth::validate_bind_auth(&bind, &state.auth)?;

    // Barrido periódico de retención (TTL)
    {
        let st = state.clone();
        tokio::spawn(async move {
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(3600));
            loop {
                interval.tick().await;
                retention_sweep(&st).await;
            }
        });
    }
    let app = app::router(state.clone());

    let listener = tokio::net::TcpListener::bind(&bind).await?;
    tracing::info!("zedazo-api escuchando en http://{bind}");
    axum::serve(listener, app).await?;
    Ok(())
}

async fn retention_sweep(state: &app::AppState) {
    let now = chrono::Utc::now();
    let mut to_expire = Vec::new();
    {
        let jobs = state.jobs.read().await;
        for (id, rec) in jobs.iter() {
            let Some(completed) = rec.manifest.completed_at.as_ref() else {
                continue;
            };
            let Ok(ts) = chrono::DateTime::parse_from_rfc3339(completed) else {
                continue;
            };
            let age = now.signed_duration_since(ts.with_timezone(&chrono::Utc));
            if age.num_hours() >= rec.manifest.retention_hours as i64 {
                to_expire.push(id.clone());
            }
        }
    }
    for id in to_expire {
        let mut jobs = state.jobs.write().await;
        if let Some(rec) = jobs.get_mut(&id) {
            rec.manifest.status = JobStatus::Expired;
            let _ = now_rfc3339();
            let _ = state.storage.delete_job_dir(&id);
            jobs.remove(&id);
            tracing::info!(job_id = %id, "job expirado por retención");
        }
    }
}
