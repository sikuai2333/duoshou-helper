"use client";

import { useReducedMotion } from "motion/react";
import { useAppSettings } from "@/hooks/use-app-settings";

export function useMotionPreference() {
  const reducedMotionFromSystem = Boolean(useReducedMotion());
  const { settings } = useAppSettings();

  return reducedMotionFromSystem || settings?.motionLevel === "reduced";
}
