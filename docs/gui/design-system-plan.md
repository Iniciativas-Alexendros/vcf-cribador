# Plan de modernización del design system (GUI browser)

**Versión:** 0.1.1  
**Fecha:** 2026-09-11  
**Estado:** Plan. **Fase 1 aterrizada** (pipeline DTCG + contraste CI, [ADR-0019](../../DECISIONS.md)). Fases 2–4 pendientes.  
**Traza:** ADR-0015 (GUI local), ADR-0016 (remoto HTTPS+token), ADR-0019 (tokens), SPECS O10/O11, identidad «Archivo Vivo», [`docs/brand.md`](../brand.md), epic [#59](https://github.com/Iniciativas-Alexendros/zedazo/issues/59).  
**No mezclar** con CardDAV ([#48](https://github.com/Iniciativas-Alexendros/zedazo/issues/48) / ADR-0018) ni con cambios de dominio.

Este documento es la fuente de verdad para llevar los tokens OKLCH `--zed-*` ya existentes hasta una **GUI de browser profesional, acabada y sin costuras visuales**. La implementación vive en PRs posteriores, uno por fase (o slice menor), con CI verde.

---

## 1. Contexto y estado actual

La GUI V1 (`apps/web`, hitos v0.5.0 / v0.5.1) ya no es un prototipo vacío: cubre paridad funcional CLI↔GUI (O10), auth remoto (O11) e identidad documental «Archivo Vivo». El hueco no es de producto; es de **sistema de diseño**: tokens artesanales, recetas CSS duplicadas, cobertura a11y incompleta y ausencia de pipeline que impida regresiones de contraste o de costura visual.

### 1.1 Stack vigente

| Pieza | Estado (2026-09-11) |
|-------|---------------------|
| Next.js 15 App Router + React 19 + TypeScript | `apps/web`; `output: "standalone"` |
| Tokens | Fuente DTCG `apps/web/tokens/` → `generated/` + `src/lib/design-tokens.ts` (ADR-0019). Import path de `layout.tsx` estable (`tokens.css` / `themes.css`) |
| Color | **OKLCH** en claro/oscuro (`themes.css`); sombras también OKLCH |
| Temas | `light` / `dark` / `system` (`data-theme`, `localStorage` `zedazo-theme`, script anti-FOUC) |
| Tipografía | Atkinson Hyperlegible Next + IBM Plex Mono (self-hosted `@fontsource`, sin CDN) |
| Web Awesome `@awesome.me/webawesome` ^3.12 | Dependencia y `transpilePackages`; **ningún componente `<wa-*>` montado**. `WebAwesomeProvider` es un passthrough. Bridge `--wa-*` ← `--zed-*` en `themes.css`; clases `wa-light` / `wa-dark` en `<html>` |
| Playwright + `@axe-core/playwright` | `make web-ci`; tags `wcag2a` / `wcag2aa` / `wcag22aa` |
| Capturas | `e2e/screenshots.spec.ts` (opt-in `ZEDAZO_SCREENSHOTS=1`); no es regresión visual en CI |

### 1.2 Capas CSS actuales

Orden de carga en `layout.tsx`: `reset` → `tokens` → `themes` → `typography` → `motion` → `utilities` → `components` → `globals.css`.

- **Primitivos + semánticos** viven en JSON DTCG. `tokens.css` / `themes.css` son wrappers que importan `generated/` (fase 1). Recetas de componente siguen siendo CSS humano.
- **Recetas de componente** en `components.css` (`.zed-button`, `.zed-badge`, `.zed-card`, `.zed-input`, …).
- **CSS Modules** paralelos: `styles/shell.module.css`, `forms.module.css`, `tables.module.css`, `states.module.css`. Usan `--zed-*` pero conservan magics (`max-width: 272px`, paddings sueltos, breakpoints `900px` / `960px`).
- **Huecos residuales (fase 2+):** estilos inline en `/documentacion`; recetas que aún usan `color-mix` en callouts (los `--zed-badge-*-border` ya existen, sin cablear en fase 1 para no tocar recetas).

Fase 1 cubre JSON DTCG, build Node, tipos TS y check de contraste. No hay catálogo vivo todavía (fase 4).

### 1.3 Superficie de producto (rutas y bloques)

Rutas App Router: `/`, `/procesar`, `/ejecuciones`, `/ejecuciones/[jobId]`, `/auditar`, `/reglas`, `/acceso`, `/ajustes`, `/documentacion`.

Bloques React (inventario de partida para la fase 2):

| Área | Módulos |
|------|---------|
| Shell | `app-shell`, `topbar`, `app-sidebar`, `mobile-navigation`, `statusbar`, `page-header`, `auth-gate` |
| UI atómica | `button`, `icon-button`, `badge`, `card`, `callout`, `icon`, `empty-state`, `error-state`, `loading-state`, `filter-bar`, `stat-card`, `section-heading`, `metadata-list`, `progress-stepper`, `artifact-download`, `visually-hidden` |
| Jobs | `job-status`, `job-progress`, `job-summary`, `job-timeline`, `retention-notice` |
| Contactos | `contact-table`, `contact-drawer`, `contact-field`, `contact-result-badge`, `duplicate-group`, `duplicate-evidence`, `field-provenance` |
| Auditoría | `audit-timeline`, `audit-event`, `audit-reason` |
| Reglas | `toml-editor`, `rules-source-selector`, `rules-validation`, `rules-hash` |
| Marca | `zedazo-wordmark`, `zedazo-mark`, `product-lockup` |

### 1.4 A11y y QA hoy

`e2e/a11y.spec.ts` cubre **solo** `/`, `/procesar`, `/ejecuciones`. Quedan fuera `/acceso`, `/ajustes`, `/reglas`, `/auditar`, `/documentacion`, `/ejecuciones/[jobId]` y estados vacíos/error/job en curso.

Motion: `prefers-reduced-motion` ya anula animaciones/transiciones en `motion.css`. No hay tokens de duración/easing en un formato DTCG ni prueba de que el resto de módulos respeten el mismo contrato.

Contraste: `pnpm tokens:contrast` (fase 1) cubre pares semánticos light/dark en CI. Axe sigue cubriendo el DOM de tres rutas; la paleta completa de componentes queda para fases 2–4.

### 1.5 Restricciones de producto que el DS no puede romper

- Single-user self-hosted; UI en **español**; wordmark lowercase **`zedazo`** (ADR-0014).
- Identidad **documental/precisa**, no dashboard SaaS genérico.
- Sin CDN de terceros por defecto (ADR-0015); fuentes e iconos locales.
- CLI = canal oficial de automatización; la GUI no duplica `completions`.
- Sin PWA, sin notificaciones de job, sin extras de GUI sin ancla SPECS/ADR.
- Paridad O10 intacta: este plan **no** cambia semántica de cribado, jobs ni artefactos.

---

## 2. Objetivo

Una GUI de browser **acabada y profesional** sobre ADR-0015/0016: misma paridad funcional, misma amenaza/modelo de auth, pero con un sistema de diseño que se siente de una pieza.

**Acabada** significa:

1. Un solo origen de tokens (DTCG) genera CSS y tipos; no hay hex/rgb/hsl de producción ni magics de spacing en componentes.
2. Claro, oscuro y sistema sin FOUC ni puentes rotos con Web Awesome (si se conserva).
3. Componentes atómicos + patrones de pantalla alineados: mismo radio, foco, densidad, copy y movimiento.
4. WCAG 2.2 AA verificable en **todas** las rutas y en los pares de color del tema.
5. Catálogo consultable (`/documentacion/ds` o Storybook) y DoD de QA (axe + contraste + regresión visual) en CI.
6. Cero costuras: ni un control «de librería» y otro «hecho a mano» con tipografía, foco o hue distintos.

Fuera de este objetivo: nuevas features de dominio, CardDAV, multi-usuario, OAuth de producto, OTel.

---

## 3. Estándares

| Norma | Cómo aplica en Zedazo |
|-------|------------------------|
| [W3C Design Tokens (DTCG)](https://tr.designtokens.org/format/) | Fuente JSON (`$value`, `$type`, `$description`). Grupos por capa. Sin inventar un schema paralelo. |
| OKLCH en producción | Color, sombras, `color-mix(in oklch, …)`. Hex solo como *fallback* generado o `theme-color` derivado del token, nunca como origen. |
| [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) | Texto 4.5:1 (3:1 si ≥18 pt / 14 pt bold); UI no-texto y foco 3:1; target size 2.2 (24 px CSS o equivalente con spacing); focus visible; reduced motion. |
| [ARIA APG](https://www.w3.org/WAI/ARIA/apg/) | Patrones: disclosure (drawer), tabs si aparecen, combobox/listbox (filtros), grid/table (contactos), dialog (confirmaciones), switch/radio (tema). Preferir HTML nativo. |
| Tokens en capas | **Primitivo → semántico → componente**. Los componentes no apuntan a ramps crudas (`color.blue.600`); apuntan a `--zed-accent`, `--zed-fg-default`, `--zed-space-3`. |
| Motion | Duraciones/easing en tokens. Animación solo bajo `prefers-reduced-motion: no-preference`. Spinners y transiciones de shell incluidos. |
| Tipografía | Escala y pesos tokenizados; Atkinson para UI, Plex Mono para hashes/TOML/código. Sin toggle de densidad (el zoom del sistema basta; ya documentado en Ajustes). |
| i18n de UI | Copy en español; `lang="es"` en `<html>`; nombres accesibles del lockup = `zedazo`. |

**Contraste y OKLCH.** WCAG 2.2 sigue midiendo luminancia relativa sRGB, no L de OKLCH. El pipeline debe convertir a sRGB lineal antes del ratio. APCA puede usarse como métrica *informativa* en el catálogo; el gate de CI es WCAG 2.2 AA.

**No-objetivos de estándar (esta modernización):** WCAG 2.2 AAA, APCA como gate, modo alto contraste propio del SO (se respeta `prefers-contrast` si es barato; no es fase 1).

---

## 4. Arquitectura

### 4.1 Pipeline de tokens

```
apps/web/tokens/                    # fuente DTCG (humano + revisión en PR)
  primitive/                        # color ramps, space, type, radius, motion, z
  semantic/
    color.light.json
    color.dark.json
    typography.json
    elevation.json
  component/                        # button, badge, input, table, shell, …
        │
        ▼
script Node (apps/web/scripts/design-tokens/) — ADR-0019
        │  (Style Dictionary diferido; sin deps npm nuevas)
        ├─► src/design-system/generated/tokens.css     # :root primitivos + layout
        ├─► src/design-system/generated/themes.css     # [data-theme=light|dark]
        ├─► src/design-system/generated/wa-bridge.css  # --wa-* ← semánticos Zedazo
        └─► src/lib/design-tokens.ts                   # union types + hex generado
        │
        ▼
CSS humano (no generado)
  reset.css · typography.css · motion.css · utilities.css · components.css
  styles/*.module.css  →  solo var(--zed-*) / clases .zed-*
```

Reglas:

1. **`generated/` no se edita a mano.** Artefactos **commiteados** + `pnpm tokens:check` en `web-ci` (ADR-0019). No mezclar con generate-on-CI sin el check.
2. Recetas (`.zed-button`, etc.) siguen siendo CSS revisable por humanos; consumen semánticos/componente, no primitivos.
3. Nombres de custom property: `--zed-{layer}-{name}` ya usado (`--zed-accent`, `--zed-space-4`). El build debe **preservar** esos nombres públicos para no romper módulos existentes en el primer slice.
4. Temas: `data-theme="light|dark"` como hoy; `system` resuelve en boot script. El JSON semántico tiene dos sets; no hay tercer tema «system» en tokens.
5. Dep nueva (`style-dictionary` u otra) = **confirmación** AGENTS §4 en el PR de fase 1. Alternativa aceptable si el ADR corto lo justifica: script Node propio que lea DTCG y emita CSS/TS, sin Style Dictionary.

### 4.2 Capas de tokens (contrato)

| Capa | Ejemplo | Quién consume |
|------|---------|----------------|
| Primitivo | `color.accent.600` = OKLCH 0.53 0.16 257; `space.4` = 1rem | Solo semantic / build |
| Semántico | `color.fg.default`, `color.bg.canvas`, `color.accent`, `focus.ring` | CSS de receta, módulos de pantalla |
| Componente | `button.primary.bg`, `table.header.fg`, `shell.sidebar.width` | Receta de ese componente |

Alias semánticos actuales a conservar (mapeo, no rename breaking en fase 1):

`--zed-bg-{canvas,subtle,muted,raised,inverse}`, `--zed-fg-{strong,default,muted,subtle,inverse}`, `--zed-border-{subtle,default,strong}`, `--zed-accent` + hover/active/soft/on, `--zed-{success,warning,danger,info}` + hover/soft/on-soft, `--zed-focus-ring`, `--zed-selection-*`, `--zed-code-*`, escala `--zed-text-*`, `--zed-space-*`, `--zed-radius-*`, `--zed-shadow-*`, `--zed-transition-*`, `--zed-ease-standard`, layout `--zed-content-*`, `--zed-sidebar-width`, `--zed-topbar-height`, `--zed-statusbar-height`.

Añadidos en fase 1 (aditivos, sin cablear recetas): `--zed-bp-md` / `--zed-bp-lg`, `--zed-target-min`, `--zed-z-shell` / `--zed-z-drawer`, `--zed-badge-*-border`. `theme-color` y favicon usan hex **generado** desde canvas / accent (`themeColorHex`, `faviconHex`).

### 4.3 Frontera con Web Awesome

Web Awesome **no** es la fuente de verdad visual. Hoy ni siquiera pinta controles.

Decisión a fijar en fase 1 (ADR corto si cambia el contrato):

| Opción | Cuándo |
|--------|--------|
| **A. Conservar como kit opcional** | Si fase 2 necesita un primitive WA (p. ej. `wa-select` rico) *y* el bridge `--wa-*` replica contraste OKLCH. Prohibido importar CSS de tema WA que pise `--zed-*`. Sin CDN. |
| **B. Retirar la dependencia** | Si el inventario de fase 2 confirma cero uso real (estado actual). Menos superficie, menos `transpilePackages`. |

Hasta esa decisión: no montar componentes WA nuevos en PRs de pantalla. El bridge `--wa-*` se genera desde semánticos Zedazo, no al revés.

### 4.4 Catálogo

Preferencia: **`/documentacion/ds`** dentro de `apps/web` (misma app, mismo tema, cero SaaS, copy en español). Storybook solo si el catálogo desborda una página Next (dep nueva → confirmación). El catálogo no es PWA ni sustituye `docs/gui/` canónico.

### 4.5 Lo que no entra en este pipeline

- `apps/landing/` (ficha pública estática; wordmark sí, tokens de GUI no).
- Estilos de `zedazo-api` (no hay UI).
- Tokens de marca verbal (`docs/brand.md`): el wordmark no dicta la paleta; la paleta no cambia el wordmark.

---

## 5. Entrega por fases

Cada fase = uno o más PRs **pequeños**, CI verde, **sin** CardDAV, **sin** cambios de `zedazo-core` salvo que un test de contraste viva en otro crate (no hace falta). Implementación **después** de aterrizar este plan.

### Fase 1 — Fundación

**Objetivo:** tokens como producto, no como CSS copiado.

- [x] Árbol `apps/web/tokens/` DTCG que reproduce 1:1 los `--zed-*` actuales (migración sin cambio visual de recetas).
- [x] Build Node (equivalente a Style Dictionary; ADR-0019) → CSS generado + `design-tokens.ts`.
- [x] Política de artefacto: **commit + `tokens:check`** (no generate-on-CI suelto).
- [x] Check de contraste WCAG 2.2 AA sobre pares semánticos light **y** dark; enganchado a `make web-ci` y al job Web.
- [x] `theme-color` / favicon derivados del token (hex generado; fin del hex huérfano en `layout.tsx` / `icon.tsx`).
- [x] **ADR-0019 aceptada:** script Node sin deps nuevas; WA aplazado a fase 2; `--zed-*` estables.
- [x] Tests: snapshot de OKLCH públicos + contrast checker con pares sintéticos (no PII).

**Criterio de salida:** `pnpm` build + contrast check verdes; GUI pixel-compatible con main en recetas/módulos (sin rediseño). Diff de UI accidental = fallo de la fase. *Hecho (2026-09-11).*

### Fase 2 — Componentes atómicos

**Objetivo:** un inventario y una receta por control.

1. Inventario (tabla en el PR o en este doc, apéndice): cada `components/ui/*` + clases `.zed-*` + CSS modules que estilan átomos.
2. Unificar: magics → tokens; inline styles → clases; duplicar `.zed-button` vs `<Button>` resuelto (un API React).
3. Contratos APG: foco visible, `disabled`, `aria-*` mínimos, tamaño de diana ≥ 24 px CSS (`--zed-target-min`).
4. Decisión A/B sobre Web Awesome (apartado 4.3) ejecutada: o bridge generado estable, o `package.json` sin `@awesome.me/webawesome`.
5. Sin rediseño de pantallas enteras (eso es fase 3). Permitido ajustar un átomo si todas sus instancias cambian igual.

**Criterio de salida:** ningún color/spacing hardcodeado en `components/ui`; axe de `/` y `/procesar` sigue a cero violaciones; catálogo mínimo (botón, badge, input, callout, card) aunque `/documentacion/ds` se complete en fase 4.

### Fase 3 — Patrones y pantallas

**Objetivo:** shell y flujos sin costuras.

Orden sugerido (PRs separados si el diff crece):

1. **Shell:** topbar, sidebar, statusbar, skip link, nav móvil, page header. Breakpoints tokenizados. Comportamiento `prefers-reduced-motion` en el drawer móvil.
2. **Formularios:** `/procesar`, `/reglas`, `/acceso`, `/ajustes` (tema, wipe, login). `zed-input` / select / file / checkbox con el mismo foco y error.
3. **Tablas y fichas:** contactos, duplicados, drawer. Densidad de `contact-table` alineada a `--zed-text-sm` / space tokens (Ajustes ya avisa que no hay toggle de densidad).
4. **Jobs y auditoría:** stepper, timeline, estados `queued|running|succeeded|failed|canceled`, retención.
5. **Estados:** empty / loading / error / privacy callouts — misma ilustración tipográfica, no tres empty-states distintos.

Copy: español, tono archivo (preciso, no marketing). Wordmark intocable.

**Criterio de salida:** las nueve rutas se sienten del mismo producto en light y dark; O10 y O11 sin cambios de comportamiento.

### Fase 4 — Acabado y QA

**Objetivo:** que no se deshaga.

- Catálogo `/documentacion/ds` (preferido) o Storybook (si se justifica).
- Axe **todas** las rutas de §1.3 + estados representativos (vacío, error, job running con fixture sintético).
- Regresión visual: `toHaveScreenshot` de Playwright en CI (chromium, light+dark, desktop; un viewport móvil del shell). Las capturas actuales de `docs/screenshots/` se regeneran al cerrar la fase; no mezclar con el job `screenshots` opt-in hasta que el baseline sea estable.
- DoD de esta sección 7 cumplido; este plan marcado **ejecutado** (fecha) o sustituido por un changelog de tokens.
- README / `/documentacion` enlazan el catálogo. Sin PWA.

**Criterio de salida:** `make ci` verde con la matriz de §6; epic [#59](https://github.com/Iniciativas-Alexendros/zedazo/issues/59) cerrable.

---

## 6. Validación y matriz de pruebas

| Capa | Qué | Dónde | Gate |
|------|-----|-------|------|
| Tokens | JSON DTCG válido; nombres `--zed-*` públicos estables | `tokens/` + build | `web-ci` |
| Contraste | Pares semánticos light/dark (fg/bg, accent-on/accent, estado soft/on-soft, foco 3:1) | script Node en `apps/web` | `web-ci` |
| Unidad | Contrast checker; resolución de tema `system` | `node --test` o Vitest *si* se añade (dep → confirmar) | `web-ci` |
| e2e funcional | Marca, CTAs, skip link, Procesar, Ejecuciones (ya existe) | `e2e/a11y.spec.ts` parte nav | `web-ci` |
| axe 2.2 AA | Cada ruta de §1.3 | ampliar `a11y.spec.ts` | `web-ci` (fase 4; ir añadiendo rutas desde fase 3) |
| Visual | Shell + pantallas clave light/dark | Playwright screenshots en CI | `web-ci` fase 4 |
| Reduced motion | Spinner/shell no animan bajo `prefers-reduced-motion: reduce` | e2e o unit CSS | fase 4 |
| Paridad O10 | Equivalencia CLI↔API | `make parity` | **no** se toca |
| Auth O11 | Login cookie / Bearer | `auth_http` | **no** se toca |
| Docs | Enlaces internos | `make docs-validate` | siempre |

Fixtures: 100 % sintéticos. Jobs de axe contra API local pueden usar el sample de `examples/sample.vcf`, nunca agendas reales.

**Rutas axe (objetivo fase 4):** `/`, `/procesar`, `/ejecuciones`, `/ejecuciones/[jobId]` (con job sintético o empty), `/auditar`, `/reglas`, `/acceso`, `/ajustes`, `/documentacion`, `/documentacion/ds`.

**Pares de contraste mínimos (fase 1):**

- `fg.strong` / `fg.default` sobre `bg.canvas` y `bg.raised`
- `fg.muted` sobre `bg.canvas` (si no llega a 4.5:1, o se oscurece el token o se restringe a texto no esencial / 3:1 UI)
- `accent-on` sobre `accent` / `accent-hover` / `accent-active`
- `{success,warning,danger,info}-on-soft` sobre el `*-soft` correspondiente
- `focus-ring` vs `bg.canvas` ≥ 3:1
- Inverso: `fg.inverse` sobre `bg.inverse` (skip link)

---

## 7. Definition of Done

Checklist del **programa** (no de este PR de docs). Cada fase tiene su propio DoD local; esto cierra [#59](https://github.com/Iniciativas-Alexendros/zedazo/issues/59).

- [x] Fuente DTCG única; CSS/TS generados; `--zed-*` públicos documentados. *(fase 1)*
- [x] OKLCH en origen de tokens; hex solo como fallback generado (`themeColorHex` / `faviconHex`). Los modules aún pueden tener magics (fase 2).
- [x] Temas claro / oscuro / sistema sin FOUC; `theme-color` alineado al canvas (hex generado).
- [x] Contraste WCAG 2.2 AA en CI para pares semánticos. *(fase 1)*
- [ ] Átomos y CSS modules sin magics; un API React por control.
- [ ] Frontera WA resuelta (bridge generado **o** dependencia retirada).
- [ ] Pantallas de §5 fase 3 sin costura light/dark; copy ES; wordmark lowercase.
- [ ] Catálogo `/documentacion/ds` (o Storybook justificado).
- [ ] Axe 2.2 AA en todas las rutas de la matriz; reduced-motion cubierto.
- [ ] Regresión visual light+dark en CI; capturas README regeneradas.
- [ ] `make ci` verde; O10/O11 intactos; sin secretos en el diff.
- [ ] PRs de implementación **no** mezclan CardDAV, dominio ni majors de parser.
- [ ] Docs canónicos: este plan marcado ejecutado; `docs/brand.md` sigue siendo wordmark, no paleta.

**Este PR de documentación** cierra solo el ancla escrita: el archivo existe, ROADMAP/brand enlazan, y el epic [#59](https://github.com/Iniciativas-Alexendros/zedazo/issues/59) apunta aquí. No cierra el epic.

---

## 8. Fuera de alcance

| Ítem | Por qué |
|------|---------|
| GUI CardDAV / sync en pantallas | [#48](https://github.com/Iniciativas-Alexendros/zedazo/issues/48), ADR-0018; PRs de red **separados** de UI |
| Multi-usuario, colaboración, edición manual de contactos | SPECS §3; no cubierto por ADR-0016 |
| Cuentas OAuth/OIDC de *producto* Zedazo | SPECS §3; OAuth de *proveedor* Google es otro slice CardDAV, no DS |
| OpenTelemetry / OTLP | ADR-0017, post-v1.0 |
| PWA, push, toasts de job, toggle de densidad | Sin ancla SPECS/ADR |
| Rediseño de `apps/landing/` o del logomark | Marca ≠ DS de GUI |
| Cambiar CLI, OpenAPI, semántica de jobs | O10/O11 no se renegocian aquí |
| Nom 8, majors de toml/chardetng | AGENTS: no mezclar con UI |
| Publicar Storybook/Chromatic SaaS | Preferir catálogo in-app + Playwright; SaaS = confirmación |

---

## 9. Issues y slicing de PRs

Epic: [#59](https://github.com/Iniciativas-Alexendros/zedazo/issues/59) — *GUI: modernizar design system (OKLCH tokenizado → GUI profesional)*.

Los títulos siguientes son **sugeridos** para issues/PRs de implementación (no se abren en esta unidad salvo el epic). Cada PR: una fase o un slice de pantalla; base `main`; **sin** archivos CardDAV ni `crates/zedazo-core` de dominio.

| Orden | Título sugerido | Notas |
|-------|-----------------|-------|
| 1 | `GUI DS fase 1: pipeline DTCG → CSS custom properties + tipos TS` | Dep Style Dictionary (o script) + confirmación AGENTS §4 |
| 1b | `GUI DS: check CI de contraste WCAG 2.2 sobre tokens OKLCH` | Puede ir en el mismo PR que 1 si el diff cabe |
| 1c | `docs: ADR-0019 fuente de tokens GUI (DTCG + frontera Web Awesome)` | Solo si hay dep nueva o se retira WA |
| 2 | `GUI DS fase 2: inventario atómico y unificar CSS modules a --zed-*` | Sin rediseño de rutas |
| 2b | `GUI DS: retirar Web Awesome` **o** `GUI DS: bridge --wa-* generado` | Una de las dos, no ambas |
| 3a | `GUI DS fase 3: shell (topbar, nav, statusbar, skip link)` | Breakpoints tokenizados |
| 3b | `GUI DS fase 3: formularios (procesar, reglas, acceso, ajustes)` | |
| 3c | `GUI DS fase 3: tablas, drawer de contacto y duplicados` | |
| 3d | `GUI DS fase 3: jobs, auditoría y estados vacíos/error` | |
| 4a | `GUI DS fase 4: catálogo /documentacion/ds` | Preferido a Storybook |
| 4b | `GUI DS fase 4: axe en todas las rutas + visual regression Playwright` | Regenerar `docs/screenshots/` |

Reglas de slicing:

- Un PR de DS **no** toca `zedazo-carddav`, OpenAPI, ni reglas de cribado.
- Un PR de CardDAV **no** retoca `design-system/` ni CSS modules de chrome.
- Si un slice necesita dep nueva (Storybook, Vitest, Style Dictionary): un ADR o un párrafo en DECISIONS + confirmación humana.
- Español en título de issue/PR y commits.

---

## Referencias

- ADR-0014 marca · ADR-0015 GUI local · ADR-0016 remoto · ADR-0017 OTel (fuera) · ADR-0018 CardDAV (fuera) · ADR-0019 tokens GUI
- [`docs/brand.md`](../brand.md) · [`docs/gui/functional-parity-matrix.md`](./functional-parity-matrix.md) · [`docs/gui/threat-model.md`](./threat-model.md)
- [W3C Design Tokens Format Module](https://tr.designtokens.org/format/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [ARIA APG](https://www.w3.org/WAI/ARIA/apg/)
- Código de partida: `apps/web/src/design-system/`, `apps/web/src/components/`, `apps/web/e2e/a11y.spec.ts`
