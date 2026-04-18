export type CategoryType = "essential" | "fun";
export type BudgetMode = "fixed" | "manual";
export type RewardType = "exercise" | "manual";
export type MotionLevel = "full" | "reduced";
export type ThemeMode = "system" | "light" | "dark";
export type DecisionTone = "buy" | "wait" | "skip";

export interface LedgerEntry {
  id: string;
  amount: number;
  category: CategoryType;
  emoji: string;
  createdAt: string;
  monthKey: string;
}

export interface MonthlyBudget {
  id: string;
  monthKey: string;
  budget: number;
  mode: BudgetMode;
  createdAt: string;
  updatedAt: string;
}

export interface MilkTeaQuota {
  id: string;
  monthKey: string;
  totalCups: number;
  usedCups: number;
  bonusCups: number;
  updatedAt: string;
}

export interface RewardLog {
  id: string;
  monthKey: string;
  type: RewardType;
  amount: number;
  emoji: string;
  note?: string;
  createdAt: string;
}

export interface AppSettings {
  id: string;
  defaultBudgetMode: BudgetMode;
  fixedBudgetValue?: number;
  defaultMilkTeaCups: number;
  onboardingDone: boolean;
  themeMode: ThemeMode;
  motionLevel: MotionLevel;
  updatedAt: string;
}

export interface ExportPayload {
  schemaVersion: string;
  exportedAt: string;
  ledgerEntries: LedgerEntry[];
  monthlyBudgets: MonthlyBudget[];
  milkTeaQuotas: MilkTeaQuota[];
  rewardLogs: RewardLog[];
  appSettings: AppSettings[];
}

export interface DecisionSuggestion {
  tone: DecisionTone;
  title: string;
  description: string;
  reasons: string[];
}

export interface DashboardSnapshot {
  monthKey: string;
  budget: number;
  monthSpent: number;
  remainingBudget: number;
  essentialSpent: number;
  funSpent: number;
  totalEntries: number;
  daysLeftInMonth: number;
  elapsedDays: number;
  totalDaysInMonth: number;
  monthProgressPercent: number;
  milkTeaQuota: MilkTeaQuota;
  latestEntries: LedgerEntry[];
  suggestion: DecisionSuggestion;
}

export interface SettingsSnapshot {
  settings: AppSettings;
  currentBudget: MonthlyBudget;
  currentQuota: MilkTeaQuota;
  totalEntries: number;
  totalRewards: number;
  trackedMonths: number;
}

export interface QuickEntryInput {
  amount: number;
  category: CategoryType;
  emoji: string;
  monthKey?: string;
}

export interface LedgerEntryUpdateInput {
  amount: number;
  category: CategoryType;
  emoji: string;
}
