import { format } from "date-fns";
import { z } from "zod";
import type { ExportPayload } from "@/types/domain";

const categorySchema = z.enum(["essential", "fun"]);
const budgetModeSchema = z.enum(["fixed", "manual"]);
const rewardTypeSchema = z.enum(["exercise", "manual"]);
const themeModeSchema = z.enum(["system", "light", "dark"]);
const motionLevelSchema = z.enum(["full", "reduced"]);
const monthKeySchema = z.string().regex(/^\d{4}-\d{2}$/u, "monthKey 格式必须是 yyyy-MM");

const ledgerEntrySchema = z.object({
  id: z.string().min(1),
  amount: z.number().finite().nonnegative(),
  category: categorySchema,
  emoji: z.string().min(1),
  createdAt: z.string().min(1),
  monthKey: monthKeySchema,
});

const monthlyBudgetSchema = z.object({
  id: z.string().min(1),
  monthKey: monthKeySchema,
  budget: z.number().finite().nonnegative(),
  mode: budgetModeSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const milkTeaQuotaSchema = z.object({
  id: z.string().min(1),
  monthKey: monthKeySchema,
  totalCups: z.number().int().nonnegative(),
  usedCups: z.number().int().nonnegative(),
  bonusCups: z.number().int().nonnegative(),
  updatedAt: z.string().min(1),
});

const rewardLogSchema = z.object({
  id: z.string().min(1),
  monthKey: monthKeySchema,
  type: rewardTypeSchema,
  amount: z.number().int().nonnegative(),
  emoji: z.string().min(1),
  note: z.string().optional(),
  createdAt: z.string().min(1),
});

const appSettingsSchema = z.object({
  id: z.string().min(1),
  defaultBudgetMode: budgetModeSchema,
  fixedBudgetValue: z.number().finite().nonnegative().optional(),
  defaultMilkTeaCups: z.number().int().nonnegative(),
  onboardingDone: z.boolean(),
  themeMode: themeModeSchema,
  motionLevel: motionLevelSchema,
  updatedAt: z.string().min(1),
});

export const exportPayloadSchema = z.object({
  schemaVersion: z.string().min(1),
  exportedAt: z.string().min(1),
  ledgerEntries: z.array(ledgerEntrySchema),
  monthlyBudgets: z.array(monthlyBudgetSchema),
  milkTeaQuotas: z.array(milkTeaQuotaSchema),
  rewardLogs: z.array(rewardLogSchema),
  appSettings: z.array(appSettingsSchema),
});

export function parseImportPayload(rawText: string): ExportPayload {
  const parsedJson = JSON.parse(rawText) as unknown;

  return exportPayloadSchema.parse(parsedJson);
}

export function downloadExportPayload(payload: ExportPayload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `duoshou-backup-${format(new Date(), "yyyyMMdd-HHmmss")}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
}
