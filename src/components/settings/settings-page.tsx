"use client";

import { useRef, useState } from "react";
import { z, ZodError } from "zod";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appRepository } from "@/db/repositories/app-repository";
import { useSettingsData } from "@/hooks/use-settings-data";
import { downloadExportPayload, parseImportPayload } from "@/lib/export-import";
import { useAppStore } from "@/stores/app-store";
import type { BudgetMode, MotionLevel, ThemeMode } from "@/types/domain";

const budgetSchema = z.coerce.number().finite().positive().max(999999);
const cupsSchema = z.coerce.number().int().positive().max(99);

function resolveError(error: unknown) {
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

  const [budget, setBudget] = useState("");
  const [mode, setMode] = useState<BudgetMode>("fixed");
  const [cups, setCups] = useState("");
  const [feedback, setFeedback] = useState<string>("");

  const runAction = async (task: () => Promise<void>, successText: string) => {
    try {
      await task();
      setFeedback(successText);
    } catch (error) {
      setFeedback(resolveError(error));
    }
  };

  const saveBudget = async () => {
    const value = budgetSchema.parse(budget || snapshot?.currentBudget.budget || "");
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

  const updateMotion = async (motionLevel: MotionLevel) => {
    await runAction(() => appRepository.updateAppearance({ motionLevel }), "动效设置已更新");
  };

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">设置</h1>
        <p className="text-sm text-text-muted">预算、分类和数据管理。</p>
      </header>

      {feedback ? <p className="surface-card p-3 text-sm">{feedback}</p> : null}

      <section className="surface-card divide-y divide-border-soft">
        <div className="space-y-3 p-4">
          <p className="text-sm font-medium">预算设置</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={mode === "fixed" ? "default" : "outline"} onClick={() => setMode("fixed")}>
              固定预算
            </Button>
            <Button variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>
              手动预算
            </Button>
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
