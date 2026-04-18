import Dexie, { type Table } from "dexie";
import type {
  AppSettings,
  LedgerEntry,
  MilkTeaQuota,
  MonthlyBudget,
  RewardLog,
} from "@/types/domain";

export class DuoshouDatabase extends Dexie {
  ledgerEntries!: Table<LedgerEntry, string>;
  monthlyBudgets!: Table<MonthlyBudget, string>;
  milkTeaQuotas!: Table<MilkTeaQuota, string>;
  rewardLogs!: Table<RewardLog, string>;
  appSettings!: Table<AppSettings, string>;

  constructor() {
    super("duoshou-helper");

    this.version(1).stores({
      ledgerEntries: "&id, monthKey, category, createdAt",
      monthlyBudgets: "&id, &monthKey, mode, updatedAt",
      milkTeaQuotas: "&id, &monthKey, updatedAt",
      rewardLogs: "&id, monthKey, type, createdAt",
      appSettings: "&id, updatedAt",
    });
  }
}
