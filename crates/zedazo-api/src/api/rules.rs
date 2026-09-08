use axum::Json;
use serde::Deserialize;
use zedazo_core::infrastructure::config::load_config;

#[derive(Deserialize)]
pub struct RulesBody {
    pub toml: String,
}

pub async fn validate(Json(body): Json<RulesBody>) -> Json<serde_json::Value> {
    let dir = tempfile::tempdir().ok();
    let Some(dir) = dir else {
        return Json(serde_json::json!({ "ok": false, "diagnostics": [{"message": "tmp"}] }));
    };
    let path = dir.path().join("zedazo.toml");
    if let Err(e) = std::fs::write(&path, &body.toml) {
        return Json(
            serde_json::json!({ "ok": false, "diagnostics": [{"message": e.to_string()}] }),
        );
    }
    match load_config(Some(&path)) {
        Ok(_) => Json(serde_json::json!({ "ok": true, "diagnostics": [] })),
        Err(e) => Json(serde_json::json!({
            "ok": false,
            "diagnostics": [{"message": e.to_string()}]
        })),
    }
}

pub async fn preview(Json(body): Json<RulesBody>) -> Json<serde_json::Value> {
    // Preview limitada: solo valida; no crea job definitivo
    let v = validate(Json(body)).await;
    Json(serde_json::json!({ "preview": true, "validation": v.0 }))
}
