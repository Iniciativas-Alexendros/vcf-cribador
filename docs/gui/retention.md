# Política de retención

**Versión:** 0.2.0  
**Fecha:** 2026-09-09  
**Traza:** ADR-0015, ADR-0016

## Variables

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ZEDAZO_DATA_DIR` | `/var/lib/zedazo` (local: `./data`) | Raíz de datos |
| `ZEDAZO_STORAGE_MODE` | `ephemeral` | FS + manifest; sin SQLite obligatorio |
| `ZEDAZO_JOB_RETENTION_HOURS` | `24` | TTL tras `completed`/`failed`/`cancelled` |
| `ZEDAZO_MAX_UPLOAD_BYTES` | `52428800` (50 MiB) | Límite de upload |

## Comportamiento

1. Cada job vive en `$ZEDAZO_DATA_DIR/jobs/{ulid}/`.
2. Tras TTL, el worker marca `expired` y borra input, outputs, events y cache.
3. `DELETE /api/v1/jobs/{id}` borra de inmediato (o programa si está en ejecución).
4. Ajustes GUI: acción “borrar todos los datos locales” (`POST /api/v1/admin/wipe`) limpia `jobs/`, `uploads/` y `tmp/`.
5. Backups bajo `$ZEDAZO_DATA_DIR/backups/` solo si el operador los crea explícitamente.

## Privacidad

- Sin telemetría remota por defecto.
- Nombre original del fichero solo como metadato saneado, nunca como ruta.
