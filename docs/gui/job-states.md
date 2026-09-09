# Estados de job

**Versión:** 0.2.0  
**Fecha:** 2026-09-09  
**Traza:** ADR-0015, ADR-0016

Estados persistidos en `manifest.json`:

| Estado | Significado |
|--------|-------------|
| `created` | Metadatos creados |
| `uploading` | Recibiendo bytes |
| `uploaded` | Input en disco; hash disponible |
| `queued` | En cola de worker |
| `validating` | Validación VCF / límites |
| `parsing` | Parseo |
| `screening` | Cribado |
| `normalizing` | Normalización |
| `classifying` | Clasificación |
| `deduplicating` | Deduplicación |
| `verifying` | Invariantes I1–I7 |
| `writing_artifacts` | Escritura de salidas |
| `completed` | Éxito (puede incluir `NeedsReview`) |
| `failed` | Error estructurado (p. ej. VCF malformado) |
| `cancel_requested` | Cancelación cooperativa pedida |
| `cancelled` | Cancelado en punto seguro |
| `expired` | TTL de retención superado |
| `deleted` | Borrado lógico/físico |

`completed` con contactos `NeedsReview` **no** es `failed`.
Jobs `cancelled`/`failed`/`expired`: artefactos incompletos no se sirven como resultados definitivos.
