---
version: "0.3.2"
date: "2026-09-09"
status: "Activo"
canonical: true
supersedes: "v0.3.1"
---

# AGENTS.md

**Versión:** 0.3.2  
**Fecha:** 2026-09-09  
**Propósito:** Contrato operativo para agentes de código en este repo.

---

## 1. Destinatario

- Implementas en Rust. El humano dirige, revisa diffs y fusiona.
- Español en commits, PRs y mensajes al humano.
- Una sesión = una unidad cohesiva. PR pequeño. CI verde antes de pedir revisión.

## 2. Fuentes de verdad (orden)

1. [README.md](./README.md)
2. Este archivo
3. Fase activa de [ROADMAP.md](./ROADMAP.md)
4. Requisitos citados en [SPECS.md](./SPECS.md)
5. Capas/CI en [ARCHITECTURE.md](./ARCHITECTURE.md)
6. [DECISIONS.md](./DECISIONS.md) antes de deps nuevas, majors, runners o `panic`/`profile`

NO inventes requisitos. Si falta ancla, paras y preguntas.

## 3. Ficha de unidad de trabajo

```
Objetivo: <resultado verificable>
Traza: <SPECS / ADR / issue>
Alcance: <archivos>
Exclusiones: <qué no harás>
Dependencias: <PR/rama previa>
Pruebas: make ci / cargo test --all-features
Criterio de cierre: CI verde + criterio SPECS
```

## 4. Autonomía

**Puedes sin preguntar**

- Implementar ítems ya especificados en SPECS + fase activa
- Tests que fijan comportamiento aceptado
- Corregir fmt/clippy/CI causados por tu cambio
- Refactors locales sin cambiar CLI pública

**Requiere confirmación**

- Dependencia nueva o major (sobre todo nom/toml/chardetng)
- Cambiar `panic`/`profile.release` o runners
- Features de red (CardDAV, watch)
- Alterar un ADR aceptado
- Publicar crates.io / tags de release (el humano lanza o confirma)

## 5. Working agreement

- Capas: `domain` puro; sin I/O. `unwrap` solo en tests.
- MSRV 1.80. Workspace: `cargo clippy --workspace -- -D warnings`.
- Fixtures 100 % sintéticos; nunca PII real.
- No mezclar upgrade de parser (nom 8) con features de dominio.
- Hooks: `make hooks` instala pre-commit (fmt + clippy). Documentado en CONTRIBUTING.
- GUI/API (ADR-0015): HTTP solo en `zedazo-api`; `zedazo-core` sin Axum/Tokio HTTP.

## 6. Comandos útiles

```bash
make hooks    # .githooks/install.sh
make ci       # fmt-check + clippy + test + check + doc + docs-validate + parity + web-ci
make release  # binario release
cargo llvm-cov --lcov --output-path coverage/lcov.info
```

## 7. Definition of Done

- Criterios de aceptación de la traza cumplidos
- `make ci` verde
- Docs canónicos actualizados si cambia contrato
- Sin secretos en el diff

## Learned User Preferences

- GUI V1 self-hosted: single-user (sin cuentas, sin colaboración, sin edición manual de contactos); local loopback por defecto y remoto vía ADR-0016 (HTTPS + token).
- Paridad CLI↔GUI = casos de uso funcionales del binario; la CLI sigue siendo la interfaz oficial de automatización/scripting (p. ej. `completion` no requiere pantalla web).
- No mezclar CardDAV u otras features de red con cambios de dominio o UI en la misma unidad de trabajo/PR.
- Identidad GUI «Archivo Vivo»: documental/preciso (no dashboard SaaS genérico); UI en español; temas claro/oscuro/sistema; colores de producción en `oklch()`.
- Wordmark lowercase **`zedazo`** (lockups/pestaña/README H1); prosa «Zedazo»; ids `zedazo` / `ZEDAZO_*` / `X-ZEDAZO-*` (ADR-0014, [`docs/brand.md`](./docs/brand.md)).
- No añadir PWA, notificaciones de job u otras extras de GUI sin ancla en SPECS/ADR.
- Si pide fusionar o «monitoriza merge», esperar CI verde y hacer merge; no empujar a `main` (PRs draft desde ramas `cursor/`).

## Learned Workspace Facts

- Workspace ADR-0015: `crates/zedazo-core`, `crates/zedazo-cli` (binario `zedazo`), `crates/zedazo-api` (Axum, `/api/v1`, SSE; `publish = false`), `apps/web` (Next.js).
- Dominio de producto ADR-0014: `https://zedazo.alexendros.dev`; landing estática `apps/landing/`; CNAME `zedazo` → host del operador (no Vercel por defecto); guía en `docs/gui/deploy.md`. GUI remota en ese host = `Caddyfile.public` same-origin (ADR-0016), no mezclar con CardDAV/TMview.
- Remoto ADR-0016: `ZEDAZO_AUTH_MODE=token`, cookie `zedazo_auth`, Compose [`deploy/docker-compose.remote.yml`](deploy/docker-compose.remote.yml) + Caddy same-origin; Docker local usa `ZEDAZO_AUTH_ALLOW_DISABLED_NON_LOOPBACK`.
- Jobs de la API aíslan datos por directorio de job; modo local sin red saliente por defecto; resultados GUI/API deben equivaler a CLI sobre los mismos fixtures.
- `make ci` = fmt-check + clippy + test + check + doc + `docs-validate` + `parity` (O10) + `web-ci` (`apps/web`).
- O10: harness HTTP en `crates/zedazo-api/tests/equivalence_http.rs` vía `make parity`; matriz en `docs/gui/functional-parity-matrix.md`.
- CI de GitHub Actions corre en `ubuntu-latest`; no hay runners self-hosted registrados.
- `make web-ci` incluye build de `apps/web` y Playwright e2e/a11y (excluye capturas `screenshots`).
