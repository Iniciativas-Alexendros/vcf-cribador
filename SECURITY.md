# Política de Seguridad

## Reportar vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor **no abras un issue público**.

Envía un correo a los mantenedores del proyecto con los detalles. Responderemos en un plazo máximo de 48 horas.

## Versiones soportadas

| Versión | Soportada |
|---------|-----------|
| 0.5.x (CLI + API/GUI en `main`) | ✅ Código activo |
| 0.3.x (crates.io) | ✅ Publicada |
| 0.2.x / 0.1.x | ⚠️ Solo histórico |

## Consideraciones de seguridad

- **Archivos VCF**: Zedazo procesa archivos de contactos. No ejecutes la herramienta sobre archivos de fuentes no confiables sin revisarlos previamente.
- **Datos personales**: El VCF de salida, la auditoría TSV y el volumen `ZEDAZO_DATA_DIR` (jobs/uploads) contienen datos personales. Trátalos como el original.
- **API/GUI remota (ADR-0016)**:
  - Nunca `ZEDAZO_AUTH_MODE=disabled` en interfaz pública (fail-closed fuera de loopback).
  - Remoto: `token` + HTTPS (Caddy o túnel); rotar `ZEDAZO_AUTH_TOKEN` si se filtra.
  - No publicar puertos de `api`/`web` al WAN; solo el reverse proxy.
- **CardDAV (ADR-0018):** credenciales del proveedor (`ZEDAZO_CARDDAV_URL`, `ZEDAZO_CARDDAV_USERNAME`, `ZEDAZO_CARDDAV_PASSWORD`, opcional `ZEDAZO_CARDDAV_ADDRESSBOOK`) distintas de `ZEDAZO_AUTH_TOKEN` (GUI). No viajan por `zedazo.alexendros.dev`. Egreso opt-in vía `zedazo carddav`; el pipeline `cribar` sigue sin red por defecto. Write remoto exige `--confirm` + `If-Match`; HTTP 412 no sobrescribe. HTTPS (TLS 1.2+) obligatorio fuera de loopback; sin `insecure-skip-verify`. Ver [`docs/carddav.md`](docs/carddav.md).
- **Dependencias**: Usamos `cargo audit` semanalmente vía GitHub Actions.
