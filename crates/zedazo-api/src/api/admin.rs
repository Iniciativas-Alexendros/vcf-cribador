use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;

use crate::app::AppState;

/// Borra todos los datos locales (jobs, uploads, tmp). Single-user local.
pub async fn wipe_all(
    State(state): State<AppState>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, String)> {
    {
        let mut jobs = state.jobs.write().await;
        for rec in jobs.values_mut() {
            rec.cancel.cancel();
        }
        jobs.clear();
    }
    {
        let mut events = state.events.write().await;
        events.clear();
    }
    state
        .storage
        .wipe_all()
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok((
        StatusCode::OK,
        Json(serde_json::json!({ "wiped": true, "jobs": true, "uploads": true, "tmp": true })),
    ))
}
