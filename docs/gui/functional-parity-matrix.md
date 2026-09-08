# Matriz de paridad funcional CLI ↔ GUI

**Versión:** 0.1.0  
**Fecha:** 2026-09-08  
**Traza:** ADR-0015, SPECS O10, ROADMAP v0.5.0

La GUI debe cubrir la **paridad de casos de uso**, no sustituir artefactos propios del terminal (`completions`).

| Capacidad | CLI | GUI / API | Criterio de equivalencia |
|-----------|-----|-----------|--------------------------|
| Lectura VCF 3.0 | `cribar` / `audit` | Upload + job / audit | Mismos conteos y decisiones sobre fixtures Google/Apple |
| Lectura VCF 4.0 | idem | idem | Fixture Proton |
| Detección Proton / Google / Apple | `source` auto | Manifest `source_detected` | Igual que `source_detail` |
| Normalización | pipeline cribar | Resultados en ficha contacto | Mismos FN/TEL/ORG normalizados |
| Clasificación | cribar | Categorías en ficha | Mismas N1/N2(/N3) |
| Cribado | cribar | Estados Conserved/Eliminated/NeedsReview/Quarantine | Misma decisión + regla |
| Dedup UID (D1) | cribar | Vista Duplicados | Mismos grupos / merged_uids |
| Dedup teléfono / email fuzzy / nombre | cribar | Vista Duplicados + evidencias | Misma fusión transitiva |
| Cierre transitivo Union-Find | cribar | Grupos | Misma cardinalidad de grupos |
| Export VCF 4.0 | `-o` | Artifact `vcf` | Diff semántico (ignorar timestamps de job) |
| Export audit TSV | `-a` | Artifact `audit_tsv` | Filas equivalentes |
| Export CSV / JSON | `export` | Artifacts | Contenido equivalente |
| Stats text/json/markdown | `stats` | Stats + artifact md/json | Conteos alineados con pipeline completo en jobs |
| Reglas TOML append/replace | `-c` | Pantalla Reglas + job | Mismo hash de reglas → mismo resultado |
| Warning config deprecada `[cribado]` | tracing | Warning en UI | Visible sin fallar |
| Errores parseo / malformado | exit ≠ 0 | Job `failed` + error tipado | Sin PII en logs |
| Codificaciones (UTF-8, ISO-8859-1) | encoding | Upload | Fixture `iso_sample.vcf` |
| Preservación PHOTO/folding | writer | Artifact VCF | Roundtrip como CLI |
| Cancelación | N/A (CTRL-C) | `POST .../cancel` | Artefactos incompletos no descargables como definitivos |
| Shell completions | `completions` | Solo documentación | Sin pantalla equivalente |

## Test de equivalencia (CI)

Para cada fixture en `tests/fixtures/*.vcf` relevante: ejecutar CLI y API con la misma config; normalizar IDs/timestamps; comparar VCF, TSV, CSV, JSON y conteos. Criterio: **misma semántica**, no “ambos funcionan”.
