"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { z, ZodError } from "zod";
import { appRepository } from "@/db/repositories/app-repository";
import { useSettingsData } from "@/hooks/use-settings-data";
import { downloadExportPayload, parseImportPayload } from "@/lib/export-import";
import { useAppStore } from "@/stores/app-store";
import type { BudgetMode, MotionLevel, ThemeMode } from "@/types/domain";
import { AppShell } from "@/components/common/app-shell";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const budgetSchema = z.coerce.number().finite().positive().max(999999);
const cupsSchema = z.coerce.number().int().positive().max(99);
const rewardSchema = z.coerce.number().int().positive().max(20);

function resolveErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "输入格式不正确";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "操作失败";
}

function SettingRow({
  label,
  value,
  action,
}: {
  label: string;
  value?: string;
  action?: ReactNode;
}) {
  return (
    <div className="list-row flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {value ? <p className="text-xs text-text-muted">{value}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SettingsPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const { snapshot } = useSettingsData(currentMonthKey);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [budgetDraft, setBudgetDraft] = useState("");
  const [modeDraft, setModeDraft] = useState<BudgetMode | null>(null);
  const [cupsDraft, setCupsDraft] = useState("");
  const [rewardDraft, setRewardDraft] = useState("1");
  const [toast, setToast] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectedMode = modeDraft ?? snapshot?.currentBudget.mode ?? "fixed";
  const budgetValue = budgetDraft || snapshot?.currentBudget.budget.toString() || "";
  const cupsValue = cupsDraft || snapshot?.settings.defaultMilkTeaCups.toString() || "";

  const runTask = async (task: () => Promise<void>, successText: string) => {
    setIsBusy(true);
    setToast(null);

    try {
      await task();
      setToast({
        tone: "success",
        text: successText,
      });
    } catch (error) {
      setToast({
        tone: "error",
        text: resolveErrorMessage(error),
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleBudgetSave = async () => {
    const budget = budgetSchema.parse(budgetValue);
    await runTask(
      async () => {
        await appRepository.updateBudgetConfig({ monthKey: currentMonthKey, budget, mode: selectedMode });
        setBudgetDraft("");
      },
      "预算已保存",
    );
  };

  const handleCupsSave = async () => {
    const totalCups = cupsSchema.parse(cupsValue);
    await runTask(
      async () => {
        await appRepository.updateDefaultMilkTeaCups({ monthKey: currentMonthKey, totalCups });
        setCupsDraft("");
      },
      "奶茶默认杯数已保存",
    );
  };

  const handleRewardAdd = async () => {
    const amount = rewardSchema.parse(rewardDraft);
    await runTask(
      async () => {
        await appRepository.addManualBonusCups({ monthKey: currentMonthKey, amount });
        setRewardDraft("1");
      },
      "已加杯",
    );
  };

  const handleThemeChange = (themeMode: ThemeMode) =>
    runTask(() => appRepository.updateAppearance({ themeMode }), "主题已更新");

  const handleMotionChange = (motionLevel: MotionLevel) =>
    runTask(() => appRepository.updateAppearance({ motionLevel }), "动效设置已更新");

  const handleExport = () =>
    runTask(async () => {
      const payload = await appRepository.exportData();
      downloadExportPayload(payload);
    }, "已导出 JSON");

  const handleImport = async (file: File) => {
    if (!window.confirm("导入会覆盖当前本地数据，确定继续吗？")) {
      return;
    }

    await runTask(async () => {
      const payload = parseImportPayload(await file.text());
      await appRepository.importData(payload, currentMonthKey);
    }, "已导入 JSON");
  };


  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleClear = () => {
    if (!window.confirm("确定清空本地数据吗？此操作无法恢复。")) {
      return;
    }

    void runTask(() => appRepository.clearAllData(currentMonthKey), "本地数据已清空");
  };

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">设置</h1>
        <p className="text-sm text-text-muted">通用设置与数据管理</p>
      </header>

      {toast ? (
        <div
          className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-[28rem] -translate-x-1/2 items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm ${
            toast.tone === "success" ? "border-primary text-foreground" : "border-danger text-danger"
          }`}
          role="status"
          aria-live="polite"
        >
          <span>{toast.text}</span>
          <button
            type="button"
            className="inline-flex size-6 items-center justify-center rounded-md border border-border-soft text-text-muted"
            onClick={() => setToast(null)}
            aria-label="关闭提示"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}


      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">预算设置</h2>
        <SettingRow
          label="预算模式"
          value={selectedMode === "fixed" ? "固定预算" : "本月手动"}
          action={
            <select
              value={selectedMode}
              onChange={(event) => setModeDraft(event.target.value as BudgetMode)}
              className="h-8 rounded-md border border-border-soft bg-surface px-2 text-sm"
            >
              <option value="fixed">固定</option>
              <option value="manual">手动</option>
            </select>
          }
        />
        <SettingRow
          label="本月预算"
          action={
            <div className="flex items-center gap-2">
              <Input value={budgetValue} onChange={(event) => setBudgetDraft(event.target.value)} className="h-8 w-28" />
              <Button size="sm" variant="outline" onClick={handleBudgetSave} disabled={isBusy}>
                保存
              </Button>
            </div>
          }
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">奶茶与奖励</h2>
        <SettingRow
          label="默认奶茶杯数"
          value={`当前 ${snapshot?.settings.defaultMilkTeaCups ?? "--"} 杯`}
          action={
            <div className="flex items-center gap-2">
              <Input value={cupsValue} onChange={(event) => setCupsDraft(event.target.value)} className="h-8 w-20" />
              <Button size="sm" variant="outline" onClick={handleCupsSave} disabled={isBusy}>
                保存
              </Button>
            </div>
          }
        />
        <SettingRow
          label="手动加杯"
          action={
            <div className="flex items-center gap-2">
              <Input value={rewardDraft} onChange={(event) => setRewardDraft(event.target.value)} className="h-8 w-16" />
              <Button size="sm" variant="outline" onClick={handleRewardAdd} disabled={isBusy}>
                添加
              </Button>
            </div>
          }
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">显示</h2>
        <SettingRow
          label="主题"
          value={snapshot?.settings.themeMode}
          action={
            <div className="flex gap-1">
              {(["system", "light", "dark"] as const).map((theme) => (
                <Button key={theme} size="sm" variant="outline" onClick={() => handleThemeChange(theme)} disabled={isBusy}>
                  {theme}
                </Button>
              ))}
            </div>
          }
        />
        <SettingRow
          label="动效"
          value={snapshot?.settings.motionLevel}
          action={
            <div className="flex gap-1">
              {(["full", "reduced"] as const).map((level) => (
                <Button key={level} size="sm" variant="outline" onClick={() => handleMotionChange(level)} disabled={isBusy}>
                  {level}
                </Button>
              ))}
            </div>
          }
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">数据管理</h2>
        <SettingRow
          label="导出数据"
          action={
            <Button size="sm" variant="outline" onClick={handleExport} disabled={isBusy}>
              导出 JSON
            </Button>
          }
        />
        <SettingRow
          label="导入数据"
          action={
            <>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
                导入 JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImport(file);
                  }
                  event.target.value = "";
                }}
              />
            </>
          }
        />
        <SettingRow
          label="清空本地数据"
          action={
            <Button size="sm" variant="outline" onClick={handleClear} disabled={isBusy}>
              重置
            </Button>
          }
        />
      </section>
    </AppShell>
  );
}
