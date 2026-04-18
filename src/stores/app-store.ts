import { create } from "zustand";
import { getCurrentMonthKey } from "@/lib/date";

interface AppState {
  currentMonthKey: string;
  setCurrentMonthKey: (monthKey: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentMonthKey: getCurrentMonthKey(),
  setCurrentMonthKey: (monthKey) => set({ currentMonthKey: monthKey }),
}));
