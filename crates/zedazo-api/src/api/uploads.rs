use axum::extract::{Multipart, State};
use axum::http::StatusCode;
use axum::Json;
use uuid::Uuid;

use crate::app::AppState;
use crate::dto::UploadResponse;
use crate::storage::Storage;

pub async fn create_upload(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<UploadResponse>), (StatusCode, String)> {
    let mut file_name = String::from("upload.vcf");
    let mut bytes: Option<Vec<u8>> = None;

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?
    {
        if field.name() == Some("file") {
            if let Some(n) = field.file_name() {
                file_name = Storage::sanitize_name(n);
            }
            let data = field
                .bytes()
                .await
                .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
            if data.len() > state.max_upload_bytes {
                return Err((
                    StatusCode::PAYLOAD_TOO_LARGE,
                    "upload demasiado grande".into(),
                ));
            }
            // Validación mínima VCF
            let sample = String::from_utf8_lossy(&data[..data.len().min(512)]);
            if !sample.contains("BEGIN:VCARD") && !sample.contains("begin:vcard") {
                return Err((StatusCode::BAD_REQUEST, "contenido no parece VCF".into()));
            }
            bytes = Some(data.to_vec());
        }
    }

    let data = bytes.ok_or((StatusCode::BAD_REQUEST, "falta campo file".into()))?;
    let upload_id = Uuid::now_v7().to_string();
    let cursor = std::io::Cursor::new(data);
    let (_path, size, sha) = state
        .storage
        .write_upload_stream(&upload_id, cursor, state.max_upload_bytes)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((
        StatusCode::CREATED,
        Json(UploadResponse {
            upload_id,
            original_name: file_name,
            bytes: size,
            sha256: sha,
        }),
    ))
}
