# Despliegue self-hosted

**Traza:** ADR-0015 (local), ADR-0016 (remoto single-user).

## Variables

| Variable | Default | Notas |
|----------|---------|-------|
| `ZEDAZO_API_ENABLED` | true | Operativo |
| `ZEDAZO_WEB_ENABLED` | false | Activar frontend |
| `ZEDAZO_STORAGE_MODE` | ephemeral | FS + manifest |
| `ZEDAZO_DATA_DIR` | `/var/lib/zedazo` | Volumen |
| `ZEDAZO_MAX_UPLOAD_BYTES` | 52428800 | 50 MiB |
| `ZEDAZO_JOB_RETENTION_HOURS` | 24 | TTL |
| `ZEDAZO_AUTH_MODE` | `disabled` | `disabled` solo loopback; `token` en remoto |
| `ZEDAZO_AUTH_ALLOW_DISABLED_NON_LOOPBACK` | `false` | Solo Docker local: API escucha `0.0.0.0` dentro del contenedor mientras el host publica `127.0.0.1` |
| `ZEDAZO_AUTH_TOKEN` | — | Obligatorio si `token`; alta entropía; no commitear |
| `ZEDAZO_AUTH_COOKIE_SECURE` | `true` | Cookie `Secure`; `false` solo pruebas HTTP locales con token |
| `ZEDAZO_CORS_ORIGIN` | vacío | Orígenes explícitos (coma-separados) en modo token; vacío = sin CORS permisivo |
| `ZEDAZO_OTEL_ENABLED` | false | Opt-in |
| `ZEDAZO_BIND` | `127.0.0.1:8080` | Bind API |

## Docker Compose — local (loopback)

```bash
cd deploy
docker compose up --build
```

API: `http://127.0.0.1:8080` · Web: `http://127.0.0.1:3000`  
Auth: `disabled` (puertos solo en loopback del host).

TLS local opcional: `docker compose --profile proxy up --build` → `https://127.0.0.1:8443`.

## Docker Compose — remoto (ADR-0016)

```bash
cd deploy
cp .env.example .env   # editar ZEDAZO_AUTH_TOKEN (openssl rand -hex 32)
docker compose -f docker-compose.remote.yml --env-file .env up --build
```

- Solo **Caddy** publica `127.0.0.1:8443` (HTTPS, `tls internal`).
- API y web solo en red Docker interna (same-origin: `/` → web, `/api/*` → api).
- Frontend con rutas relativas (`NEXT_PUBLIC_API_BASE` vacío).
- Abrir `https://127.0.0.1:8443`, aceptar certificado interno, entrar con el token en `/acceso`.

### Este dispositivo (hoy)

1. Generar token y arrancar `docker-compose.remote.yml` como arriba.
2. **Preferido sin abrir el router:** Tailscale Serve/Funnel o Cloudflare Tunnel hacia `https://127.0.0.1:8443`.
3. Alternativa LAN: IP local + certificado interno (el navegador avisará).

### MiniPC (próximamente)

1. Docker + clonar repo o copiar `deploy/`.
2. Copiar `.env` (rotar token si circuló inseguro) y opcionalmente el volumen `zedazo-data`.
3. Misma orden con `docker-compose.remote.yml`.
4. Con **dominio público:** montar [`Caddyfile.public`](../../deploy/Caddyfile.public) (Let's Encrypt) y publicar `80`/`443` solo de Caddy.

## Rollback

1. Detener (`docker compose -f docker-compose.remote.yml down` sin `-v`).
2. Conservar volumen `zedazo-data`.
3. Usar CLI: `zedazo cribar entrada.vcf -o salida.vcf -a audit.tsv`.
4. No borrar artefactos hasta verificar recuperación.

## Coolify / VPS

Exponer solo tras HTTPS + `ZEDAZO_AUTH_MODE=token`. Preferir bind interno + reverse proxy / túnel. Nunca `disabled` en interfaz pública.
