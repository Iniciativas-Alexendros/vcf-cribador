use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::Json;
use serde::Deserialize;

use crate::app::AppState;

#[derive(Deserialize)]
pub struct ContactQuery {
    pub q: Option<String>,
    pub result: Option<String>,
}

pub async fn list_contacts(
    State(state): State<AppState>,
    Path(job_id): Path<String>,
    Query(q): Query<ContactQuery>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let jobs = state.jobs.read().await;
    let rec = jobs.get(&job_id).ok_or(StatusCode::NOT_FOUND)?;
    let mut items = rec.contact_views.clone();
    if let Some(ref needle) = q.q {
        let n = needle.to_lowercase();
        items.retain(|c| {
            c.fn_value.to_lowercase().contains(&n)
                || c.emails.iter().any(|e| e.to_lowercase().contains(&n))
                || c.tels.iter().any(|t| t.contains(&n))
        });
    }
    if let Some(ref r) = q.result {
        items.retain(|c| c.result == *r);
    }
    Ok(Json(
        serde_json::json!({ "items": items, "next_cursor": null }),
    ))
}

pub async fn get_contact(
    State(state): State<AppState>,
    Path((job_id, contact_id)): Path<(String, String)>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let jobs = state.jobs.read().await;
    let rec = jobs.get(&job_id).ok_or(StatusCode::NOT_FOUND)?;
    let c = rec
        .contact_views
        .iter()
        .find(|c| c.uid == contact_id)
        .ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(serde_json::json!(c)))
}

pub async fn list_duplicates(
    State(state): State<AppState>,
    Path(job_id): Path<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let jobs = state.jobs.read().await;
    let rec = jobs.get(&job_id).ok_or(StatusCode::NOT_FOUND)?;
    Ok(Json(serde_json::json!({ "groups": rec.duplicate_groups })))
}
