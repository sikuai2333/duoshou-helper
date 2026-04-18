"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { appRepository } from "@/db/repositories/app-repository";

export function useSettingsData(monthKey: string) {
  const snapshot = useLiveQuery(
    () => appRepository.getSettingsSnapshot(monthKey),
    [monthKey],
  );

  return {
    snapshot,
    isLoading: snapshot === undefined,
  };
}
