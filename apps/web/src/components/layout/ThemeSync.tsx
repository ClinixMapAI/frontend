import { useEffect } from "react";

import { useThemeStore } from "@/store/useThemeStore";
import {
  applyThemeToDocument,
  computeEffectiveTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
} from "@/utils/theme";

/**
 * Keeps the document in sync with the theme store and OS preference when the
 * user has not chosen an explicit light/dark mode.
 */
export function ThemeSync() {
  const preference = useThemeStore((s) => s.preference);
  const effective = useThemeStore((s) => s.effective);
  const setMode = useThemeStore((s) => s.setMode);

  useEffect(() => {
    applyThemeToDocument(effective);
  }, [effective]);

  useEffect(() => {
    if (readStoredTheme() !== null) return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next = computeEffectiveTheme(null);
      applyThemeToDocument(next);
      useThemeStore.setState({ preference: null, effective: next });
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [preference]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || event.newValue == null) return;
      if (event.newValue !== "light" && event.newValue !== "dark") return;
      setMode(event.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setMode]);

  return null;
}
