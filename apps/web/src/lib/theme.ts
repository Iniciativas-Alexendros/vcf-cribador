export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "zedazo-theme";

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

export function resolveEffectiveTheme(
  preference: ThemePreference,
): "light" | "dark" {
  if (preference === "light" || preference === "dark") return preference;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(preference: ThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const effective = resolveEffectiveTheme(preference);
  root.setAttribute("data-theme-preference", preference);
  root.setAttribute("data-theme", effective);
  root.classList.toggle("wa-dark", effective === "dark");
  root.classList.toggle("wa-light", effective === "light");
  root.style.colorScheme = effective;
}

export function persistTheme(preference: ThemePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, preference);
  applyTheme(preference);
}

/** Inline script for FOUC-free theme boot — keep in sync with helpers above. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k='zedazo-theme';var p=localStorage.getItem(k);if(p!=='light'&&p!=='dark'&&p!=='system')p='system';var d=document.documentElement;var dark=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=dark?'dark':'light';d.setAttribute('data-theme-preference',p);d.setAttribute('data-theme',e);d.classList.toggle('wa-dark',dark);d.classList.toggle('wa-light',!dark);d.style.colorScheme=e;}catch(e){}})();`;
