"use client";

import { useMemo, useState } from "react";
import { CATEGORY_META } from "@/constants/app";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatCurrency } from "@/lib/currency";
import { getDecisionSuggestion } from "@/lib/decision";
import { useAppStore } from "@/stores/app-store";
import type { CategoryType } from "@/types/domain";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const toneClassName = {
  buy: "border-essential text-essential",
  wait: "border-secondary text-foreground",
  skip: "border-danger text-danger",
} as const;

export function DecisionPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const { snapshot, isLoading } = useDashboardData(currentMonthKey);
  const [amountDraft, setAmountDraft] = useState("");
  const [category, setCategory] = useState<CategoryType>("fun");

  const amount = useMemo(() => {
    const nextAmount = Number.parseFloat(amountDraft);
    return Number.isFinite(nextAmount) && nextAmount > 0 ? nextAmount : undefined;
  }, [amountDraft]);

  const suggestion = snapshot
    ? getDecisionSuggestion({
        amount,
        category,
        remainingBudget: snapshot.remainingBudget,
        funSpent: snapshot.funSpent,
        essentialSpent: snapshot.essentialSpent,
        daysLeftInMonth: snapshot.daysLeftInMonth,
      })
    : undefined;

  return (
    <AppShell>
      <section className="surface-card rounded-xl p-4">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">剁手决策</p>
          <InfoTip
            text="金额可以不填，但填了以后建议会更贴近这个月的真实预算节奏。"
            label="查看决策页说明"
          />
        </div>
        <h1 className="mt-2 text-[1.85rem] font-semibold tracking-tight">帮我决定</h1>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>给建议前，先补两项信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="decision-amount">
              想花多少钱
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-text-muted">
                ¥
              </span>
              <Input
                id="decision-amount"
                inputMode="decimal"
                placeholder="不填也可以，系统会按当前节奏先判断"
                className="h-12 pl-9 text-lg font-semibold tabular-nums"
                value={amountDraft}
                onChange={(event) => setAmountDraft(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">这笔更偏哪类</p>
            <div className="grid grid-cols-2 gap-3">
              {(["essential", "fun"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={cn(
                    "rounded-md border px-4 py-3 text-left transition-colors",
                    category === item
                      ? "border-foreground bg-surface-strong text-foreground"
                      : "border-border-soft bg-surface text-text-muted",
                  )}
                >
                  <p className="text-sm font-semibold">
                    {CATEGORY_META[item].emoji} {CATEGORY_META[item].label}
                  </p>
                  <p className="mt-1 text-xs">
                    {item === "essential" ? "更像生活刚需" : "更像情绪消费或娱乐"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "border-l-4",
          suggestion ? toneClassName[suggestion.tone] : "border-border-soft text-foreground",
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1">
            <CardTitle>
              {isLoading || !suggestion ? "正在读取这个月的预算节奏..." : suggestion.title}
            </CardTitle>
            <InfoTip
              text="建议会先看剩余额度占比，再看娱乐支出是否偏高，以及离月底还有多少天。"
              label="查看决策逻辑说明"
              widthClassName="w-64"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6">
            {isLoading || !suggestion
              ? "先把本地数据加载出来，马上就能给建议。"
              : suggestion.description}
          </p>
          {snapshot ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="app-stat text-foreground">
                <p className="text-text-muted">剩余额度</p>
                <p className="mt-1 font-semibold tabular-nums">
                  {formatCurrency(snapshot.remainingBudget)}
                </p>
              </div>
              <div className="app-stat text-foreground">
                <p className="text-text-muted">娱乐已花</p>
                <p className="mt-1 font-semibold tabular-nums">{formatCurrency(snapshot.funSpent)}</p>
              </div>
              <div className="app-stat text-foreground">
                <p className="text-text-muted">离月底</p>
                <p className="mt-1 font-semibold tabular-nums">{snapshot.daysLeftInMonth} 天</p>
              </div>
            </div>
          ) : null}
          {suggestion ? (
            <div className="space-y-2">
              {suggestion.reasons.map((reason) => (
                <div
                  key={reason}
                  className="border-b border-border-soft pb-2 text-sm text-foreground last:border-b-0 last:pb-0"
                >
                  {reason}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Button variant="ghost" onClick={() => setAmountDraft("")}>
        清掉金额，回到默认判断
      </Button>
    </AppShell>
  );
}
