export const THEME_STORAGE_KEY = "clinixai-theme";

export type ThemeMode = "light" | "dark";

export function readStoredTheme(): ThemeMode | null {
  try {
    const s = localStorage.getItem(THEME_STORAGE_KEY);
    if (s === "light" || s === "dark") return s;
  } catch {
    /* ignore */
  }
  return null;
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function computeEffectiveTheme(preference: ThemeMode | null): ThemeMode {
  if (preference) return preference;
  return systemPrefersDark() ? "dark" : "light";
}

/** Syncs <html> class, color-scheme, and theme-color meta. */
export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";

  const meta = document.querySelector<HTMLMetaElement>("#meta-theme-color");
  if (meta) {
    meta.content = theme === "dark" ? "#0f172a" : "#2563EB";
  }
}
