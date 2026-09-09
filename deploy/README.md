# Deploy

Guía canónica: [`docs/gui/deploy.md`](../docs/gui/deploy.md).

| Archivo | Uso |
|---------|-----|
| `docker-compose.yml` | Local loopback (auth disabled) |
| `docker-compose.remote.yml` | Remoto single-user (HTTPS + token, ADR-0016) |
| `.env.example` | Plantilla de `ZEDAZO_AUTH_TOKEN` |
| `Caddyfile` | Proxy remoto (`tls internal`) |
| `Caddyfile.local` | Profile `proxy` del compose local |
| `Caddyfile.public` | Ejemplo dominio + Let's Encrypt |
