# Integración OpenTelemetry

**Estado: aplazado post-v1.0** — [ADR-0017](../DECISIONS.md). No hay feature `otel` ni deps `opentelemetry*` en el workspace.

Zedazo usa `tracing` para logging estructurado. OpenTelemetry se contempla como capa adicional de exportación de spans a colectores OTLP (SigNoz, Jaeger, Grafana Tempo, etc.) **solo después de v1.0**, con ADR de deps y confirmación humana ([AGENTS.md](../AGENTS.md)).

## Variables reservadas (no-op hoy)

| Variable | Valor documentado | Comportamiento actual |
|----------|-------------------|------------------------|
| `ZEDAZO_OTEL_ENABLED` | `false` (deploy) | Reservada; la API/CLI no exportan OTLP |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | Sin efecto hasta implementar la feature |

Alineado con ADR-0015: sin telemetría remota por defecto.

## Receta futura (no aplicar aún)

Cuando se reactive el trabajo, la guía histórica sugería feature opcional + OTLP:

```toml
[features]
otel = [
    "dep:opentelemetry",
    "dep:opentelemetry_sdk",
    "dep:opentelemetry-otlp",
    "dep:tracing-opentelemetry",
    "dep:tokio",
]
```

Endpoint típico: `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`. Spans de pipeline (`parse` → `write`) solo con feature activa; sin endpoint, solo logging por consola.

**No** copiar esta receta a `Cargo.toml` sin ADR de deps y revisión de versiones actuales del ecosistema OTel.
