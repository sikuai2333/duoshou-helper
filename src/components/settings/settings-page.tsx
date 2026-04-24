"use client";

import { useEffect, useRef, useState } from "react";
import { z, ZodError } from "zod";
import { AppShell } from "@/components/common/app-shell";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appRepository } from "@/db/repositories/app-repository";
import { useSettingsData } from "@/hooks/use-settings-data";
import { downloadExportPayload, parseImportPayload } from "@/lib/export-import";
import { useAppStore } from "@/stores/app-store";
import type { BudgetMode, MotionLevel, ThemeMode } from "@/types/domain";

function resolveErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "输入不合法";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "操作失败";
}

export function SettingsPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const { snapshot } = useSettingsData(currentMonthKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [modeDraft, setModeDraft] = useState<BudgetMode | null>(null);
  const [cupsDraft, setCupsDraft] = useState("");
  const [rewardDraft, setRewardDraft] = useState("1");
  const [isBusy, setIsBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const selectedMode = modeDraft ?? snapshot?.currentBudget.mode ?? "fixed";
  const budgetValue = budgetDraft || snapshot?.currentBudget.budget.toString() || "";
  const cupsValue = cupsDraft || snapshot?.settings.defaultMilkTeaCups.toString() || "";
  const selectedTheme = snapshot?.settings.themeMode ?? "light";
  const selectedMotion = snapshot?.settings.motionLevel ?? "full";

  const runAction = async (
    actionKey: string,
    task: () => Promise<void>,
    successText: string,
  ) => {
    setIsBusy(actionKey);
    setToast(null);

  const runAction = async (task: () => Promise<void>, successText: string) => {
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
      setIsBusy(null);
    }
  };

  const handleBudgetSave = async () => {
    const budget = budgetSchema.parse(budgetValue);

    await runAction(
      "budget",
      async () => {
        await appRepository.updateBudgetConfig({
          monthKey: currentMonthKey,
          budget,
          mode: selectedMode,
        });
        setBudgetDraft("");
        setModeDraft(null);
      },
      "预算已保存",
    );
  };

  const handleMilkTeaSave = async () => {
    const totalCups = cupsSchema.parse(cupsValue);

    await runAction(
      "cups",
      async () => {
        await appRepository.updateDefaultMilkTeaCups({
          monthKey: currentMonthKey,
          totalCups,
        });
        setCupsDraft("");
      },
      "奶茶默认杯数已保存",
    );
  };

  const handleManualReward = async () => {
    const amount = rewardSchema.parse(rewardDraft);

    await runAction(
      "reward",
      async () => {
        await appRepository.addManualBonusCups({
          monthKey: currentMonthKey,
          amount,
        });
        setRewardDraft("1");
      },
      "奖励加杯已经记下，本月奶茶余额变多了。",
    );
  };

  const handleThemeChange = async (themeMode: ThemeMode) => {
    await runAction(
      `theme-${themeMode}`,
      () => appRepository.updateAppearance({ themeMode }),
      "主题偏好已经保存。",
    );
  };

  const handleMotionChange = async (motionLevel: MotionLevel) => {
    await runAction(
      () => appRepository.updateBudgetConfig({ monthKey: currentMonthKey, budget: value, mode }),
      "预算已保存",
    );
  };

  const saveCups = async () => {
    const value = cupsSchema.parse(cups || snapshot?.settings.defaultMilkTeaCups || "");
    await runAction(
      () => appRepository.updateDefaultMilkTeaCups({ monthKey: currentMonthKey, totalCups: value }),
      "奶茶默认杯数已保存",
    );
  };

  const updateTheme = async (themeMode: ThemeMode) => {
    await runAction(() => appRepository.updateAppearance({ themeMode }), "主题设置已更新");
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

  const handleClearData = async () => {
    await runAction(
      "clear",
      async () => {
        await appRepository.clearAllData(currentMonthKey);
        setConfirmingClear(false);
      },
      "本地数据已经清空，并重置成新的空白起点。",
    );
  };

  return (
    <AppShell>
      <section className="surface-card rounded-xl border border-accent/45 bg-accent/[0.06] p-4">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">设置</p>
          <InfoTip
            text="这里负责预算模式、奶茶额度、主题动效和数据导入导出，所有修改都只在本地生效。"
            label="查看设置页说明"
          />
        </div>
        <h1 className="mt-2 text-[1.85rem] font-semibold tracking-tight">设置</h1>
      </section>

      {toast ? (
        <div
          className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-32px)] max-w-[28rem] -translate-x-1/2 items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm ${
            toast.tone === "success" ? "border-essential text-foreground" : "border-danger text-danger"
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

      <Card className="border-accent/55 bg-accent/[0.05]">
        <CardHeader className="pb-4">
          <CardTitle>当前本地状态</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 text-sm">
          <div className="app-stat border-primary/20 bg-primary/[0.08]">
            <p className="text-text-muted">记录数</p>
            <p className="mt-1 font-semibold tabular-nums">
              {isLoading ? "--" : snapshot?.totalEntries}
            </p>
          </div>
          <div className="app-stat border-fun/20 bg-fun/[0.08]">
            <p className="text-text-muted">奖励记录</p>
            <p className="mt-1 font-semibold tabular-nums">
              {isLoading ? "--" : snapshot?.totalRewards}
            </p>
          </div>
          <div className="app-stat border-accent/20 bg-accent/[0.08]">
            <p className="text-text-muted">已追踪月份</p>
            <p className="mt-1 font-semibold tabular-nums">
              {isLoading ? "--" : snapshot?.trackedMonths}
            </p>
          </div>
        </CardContent>
      </Card>

      <CollapsibleCard
        eyebrow="预算"
        title="月预算设置"
        summary={
          <span className="tabular-nums">
            {selectedMode === "fixed" ? "固定预算" : "本月手动"} · ¥{budgetValue || "--"}
          </span>
        }
        accentClassName="border-primary/55"
        className="bg-primary/[0.05]"
        summaryClassName="border-primary/15 bg-primary/[0.08] text-foreground"
      >
        <div className="grid grid-cols-2 gap-3">
          {(["fixed", "manual"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setModeDraft(mode)}
              className={cn(
                "rounded-md border px-4 py-3 text-left transition-colors",
                selectedMode === mode
                  ? mode === "fixed"
                    ? "border-primary/35 bg-primary/[0.1]"
                    : "border-secondary/35 bg-secondary/[0.12]"
                  : "border-border-soft bg-surface text-text-muted",
              )}
            >
              <p className="text-sm font-semibold">{mode === "fixed" ? "固定预算" : "本月手动"}</p>
              <p className="mt-1 text-xs">
                {mode === "fixed" ? "后续月份默认沿用这个值" : "本月单独调整，不强制沿用"}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="budget-input">
            本月预算
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-text-muted">
              ¥
            </span>
            <Input
              id="budget-input"
              inputMode="decimal"
              className="h-12 pl-9 text-lg font-semibold tabular-nums"
              value={budgetValue}
              onChange={(event) => setBudgetDraft(event.target.value)}
            />
          </div>
        </div>

        <Button className="w-full" onClick={handleBudgetSave} disabled={isBusy === "budget"}>
          {isBusy === "budget" ? "保存中..." : "保存预算规则"}
        </Button>
      </CollapsibleCard>

      <CollapsibleCard
        eyebrow="奶茶"
        title="奶茶额度与奖励"
        summary={
          <span className="tabular-nums">
            默认 {snapshot?.settings.defaultMilkTeaCups ?? "--"} 杯 · 奖励{" "}
            {snapshot?.currentQuota.bonusCups ?? "--"} 杯
          </span>
        }
        accentClassName="border-fun/55"
        className="bg-fun/[0.05]"
        summaryClassName="border-fun/15 bg-fun/[0.08] text-foreground"
      >
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="app-stat border-fun/20 bg-fun/[0.08]">
            <p className="text-text-muted">默认杯数</p>
            <p className="mt-1 font-semibold tabular-nums">
              {snapshot?.settings.defaultMilkTeaCups ?? "--"}
            </p>
          </div>
          <div className="app-stat border-secondary/20 bg-secondary/[0.08]">
            <p className="text-text-muted">本月已喝</p>
            <p className="mt-1 font-semibold tabular-nums">
              {snapshot?.currentQuota.usedCups ?? "--"}
            </p>
          </div>
          <div className="app-stat border-accent/20 bg-accent/[0.08]">
            <p className="text-text-muted">奖励杯数</p>
            <p className="mt-1 font-semibold tabular-nums">
              {snapshot?.currentQuota.bonusCups ?? "--"}
            </p>
          </div>
          <Input
            inputMode="decimal"
            value={budget || String(snapshot?.currentBudget.budget ?? "")}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="本月预算"
            className="tabular-nums"
          />
          <Button variant="outline" onClick={() => void saveBudget()}>
            保存预算
          </Button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm font-medium">奶茶杯数</p>
          <Input
            inputMode="numeric"
            value={cups || String(snapshot?.settings.defaultMilkTeaCups ?? "")}
            onChange={(event) => setCups(event.target.value)}
            placeholder="默认杯数"
            className="tabular-nums"
          />
          <Button variant="outline" onClick={() => void saveCups()}>
            保存杯数
          </Button>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm font-medium">外观</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => void updateTheme("system")}>系统</Button>
            <Button variant="outline" onClick={() => void updateTheme("light")}>浅色</Button>
            <Button variant="outline" onClick={() => void updateTheme("dark")}>深色</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => void updateMotion("full")}>完整动效</Button>
            <Button variant="outline" onClick={() => void updateMotion("reduced")}>降低动效</Button>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <p className="text-sm font-medium">数据管理</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() =>
                void runAction(async () => {
                  const payload = await appRepository.exportData();
                  downloadExportPayload(payload);
                }, "已导出 JSON")
              }
            >
              导出 JSON
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              导入 JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                void runAction(async () => {
                  if (!window.confirm("导入会覆盖当前数据，确认继续？")) {
                    return;
                  }
                  const payload = parseImportPayload(await file.text());
                  await appRepository.importData(payload, currentMonthKey);
                }, "导入完成");

                event.target.value = "";
              }}
            />
          </div>
          <Button
            variant="outline"
            className="w-full border-danger text-danger"
            onClick={() =>
              void runAction(async () => {
                if (!window.confirm("确认清空本地数据？")) {
                  return;
                }
                await appRepository.clearAllData(currentMonthKey);
              }, "本地数据已清空")
            }
          >
            清空本地数据
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
