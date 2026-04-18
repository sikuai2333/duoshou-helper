"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { appRepository } from "@/db/repositories/app-repository";

export function useDashboardData(monthKey: string) {
  const snapshot = useLiveQuery(
    () => appRepository.getDashboardSnapshot(monthKey),
    [monthKey],
  );

  return {
    snapshot,
    isLoading: snapshot === undefined,
  };
}
