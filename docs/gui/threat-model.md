# Modelo de amenazas — Zedazo web self-hosted

**Versión:** 0.1.0  
**Fecha:** 2026-09-08  
**Traza:** ADR-0015

## Activos

- Agendas VCF (datos personales; posibles categorías sensibles)
- Artefactos de salida (VCF/TSV/CSV/JSON)
- Reglas TOML del operador
- Metadatos de jobs (hashes, conteos)

## Supuestos V1 local

- Operador único en `127.0.0.1`
- `ZEDAZO_AUTH_MODE=disabled` solo en loopback
- Sin red saliente durante procesamiento por defecto
- Volumen de datos bajo control del operador

## Amenazas y controles

| ID | Amenaza | Control |
|----|---------|---------|
| T1 | Path traversal / escritura fuera del job | IDs opacos; rechazar rutas de usuario; denegar symlinks |
| T2 | DoS por upload enorme | `ZEDAZO_MAX_UPLOAD_BYTES`; límites de contactos/tiempo |
| T3 | XSS vía campos vCard | Renderizar como texto; prohibido `dangerouslySetInnerHTML` |
| T4 | Exfiltración accidental “copiar todo” | Sin botón masivo por defecto en multiusuario futuro; V1: cuidado en UX |
| T5 | Logs con PII | Logs sin contenido de contacto por defecto |
| T6 | Contenedor privilegiado | Usuario no-root; FS RO excepto data dir; sin Docker socket |
| T7 | CORS abierto / CSRF | CORS restringido; CSRF si hay cookies |
| T8 | Telemetría no deseada | `ZEDAZO_OTEL_ENABLED=false` por defecto |
| T9 | Retención indefinida | TTL `ZEDAZO_JOB_RETENTION_HOURS` + borrado verificable |
| T10 | Sustitución de CLI frágil | No invocar CLI vía Node; core compartido |

## Fuera de alcance V1

- Modelo `team` (ownership, auditoría de accesos, revocación)
- Amenazas de red multi-tenant
