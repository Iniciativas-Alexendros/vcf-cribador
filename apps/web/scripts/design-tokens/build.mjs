#!/usr/bin/env node
/**
 * DTCG (apps/web/tokens/) → CSS custom properties + tipos TS.
 * Sin Style Dictionary: passthrough OKLCH, cero deps npm nuevas (ADR-0019).
 *
 *   node scripts/design-tokens/build.mjs
 *   node scripts/design-tokens/build.mjs --check
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  WEB_ROOT,
  formatCssValue,
  loadTokenGraph,
  publicTokensByTheme,
  resolveInTheme,
  resolveToken,
} from "./load.mjs";
import { oklchToHex, parseOklchValue } from "./oklch.mjs";

const GENERATED_DIR = path.join(WEB_ROOT, "src/design-system/generated");
const TS_OUT = path.join(WEB_ROOT, "src/lib/design-tokens.ts");
const CHECK = process.argv.includes("--check");

const HEADER = `/**
 * GENERATED — no editar a mano.
 * Fuente: apps/web/tokens/ (DTCG). Regenerar: pnpm tokens:build
 */`;

const COMMON_ORDER = [
  "--zed-font-ui",
  "--zed-font-mono",
  "--zed-text-xs",
  "--zed-text-sm",
  "--zed-text-base",
  "--zed-text-md",
  "--zed-text-lg",
  "--zed-text-xl",
  "--zed-text-2xl",
  "--zed-text-3xl",
  "--zed-leading-tight",
  "--zed-leading-snug",
  "--zed-leading-normal",
  "--zed-leading-relaxed",
  "--zed-weight-regular",
  "--zed-weight-medium",
  "--zed-weight-semibold",
  "--zed-weight-bold",
  "--zed-space-1",
  "--zed-space-2",
  "--zed-space-3",
  "--zed-space-4",
  "--zed-space-5",
  "--zed-space-6",
  "--zed-space-8",
  "--zed-space-10",
  "--zed-space-12",
  "--zed-space-16",
  "--zed-space-20",
  "--zed-space-24",
  "--zed-radius-xs",
  "--zed-radius-sm",
  "--zed-radius-md",
  "--zed-radius-lg",
  "--zed-radius-xl",
  "--zed-radius-pill",
  "--zed-border-width",
  "--zed-focus-width",
  "--zed-focus-offset",
  "--zed-shadow-xs",
  "--zed-shadow-sm",
  "--zed-shadow-md",
  "--zed-content-readable",
  "--zed-content-wide",
  "--zed-sidebar-width",
  "--zed-topbar-height",
  "--zed-statusbar-height",
  "--zed-transition-fast",
  "--zed-transition-base",
  "--zed-transition-slow",
  "--zed-ease-standard",
  "--zed-target-min",
  "--zed-bp-md",
  "--zed-bp-lg",
  "--zed-z-shell",
  "--zed-z-drawer",
  "--zed-z-overlay",
  "--zed-z-modal",
  "--zed-control-height",
  "--zed-disabled-opacity",
  "--zed-textarea-min",
  "--zed-spin-duration",
];

const THEME_ORDER = [
  "--zed-bg-canvas",
  "--zed-bg-subtle",
  "--zed-bg-muted",
  "--zed-bg-raised",
  "--zed-bg-inverse",
  "--zed-overlay",
  "--zed-fg-strong",
  "--zed-fg-default",
  "--zed-fg-muted",
  "--zed-fg-subtle",
  "--zed-fg-inverse",
  "--zed-border-subtle",
  "--zed-border-default",
  "--zed-border-strong",
  "--zed-accent",
  "--zed-accent-hover",
  "--zed-accent-active",
  "--zed-accent-soft",
  "--zed-accent-on",
  "--zed-accent-border",
  "--zed-success",
  "--zed-success-hover",
  "--zed-success-soft",
  "--zed-success-on-soft",
  "--zed-warning",
  "--zed-warning-hover",
  "--zed-warning-soft",
  "--zed-warning-on-soft",
  "--zed-danger",
  "--zed-danger-hover",
  "--zed-danger-soft",
  "--zed-danger-on-soft",
  "--zed-info",
  "--zed-info-hover",
  "--zed-info-soft",
  "--zed-info-on-soft",
  "--zed-focus-ring",
  "--zed-selection-bg",
  "--zed-selection-fg",
  "--zed-code-bg",
  "--zed-code-fg",
  "--zed-badge-success-border",
  "--zed-badge-warning-border",
  "--zed-badge-danger-border",
  "--zed-badge-info-border",
];

const WA_BRIDGE = [
  ["--wa-color-brand-fill-loud", "var(--zed-accent)"],
  ["--wa-color-brand-fill-normal", "var(--zed-accent)"],
  ["--wa-color-brand-fill-quiet", "var(--zed-accent-soft)"],
  ["--wa-color-brand-on-loud", "var(--zed-accent-on)"],
  ["--wa-color-brand-on-normal", "var(--zed-accent-on)"],
  ["--wa-color-brand-on-quiet", "var(--zed-accent-active)"],
  ["--wa-color-success-fill-loud", "var(--zed-success)"],
  ["--wa-color-success-fill-quiet", "var(--zed-success-soft)"],
  ["--wa-color-success-on-quiet", "var(--zed-success-on-soft)"],
  ["--wa-color-warning-fill-loud", "var(--zed-warning)"],
  ["--wa-color-warning-fill-quiet", "var(--zed-warning-soft)"],
  ["--wa-color-warning-on-quiet", "var(--zed-warning-on-soft)"],
  ["--wa-color-danger-fill-loud", "var(--zed-danger)"],
  ["--wa-color-danger-fill-quiet", "var(--zed-danger-soft)"],
  ["--wa-color-danger-on-quiet", "var(--zed-danger-on-soft)"],
  ["--wa-focus-ring-color", "var(--zed-focus-ring)"],
  ["--wa-font-family-body", "var(--zed-font-ui)"],
  ["--wa-font-family-code", "var(--zed-font-mono)"],
];

export async function renderDesignTokens() {
  const graph = await loadTokenGraph();
  const groups = publicTokensByTheme(graph);

  const commonDecls = emitDecls(graph, groups.common, COMMON_ORDER, "common");
  const lightDecls = emitDecls(graph, groups.light, THEME_ORDER, "light");
  const darkDecls = emitDecls(graph, groups.dark, THEME_ORDER, "dark");

  const tokensCss = `${HEADER}

