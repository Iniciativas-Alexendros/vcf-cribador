# Despliegue self-hosted (V1 local)

## Variables

| Variable | Default | Notas |
|----------|---------|-------|
| `ZEDAZO_API_ENABLED` | true | Operativo |
| `ZEDAZO_WEB_ENABLED` | false | Activar frontend |
| `ZEDAZO_STORAGE_MODE` | ephemeral | FS + manifest |
| `ZEDAZO_DATA_DIR` | `/var/lib/zedazo` | Volumen |
| `ZEDAZO_MAX_UPLOAD_BYTES` | 52428800 | 50 MiB |
| `ZEDAZO_JOB_RETENTION_HOURS` | 24 | TTL |
| `ZEDAZO_AUTH_MODE` | disabled | Solo loopback |
| `ZEDAZO_OTEL_ENABLED` | false | Opt-in |
| `ZEDAZO_BIND` | `127.0.0.1:8080` | Bind API |

## Docker Compose

```bash
cd deploy
docker compose up --build
```

API: `http://127.0.0.1:8080` · Web: `http://127.0.0.1:3000`

## Rollback

1. Detener web/API (`docker compose down` sin `-v`).
2. Conservar volumen `zedazo-data`.
3. Usar CLI: `zedazo cribar entrada.vcf -o salida.vcf -a audit.tsv`.
4. No borrar artefactos hasta verificar recuperación.

## Coolify / VPS

Exponer solo tras HTTPS + auth (fuera de alcance V1 local). Preferir bind loopback + túnel.
