"use client";

import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useAppBootstrap } from "@/hooks/use-app-bootstrap";

export function AppProviders({ children }: PropsWithChildren) {
  useAppBootstrap();
  const { settings } = useAppSettings();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyAppearance = () => {
      const resolvedTheme =
        settings?.themeMode === "system"
          ? media.matches
            ? "dark"
            : "light"
          : (settings?.themeMode ?? "light");

      root.dataset.theme = resolvedTheme;
      root.dataset.motion = settings?.motionLevel ?? "full";
    };

    applyAppearance();
    media.addEventListener("change", applyAppearance);

    return () => media.removeEventListener("change", applyAppearance);
  }, [settings?.motionLevel, settings?.themeMode]);

  return children;
}