:root {
  color-scheme: light dark;
${commonDecls}
}
`;

  const themesCss = `${HEADER}

:root,
[data-theme="light"] {
${lightDecls}
}

[data-theme="dark"] {
${darkDecls}
}
`;

  const waBridgeCss = `${HEADER}

/* Bridge Web Awesome ← semánticos Zedazo (WA no es fuente de verdad). */
:root,
[data-theme="light"],
[data-theme="dark"] {
${WA_BRIDGE.map(([name, value]) => `  ${name}: ${value};`).join("\n")}
}
`;

  const canvasLight = colorHex(graph, "color.bg.canvas", "light");
  const canvasDark = colorHex(graph, "color.bg.canvas", "dark");
  const accentLight = colorHex(graph, "color.accent.default", "light");
  const accentOnLight = colorHex(graph, "color.accent.on", "light");

  const cssVars = collectCssVars(groups);
  const ts = emitTs(cssVars, {
    light: canvasLight,
    dark: canvasDark,
    faviconBg: accentLight,
    faviconFg: accentOnLight,
  });

  return {
    files: {
      [path.join(GENERATED_DIR, "tokens.css")]: tokensCss,
      [path.join(GENERATED_DIR, "themes.css")]: themesCss,
      [path.join(GENERATED_DIR, "wa-bridge.css")]: waBridgeCss,
      [TS_OUT]: ts,
    },
    hex: {
      themeColor: { light: canvasLight, dark: canvasDark },
      favicon: { background: accentLight, foreground: accentOnLight },
    },
  };
}

function emitDecls(graph, tokens, preferredOrder, theme) {
  const byVar = new Map();
  for (const token of tokens) {
    const resolved = resolveToken(graph, token.path, new Set(), theme);
    const css = formatCssValue(resolved.value, resolved.type ?? token.type);
    byVar.set(token.cssVar, css);
  }

  const ordered = [
    ...preferredOrder.filter((name) => byVar.has(name)),
    ...[...byVar.keys()].filter((name) => !preferredOrder.includes(name)).sort(),
  ];

  return ordered.map((name) => `  ${name}: ${byVar.get(name)};`).join("\n");
}

function colorHex(graph, tokenPath, theme) {
  const resolved = resolveInTheme(graph, tokenPath, theme);
  const oklch = parseOklchValue(resolved.value);
  if (!oklch) {
    throw new Error(`Token ${tokenPath} (${theme}) no es OKLCH estructurado`);
  }
  return oklchToHex(oklch);
}

function collectCssVars(groups) {
  const names = new Set();
  for (const list of Object.values(groups)) {
    for (const token of list) names.add(token.cssVar);
  }
  return [...names].sort();
}

function toCamel(cssVar) {
  return cssVar.replace(/^--zed-/, "").replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());
}

function emitTs(cssVars, hex) {
  const entries = cssVars.map((name) => `  ${toCamel(name)}: "${name}",`).join("\n");
  return `${HEADER}

export const zedCssVars = {
${entries}
} as const;

export type ZedCssVar = (typeof zedCssVars)[keyof typeof zedCssVars];
export type ZedCssVarName = keyof typeof zedCssVars;

/** Hex generado desde OKLCH (theme-color / favicon). No es origen. */
export const themeColorHex = {
  light: "${hex.light}",
  dark: "${hex.dark}",
} as const;

/** Hex generado desde accent / accent-on (tema claro) para el favicon. */
export const faviconHex = {
  background: "${hex.faviconBg}",
  foreground: "${hex.faviconFg}",
} as const;
`;
}

async function writeOrCheck(files) {
  let dirty = false;
  for (const [file, contents] of Object.entries(files)) {
    if (CHECK) {
      let current = null;
      try {
        current = await readFile(file, "utf8");
      } catch {
        current = null;
      }
      if (current !== contents) {
        dirty = true;
        console.error(`desactualizado: ${path.relative(WEB_ROOT, file)}`);
      }
    } else {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, contents, "utf8");
      console.log(`wrote ${path.relative(WEB_ROOT, file)}`);
    }
  }
  if (CHECK && dirty) {
    console.error("Ejecuta: pnpm tokens:build");
    process.exitCode = 1;
  } else if (CHECK) {
    console.log("tokens generados al día");
  }
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const { files } = await renderDesignTokens();
  await writeOrCheck(files);
}
