"use client";

import { useRef, useState } from "react";
import { z, ZodError } from "zod";
import { useAppStore } from "@/stores/app-store";
import { appRepository } from "@/db/repositories/app-repository";
import { downloadExportPayload, parseImportPayload } from "@/lib/export-import";
import { useSettingsData } from "@/hooks/use-settings-data";
import type { BudgetMode, MotionLevel, ThemeMode } from "@/types/domain";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const budgetSchema = z.coerce
  .number()
  .finite("预算必须是数字")
  .positive("预算要大于 0")
  .max(999999, "预算先控制在六位数以内");

const cupsSchema = z.coerce
  .number()
  .int("杯数要填整数")
  .positive("杯数至少要 1")
  .max(99, "杯数先控制在 99 以内");

const rewardSchema = z.coerce
  .number()
  .int("奖励杯数要填整数")
  .positive("奖励杯数至少要 1")
  .max(20, "单次奖励先控制在 20 杯以内");

type FeedbackState =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

function resolveErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "导入内容格式不正确";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "操作失败，请稍后再试";
}

export function SettingsPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const { snapshot, isLoading } = useSettingsData(currentMonthKey);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [budgetDraft, setBudgetDraft] = useState("");
  const [modeDraft, setModeDraft] = useState<BudgetMode | null>(null);
  const [cupsDraft, setCupsDraft] = useState("");
  const [rewardDraft, setRewardDraft] = useState("1");
  const [isBusy, setIsBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
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
    setFeedback(null);

    try {
      await task();
      setFeedback({
        tone: "success",
        text: successText,
      });
    } catch (error) {
      setFeedback({
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
      "预算规则已经保存，本月额度会立刻按新数值计算。",
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
      "奶茶默认杯数已经更新，这个月的额度也同步刷新了。",
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
      `motion-${motionLevel}`,
      () => appRepository.updateAppearance({ motionLevel }),
      "动效等级已经保存。",
    );
  };

  const handleExport = async () => {
    await runAction(
      "export",
      async () => {
        const payload = await appRepository.exportData();
        downloadExportPayload(payload);
      },
      "备份文件已经导出到浏览器下载列表。",
    );
  };

  const handleImportFile = async (file: File) => {
    if (!window.confirm("导入会覆盖当前本地数据，确定继续吗？")) {
      return;
    }

    await runAction(
      "import",
      async () => {
        const payload = parseImportPayload(await file.text());
        await appRepository.importData(payload, currentMonthKey);
      },
      "数据导入完成，当前页面已经切换到新的本地数据。",
    );
  };

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
      <section className="surface-card rounded-[2rem] p-5">
        <span className="inline-flex rounded-full bg-accent/18 px-3 py-1 text-xs font-semibold text-foreground">
          设置页
        </span>
        <h1 className="mt-3 font-display text-[2rem] font-semibold tracking-tight">
          所有规则都在本地生效，不需要登录，也不会上传云端。
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          这里先把预算、奶茶额度、数据备份和动效等级都做成能直接使用的版本。
        </p>
      </section>

      {feedback ? (
        <div
          className={cn(
            "rounded-[1.35rem] px-4 py-3 text-sm",
            feedback.tone === "success"
              ? "bg-essential/12 text-essential"
              : "bg-danger/12 text-danger",
          )}
        >
          {feedback.text}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">当前本地状态</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-[1.2rem] bg-white/75 p-3">
            <p className="text-text-muted">记录数</p>
            <p className="mt-1 font-semibold">{isLoading ? "--" : snapshot?.totalEntries}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/75 p-3">
            <p className="text-text-muted">奖励记录</p>
            <p className="mt-1 font-semibold">{isLoading ? "--" : snapshot?.totalRewards}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white/75 p-3">
            <p className="text-text-muted">已追踪月份</p>
            <p className="mt-1 font-semibold">{isLoading ? "--" : snapshot?.trackedMonths}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">月预算设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(["fixed", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeDraft(mode)}
                className={cn(
                  "rounded-[1.2rem] border px-4 py-3 text-left transition",
                  selectedMode === mode
                    ? "border-transparent bg-white shadow-[0_10px_24px_rgba(83,61,47,0.1)]"
                    : "border-border-soft bg-white/60 text-text-muted",
                )}
              >
                <p className="text-sm font-semibold">
                  {mode === "fixed" ? "固定预算" : "本月手动"}
                </p>
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
                className="h-14 pl-9 text-lg font-semibold"
                value={budgetValue}
                onChange={(event) => setBudgetDraft(event.target.value)}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleBudgetSave}
            disabled={isBusy === "budget"}
          >
            {isBusy === "budget" ? "保存中..." : "保存预算规则"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">奶茶额度与奖励</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-[1.2rem] bg-white/75 p-3">
              <p className="text-text-muted">默认杯数</p>
              <p className="mt-1 font-semibold">{snapshot?.settings.defaultMilkTeaCups ?? "--"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-3">
              <p className="text-text-muted">本月已喝</p>
              <p className="mt-1 font-semibold">{snapshot?.currentQuota.usedCups ?? "--"}</p>
            </div>
            <div className="rounded-[1.2rem] bg-white/75 p-3">
              <p className="text-text-muted">奖励杯数</p>
              <p className="mt-1 font-semibold">{snapshot?.currentQuota.bonusCups ?? "--"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="cups-input">
              默认总杯数
            </label>
            <Input
              id="cups-input"
              inputMode="numeric"
              value={cupsValue}
              onChange={(event) => setCupsDraft(event.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleMilkTeaSave} disabled={isBusy === "cups"}>
            {isBusy === "cups" ? "保存中..." : "保存默认杯数"}
          </Button>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Input
              inputMode="numeric"
              value={rewardDraft}
              onChange={(event) => setRewardDraft(event.target.value)}
            />
            <Button
              variant="outline"
              onClick={handleManualReward}
              disabled={isBusy === "reward"}
            >
              {isBusy === "reward" ? "处理中..." : "手动加杯"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">主题与动效</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">主题模式</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                ["system", "跟随系统"],
                ["light", "浅色"],
                ["dark", "深色"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedTheme === value ? "default" : "outline"}
                  onClick={() => handleThemeChange(value)}
                  disabled={isBusy === `theme-${value}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">动效等级</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["full", "完整"],
                ["reduced", "降低"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedMotion === value ? "secondary" : "outline"}
                  onClick={() => handleMotionChange(value)}
                  disabled={isBusy === `motion-${value}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">数据备份</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.2rem] bg-white/75 px-4 py-3 text-sm leading-6 text-text-muted">
            所有核心数据都在浏览器本地。导出是完整 JSON 备份，导入会覆盖当前本地数据。
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleExport} disabled={isBusy === "export"}>
              {isBusy === "export" ? "导出中..." : "导出 JSON"}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy === "import"}
            >
              {isBusy === "import" ? "导入中..." : "导入 JSON"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImportFile(file);
                }
                event.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">危险操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.2rem] bg-danger/8 px-4 py-3 text-sm leading-6 text-text-muted">
            清空后会删除当前浏览器里的账本、预算、奶茶额度和设置数据，不会自动恢复。
          </div>

          {confirmingClear ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="ghost"
                onClick={() => setConfirmingClear(false)}
                disabled={isBusy === "clear"}
              >
                取消
              </Button>
              <Button
                variant="outline"
                className="border-danger/30 text-danger hover:bg-danger/8"
                onClick={handleClearData}
                disabled={isBusy === "clear"}
              >
                {isBusy === "clear" ? "清空中..." : "确认清空"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-danger/30 text-danger hover:bg-danger/8"
              onClick={() => setConfirmingClear(true)}
            >
              清空本地数据
            </Button>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
