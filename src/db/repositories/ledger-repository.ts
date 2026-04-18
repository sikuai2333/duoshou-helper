import { db } from "@/db";
import { getCurrentMonthKey } from "@/lib/date";
import type {
  CategoryType,
  LedgerEntry,
  LedgerEntryUpdateInput,
  QuickEntryInput,
} from "@/types/domain";

export const ledgerRepository = {
  async addEntry({
    amount,
    category,
    emoji,
    monthKey = getCurrentMonthKey(),
  }: QuickEntryInput): Promise<LedgerEntry> {
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      amount,
      category,
      emoji,
      createdAt: new Date().toISOString(),
      monthKey,
    };

    await db.ledgerEntries.add(entry);

    return entry;
  },

  async listEntries(monthKey = getCurrentMonthKey()) {
    const entries = await db.ledgerEntries.where("monthKey").equals(monthKey).toArray();

    return entries.sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    );
  },

  async listEntriesByCategory(monthKey: string, category: CategoryType) {
    const entries = await db.ledgerEntries.where("monthKey").equals(monthKey).toArray();

    return entries
      .filter((entry) => entry.category === category)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  },

  async getEntry(id: string) {
    return db.ledgerEntries.get(id);
  },

  async updateEntry(id: string, input: LedgerEntryUpdateInput) {
    const existing = await db.ledgerEntries.get(id);

    if (!existing) {
      throw new Error("这条记录不存在，可能已经被删除。");
    }

    const nextEntry: LedgerEntry = {
      ...existing,
      ...input,
    };

    await db.ledgerEntries.put(nextEntry);

    return nextEntry;
  },

  async listAvailableMonths() {
    const budgets = await db.monthlyBudgets.toArray();
    const entries = await db.ledgerEntries.toArray();
    const monthKeys = new Set<string>();

    budgets.forEach((budget) => monthKeys.add(budget.monthKey));
    entries.forEach((entry) => monthKeys.add(entry.monthKey));

    return [...monthKeys].sort((left, right) => right.localeCompare(left));
  },

  async deleteEntry(id: string) {
    await db.ledgerEntries.delete(id);
  },
};
