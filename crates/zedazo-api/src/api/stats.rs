use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;

use crate::app::AppState;
use crate::dto::JobStatus;

pub async fn get_stats(
    State(state): State<AppState>,
    Path(job_id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let jobs = state.jobs.read().await;
    let rec = jobs.get(&job_id).ok_or(StatusCode::NOT_FOUND)?;
    if rec.manifest.status != JobStatus::Completed {
        return Err(StatusCode::CONFLICT);
    }
    let path = state.storage.job_dir(&job_id).join("stats.json");
    if path.exists() {
        let text = std::fs::read_to_string(&path).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        let v: serde_json::Value =
            serde_json::from_str(&text).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        return Ok(Json(v));
    }
    Ok(Json(serde_json::json!({ "summary": rec.manifest.summary })))
}
