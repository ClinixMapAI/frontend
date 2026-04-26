import { create } from "zustand";

import {
  THEME_STORAGE_KEY,
  applyThemeToDocument,
  computeEffectiveTheme,
  readStoredTheme,
  type ThemeMode,
} from "@/utils/theme";

interface ThemeState {
  /** `null` = no explicit choice yet (follow system until user toggles). */
  preference: ThemeMode | null;
  effective: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const initialPreference =
  typeof window !== "undefined" ? readStoredTheme() : null;
const initialEffective =
  typeof window !== "undefined"
    ? computeEffectiveTheme(initialPreference)
    : "light";

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: initialPreference,
  effective: initialEffective,

  setMode: (mode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    applyThemeToDocument(mode);
    set({ preference: mode, effective: mode });
  },

  toggle: () => {
    const next: ThemeMode = get().effective === "light" ? "dark" : "light";
    get().setMode(next);
  },
}));
