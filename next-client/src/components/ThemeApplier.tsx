"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * ThemeApplier — reads settings from Zustand and applies them live to <html>.
 * Must be rendered inside a client component that has access to the store.
 */
export default function ThemeApplier() {
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    const html = document.documentElement;

    // Remove all theme classes
    html.classList.remove("theme-dark", "theme-darker", "theme-midnight", "theme-light");
    // Apply new theme class
    html.classList.add(`theme-${settings.theme}`);

    // Accent color — set as CSS custom property
    html.style.setProperty("--accent-color", settings.accentColor);

    // Reduced motion class
    if (settings.reducedMotion) {
      html.classList.add("reduced-motion");
    } else {
      html.classList.remove("reduced-motion");
    }

    // Font size on body
    document.body.style.fontSize = `${settings.fontSize}px`;

    // Update body text/bg for light mode
    if (settings.theme === "light") {
      document.body.style.color = "#111827";
      document.body.style.background = "#f8f9fb";
    } else {
      document.body.style.color = "";
      document.body.style.background = "";
    }
  }, [settings.theme, settings.accentColor, settings.reducedMotion, settings.fontSize]);

  return null; // Renders nothing, just side effects
}
