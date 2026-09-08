use axum::extract::State;
use axum::Json;

use crate::app::AppState;
use crate::dto::{HealthResponse, VersionResponse};

pub async fn health(State(state): State<AppState>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        api_version: state.api_version.clone(),
        core_version: state.core_version.clone(),
        storage_mode: std::env::var("ZEDAZO_STORAGE_MODE").unwrap_or_else(|_| "ephemeral".into()),
    })
}

pub async fn version(State(state): State<AppState>) -> Json<VersionResponse> {
    Json(VersionResponse {
        version: state.core_version.clone(),
        git_sha: std::env::var("ZEDAZO_GIT_SHA").unwrap_or_else(|_| "unknown".into()),
        build_date: std::env::var("ZEDAZO_BUILD_DATE").unwrap_or_else(|_| "unknown".into()),
        schema_version: "1".into(),
    })
}
