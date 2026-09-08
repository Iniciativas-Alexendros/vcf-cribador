//! Caso de uso: Export — CSV o JSON a partir del pipeline cribar (dry-run).

use std::path::Path;

use crate::application::cribar;
use crate::error::CribaError;
use crate::infrastructure::csv_writer::export_csv;
use crate::infrastructure::json_writer::export_json;

/// Ejecuta cribado en dry-run y exporta contactos activos a CSV o JSON.
pub fn execute(input: &Path, output: &Path, format: &str) -> Result<(), CribaError> {
    let (_stats, contacts) = cribar::execute(input, None, None, None, "auto", true, false)?;
    match format {
        "json" => export_json(&contacts, output)?,
        _ => export_csv(&contacts, output)?,
    }
    Ok(())
}
