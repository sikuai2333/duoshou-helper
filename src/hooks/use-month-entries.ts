"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { ledgerRepository } from "@/db/repositories/ledger-repository";

export function useMonthEntries(monthKey: string) {
  const entries = useLiveQuery(() => ledgerRepository.listEntries(monthKey), [monthKey]);

  return {
    entries,
    isLoading: entries === undefined,
  };
}
