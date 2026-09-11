# CardDAV (primer slice)

**Traza:** [ADR-0018](../DECISIONS.md) (aceptada) · issue [#48](https://github.com/Iniciativas-Alexendros/zedazo/issues/48)

Cliente RFC 6352 de **solo lectura** en el crate `zedazo-carddav` (`publish = false`), consumido por la CLI. `zedazo-core` no tiene HTTP. La API/GUI **no** exponen CardDAV en este slice.

Write (PUT/DELETE), watch mode y filtros por categoría quedan para PRs posteriores. Este documento no cierra #48.

## Autenticación

HTTP Basic con usuario + **contraseña de aplicación** del proveedor. Credenciales distintas del token de GUI.

| Fuente | Claves |
|--------|--------|
| Entorno | `ZEDAZO_CARDDAV_URL`, `ZEDAZO_CARDDAV_USERNAME`, `ZEDAZO_CARDDAV_PASSWORD`, `ZEDAZO_CARDDAV_ADDRESSBOOK` (opcional) |
| TOML | sección `[carddav]` en `zedazo.toml` (`url`, `username`, `password`, `addressbook`) |
| CLI | `--url`, `--username`, `--addressbook`, `-c` / `--config` |

Prioridad: flags CLI > env > TOML. **Nunca** se lee `ZEDAZO_AUTH_TOKEN`. Preferir la contraseña en env, no en el fichero.

```toml
[carddav]
url = "https://cloud.example.test"
username = "ada"
# password = "…"  # mejor ZEDAZO_CARDDAV_PASSWORD
# addressbook = "https://cloud.example.test/remote.php/dav/addressbooks/users/ada/contacts/"
```

```bash
export ZEDAZO_CARDDAV_URL=https://cloud.example.test
export ZEDAZO_CARDDAV_USERNAME=ada
export ZEDAZO_CARDDAV_PASSWORD='contraseña-de-aplicación'
zedazo carddav list
zedazo carddav pull -o contactos.vcf
```

Una sola cuenta por configuración (cambiar de servidor = cambiar config).

## Descubrimiento

1. **URL de addressbook explícita** (`--addressbook` / `ZEDAZO_CARDDAV_ADDRESSBOOK` / `[carddav].addressbook`): se usa esa colección; no hace falta `/.well-known/carddav`.
2. **RFC 6764** `/.well-known/carddav` desde el origen de `ZEDAZO_CARDDAV_URL`, siguiendo redirecciones (p. ej. iCloud a `pNN-contacts.icloud.com`).
3. **Nextcloud / SabreDAV:** si well-known no responde, se prueba `{origen}/remote.php/dav/`.
4. Si la URL ya apunta a un path DAV (`/remote.php/dav/`, home-set, etc.), se usa como raíz.

Después: `current-user-principal` → `addressbook-home-set` → listado Depth 1 de addressbooks → GET de cada vCard (un request en vuelo). 429/503 honran `Retry-After` (segundos) con backoff.

## TLS

HTTPS obligatorio hacia hosts no-loopback (TLS 1.2+, rustls). Sin `insecure-skip-verify`. HTTP claro solo hacia `127.0.0.1`, `::1` o `localhost` (puente local). CA privada / skip-verify: PR posterior.

## Fuera de este slice

- PUT/DELETE, `If-Match` / ETag de escritura
- Watch / `sync-token` / CTag
- Filtros por categoría / `addressbook-query`
- OAuth Google / People API
- Proveedor Proton de primera clase (sigue export VCF)
- Endpoints CardDAV en `zedazo-api` / GUI
- Sync automático al arrancar

Tras el pull, el VCF local se procesa con `zedazo cribar` (pipeline sin red).
