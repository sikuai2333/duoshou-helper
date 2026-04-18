import {
  APP_SETTINGS_ID,
  DEFAULT_BUDGET,
  DEFAULT_MILK_TEA_CUPS,
  EXPORT_SCHEMA_VERSION,
} from "@/constants/app";
import { db } from "@/db";
import {
  getCurrentMonthKey,
  getDaysLeftInMonth,
  getMonthDate,
  getMonthProgressPercent,
  getTotalDaysInMonth,
} from "@/lib/date";
import { getDecisionSuggestion } from "@/lib/decision";
import type {
  AppSettings,
  DashboardSnapshot,
  ExportPayload,
  MilkTeaQuota,
  MonthlyBudget,
  RewardLog,
  SettingsSnapshot,
} from "@/types/domain";

async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.appSettings.get(APP_SETTINGS_ID);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const settings: AppSettings = {
    id: APP_SETTINGS_ID,
    defaultBudgetMode: "fixed",
    fixedBudgetValue: DEFAULT_BUDGET,
    defaultMilkTeaCups: DEFAULT_MILK_TEA_CUPS,
    onboardingDone: false,
    themeMode: "light",
    motionLevel: "full",
    updatedAt: now,
  };

  await db.appSettings.add(settings);

  return settings;
}

async function updateSettingsRecord(
  patch: Partial<Omit<AppSettings, "id" | "updatedAt">>,
): Promise<AppSettings> {
  const settings = await ensureSettings();
  const nextSettings: AppSettings = {
    ...settings,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  await db.appSettings.put(nextSettings);

  return nextSettings;
}

async function ensureMonthlyBudget(
  monthKey: string,
  settings: AppSettings,
): Promise<MonthlyBudget> {
  const existing = await db.monthlyBudgets.where("monthKey").equals(monthKey).first();

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const budget: MonthlyBudget = {
    id: `budget-${monthKey}`,
    monthKey,
    budget:
      settings.defaultBudgetMode === "manual"
        ? 0
        : (settings.fixedBudgetValue ?? DEFAULT_BUDGET),
    mode: settings.defaultBudgetMode,
    createdAt: now,
    updatedAt: now,
  };

  await db.monthlyBudgets.add(budget);

  return budget;
}

async function ensureMilkTeaQuota(
  monthKey: string,
  settings: AppSettings,
): Promise<MilkTeaQuota> {
  const existing = await db.milkTeaQuotas.where("monthKey").equals(monthKey).first();

  if (existing) {
    return existing;
  }

  const quota: MilkTeaQuota = {
    id: `milk-tea-${monthKey}`,
    monthKey,
    totalCups: settings.defaultMilkTeaCups,
    usedCups: 0,
    bonusCups: 0,
    updatedAt: new Date().toISOString(),
  };

  await db.milkTeaQuotas.add(quota);

  return quota;
}

async function addRewardCups({
  monthKey,
  amount,
  type,
  note,
  emoji,
}: {
  monthKey: string;
  amount: number;
  type: RewardLog["type"];
  note?: string;
  emoji: string;
}) {
  const settings = await ensureSettings();
  const quota = await ensureMilkTeaQuota(monthKey, settings);

  await db.milkTeaQuotas.update(quota.id, {
    bonusCups: quota.bonusCups + amount,
    updatedAt: new Date().toISOString(),
  });

  const reward: RewardLog = {
    id: crypto.randomUUID(),
    monthKey,
    type,
    amount,
    emoji,
    note,
    createdAt: new Date().toISOString(),
  };

  await db.rewardLogs.add(reward);
}

export const appRepository = {
  async initializeApp(monthKey = getCurrentMonthKey()) {
    const settings = await ensureSettings();

    await Promise.all([
      ensureMonthlyBudget(monthKey, settings),
      ensureMilkTeaQuota(monthKey, settings),
    ]);
  },

  async getSettings() {
    await this.initializeApp();
    return ensureSettings();
  },

  async getDashboardSnapshot(monthKey = getCurrentMonthKey()): Promise<DashboardSnapshot> {
    await this.initializeApp(monthKey);

    const [budgetRecord, quotaRecord, entries] = await Promise.all([
      db.monthlyBudgets.where("monthKey").equals(monthKey).first(),
      db.milkTeaQuotas.where("monthKey").equals(monthKey).first(),
      db.ledgerEntries.where("monthKey").equals(monthKey).toArray(),
    ]);

    const budget = budgetRecord?.budget ?? DEFAULT_BUDGET;
    const milkTeaQuota =
      quotaRecord ??
      ({
        id: `milk-tea-${monthKey}`,
        monthKey,
        totalCups: DEFAULT_MILK_TEA_CUPS,
        usedCups: 0,
        bonusCups: 0,
        updatedAt: new Date().toISOString(),
      } satisfies MilkTeaQuota);
    const monthSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const essentialSpent = entries
      .filter((entry) => entry.category === "essential")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const funSpent = entries
      .filter((entry) => entry.category === "fun")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const remainingBudget = budget - monthSpent;
    const referenceDate =
      monthKey === getCurrentMonthKey() ? new Date() : getMonthDate(monthKey);

    return {
      monthKey,
      budget,
      monthSpent,
      remainingBudget,
      essentialSpent,
      funSpent,
      totalEntries: entries.length,
      daysLeftInMonth: getDaysLeftInMonth(referenceDate),
      elapsedDays: referenceDate.getDate(),
      totalDaysInMonth: getTotalDaysInMonth(referenceDate),
      monthProgressPercent: getMonthProgressPercent(referenceDate),
      milkTeaQuota,
      latestEntries: [...entries]
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 4),
      suggestion: getDecisionSuggestion({
        remainingBudget,
        funSpent,
        essentialSpent,
        daysLeftInMonth: getDaysLeftInMonth(referenceDate),
      }),
    };
  },

  async getSettingsSnapshot(monthKey = getCurrentMonthKey()): Promise<SettingsSnapshot> {
    await this.initializeApp(monthKey);

    const [settings, currentBudget, currentQuota, totalEntries, totalRewards, trackedMonths] =
      await Promise.all([
        ensureSettings(),
        db.monthlyBudgets.where("monthKey").equals(monthKey).first(),
        db.milkTeaQuotas.where("monthKey").equals(monthKey).first(),
        db.ledgerEntries.count(),
        db.rewardLogs.count(),
        db.monthlyBudgets.count(),
      ]);

    return {
      settings,
      currentBudget:
        currentBudget ??
        ({
          id: `budget-${monthKey}`,
          monthKey,
          budget: settings.fixedBudgetValue ?? DEFAULT_BUDGET,
          mode: settings.defaultBudgetMode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } satisfies MonthlyBudget),
      currentQuota:
        currentQuota ??
        ({
          id: `milk-tea-${monthKey}`,
          monthKey,
          totalCups: settings.defaultMilkTeaCups,
          usedCups: 0,
          bonusCups: 0,
          updatedAt: new Date().toISOString(),
        } satisfies MilkTeaQuota),
      totalEntries,
      totalRewards,
      trackedMonths,
    };
  },

  async updateBudgetConfig({
    monthKey = getCurrentMonthKey(),
    budget,
    mode,
  }: {
    monthKey?: string;
    budget: number;
    mode: MonthlyBudget["mode"];
  }) {
    const now = new Date().toISOString();
    const settings = await ensureSettings();
    const existingBudget = await ensureMonthlyBudget(monthKey, settings);
    const nextSettings: AppSettings = {
      ...settings,
      defaultBudgetMode: mode,
      fixedBudgetValue: mode === "fixed" ? budget : settings.fixedBudgetValue,
      updatedAt: now,
    };

    await db.transaction("rw", db.appSettings, db.monthlyBudgets, async () => {
      await db.appSettings.put(nextSettings);

      await db.monthlyBudgets.put({
        ...existingBudget,
        budget,
        mode,
        updatedAt: now,
      });
    });
  },

  async updateDefaultMilkTeaCups({
    monthKey = getCurrentMonthKey(),
    totalCups,
  }: {
    monthKey?: string;
    totalCups: number;
  }) {
    const settings = await ensureSettings();
    const quota = await ensureMilkTeaQuota(monthKey, settings);
    const nextSettings: AppSettings = {
      ...settings,
      defaultMilkTeaCups: totalCups,
      updatedAt: new Date().toISOString(),
    };

    await db.transaction("rw", db.appSettings, db.milkTeaQuotas, async () => {
      await db.appSettings.put(nextSettings);

      await db.milkTeaQuotas.put({
        ...quota,
        totalCups,
        updatedAt: new Date().toISOString(),
      });
    });
  },

  async updateAppearance({
    themeMode,
    motionLevel,
  }: Partial<Pick<AppSettings, "themeMode" | "motionLevel">>) {
    await updateSettingsRecord({
      themeMode,
      motionLevel,
    });
  },

  async drinkMilkTea(monthKey = getCurrentMonthKey()) {
    await this.initializeApp(monthKey);
    const quota = await db.milkTeaQuotas.where("monthKey").equals(monthKey).first();

    if (!quota) {
      return;
    }

    const maxCups = quota.totalCups + quota.bonusCups;
    await db.milkTeaQuotas.update(quota.id, {
      usedCups: Math.min(quota.usedCups + 1, maxCups),
      updatedAt: new Date().toISOString(),
    });
  },

  async addBonusCup(monthKey = getCurrentMonthKey()) {
    await this.initializeApp(monthKey);
    await addRewardCups({
      monthKey,
      amount: 1,
      type: "exercise",
      emoji: "🚴",
      note: "手动奖励加一杯",
    });
  },

  async addManualBonusCups({
    monthKey = getCurrentMonthKey(),
    amount,
    note,
  }: {
    monthKey?: string;
    amount: number;
    note?: string;
  }) {
    await this.initializeApp(monthKey);
    await addRewardCups({
      monthKey,
      amount,
      type: "manual",
      emoji: "☕",
      note: note ?? "设置页手动加杯",
    });
  },

  async exportData(): Promise<ExportPayload> {
    const [ledgerEntries, monthlyBudgets, milkTeaQuotas, rewardLogs, appSettings] =
      await Promise.all([
        db.ledgerEntries.toArray(),
        db.monthlyBudgets.toArray(),
        db.milkTeaQuotas.toArray(),
        db.rewardLogs.toArray(),
        db.appSettings.toArray(),
      ]);

    return {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      ledgerEntries,
      monthlyBudgets,
      milkTeaQuotas,
      rewardLogs,
      appSettings,
    };
  },

  async importData(payload: ExportPayload, monthKey = getCurrentMonthKey()) {
    await db.transaction(
      "rw",
      [
        db.ledgerEntries,
        db.monthlyBudgets,
        db.milkTeaQuotas,
        db.rewardLogs,
        db.appSettings,
      ],
      async () => {
        await Promise.all([
          db.ledgerEntries.clear(),
          db.monthlyBudgets.clear(),
          db.milkTeaQuotas.clear(),
          db.rewardLogs.clear(),
          db.appSettings.clear(),
        ]);

        if (payload.ledgerEntries.length > 0) {
          await db.ledgerEntries.bulkPut(payload.ledgerEntries);
        }

        if (payload.monthlyBudgets.length > 0) {
          await db.monthlyBudgets.bulkPut(payload.monthlyBudgets);
        }

        if (payload.milkTeaQuotas.length > 0) {
          await db.milkTeaQuotas.bulkPut(payload.milkTeaQuotas);
        }

        if (payload.rewardLogs.length > 0) {
          await db.rewardLogs.bulkPut(payload.rewardLogs);
        }

        if (payload.appSettings.length > 0) {
          await db.appSettings.bulkPut(payload.appSettings);
        }
      },
    );

    await this.initializeApp(monthKey);
  },

  async clearAllData(monthKey = getCurrentMonthKey()) {
    await db.transaction(
      "rw",
      [
        db.ledgerEntries,
        db.monthlyBudgets,
        db.milkTeaQuotas,
        db.rewardLogs,
        db.appSettings,
      ],
      async () => {
        await Promise.all([
          db.ledgerEntries.clear(),
          db.monthlyBudgets.clear(),
          db.milkTeaQuotas.clear(),
          db.rewardLogs.clear(),
          db.appSettings.clear(),
        ]);
      },
    );

    await this.initializeApp(monthKey);
  },
};
