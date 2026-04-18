"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { appRepository } from "@/db/repositories/app-repository";

export function useAppSettings() {
  const settings = useLiveQuery(() => appRepository.getSettings(), []);

  return {
    settings,
    isLoading: settings === undefined,
  };
}
