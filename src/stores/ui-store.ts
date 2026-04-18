import { create } from "zustand";

interface UiState {
  isQuickEntryOpen: boolean;
  lastEntrySavedAt: number | null;
  editingEntryId: string | null;
  openQuickEntry: (entryId?: string | null) => void;
  closeQuickEntry: () => void;
  markEntrySaved: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isQuickEntryOpen: false,
  lastEntrySavedAt: null,
  editingEntryId: null,
  openQuickEntry: (entryId = null) =>
    set({ isQuickEntryOpen: true, editingEntryId: entryId }),
  closeQuickEntry: () => set({ isQuickEntryOpen: false, editingEntryId: null }),
  markEntrySaved: () => set({ lastEntrySavedAt: Date.now() }),
}));
