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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const toneClassName = {
  buy: "bg-essential/14 text-essential",
  wait: "bg-secondary/24 text-foreground",
  skip: "bg-danger/14 text-danger",
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
      <section className="surface-card rounded-[2rem] p-5">
        <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary-strong">
          剁手决策
        </span>
        <h1 className="mt-3 font-display text-[2rem] font-semibold tracking-tight">
          先把犹豫拆开，再决定今天要不要买。
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          金额可以不填，但填了以后，建议会更贴近你这个月的真实节奏。
        </p>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">给建议前，先补两项信息</CardTitle>
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
                className="h-14 pl-9 text-lg font-semibold"
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
                    "rounded-[1.25rem] border px-4 py-3 text-left transition",
                    category === item
                      ? "border-transparent bg-white text-foreground shadow-[0_10px_24px_rgba(83,61,47,0.1)]"
                      : "border-border-soft bg-white/60 text-text-muted",
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
          "soft-mask overflow-hidden",
          suggestion ? toneClassName[suggestion.tone] : "bg-white/80 text-foreground",
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {isLoading || !suggestion ? "正在读取这个月的预算节奏..." : suggestion.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-6">
            {isLoading || !suggestion
              ? "先把本地数据加载出来，马上就能给建议。"
              : suggestion.description}
          </p>
          {snapshot ? (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-[1.2rem] bg-white/72 p-3 text-foreground">
                <p className="text-text-muted">剩余额度</p>
                <p className="mt-1 font-semibold">
                  {formatCurrency(snapshot.remainingBudget)}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-white/72 p-3 text-foreground">
                <p className="text-text-muted">娱乐已花</p>
                <p className="mt-1 font-semibold">{formatCurrency(snapshot.funSpent)}</p>
              </div>
              <div className="rounded-[1.2rem] bg-white/72 p-3 text-foreground">
                <p className="text-text-muted">离月底</p>
                <p className="mt-1 font-semibold">{snapshot.daysLeftInMonth} 天</p>
              </div>
            </div>
          ) : null}
          {suggestion ? (
            <div className="space-y-2">
              {suggestion.reasons.map((reason) => (
                <div
                  key={reason}
                  className="rounded-[1.15rem] bg-white/72 px-4 py-3 text-sm text-foreground"
                >
                  {reason}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">这套建议现在怎么判断</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-text-muted">
          <div className="rounded-[1.2rem] bg-white/75 px-4 py-3">
            先看这笔钱会吃掉多少剩余额度，比例太高就不会鼓励你立刻下手。
          </div>
          <div className="rounded-[1.2rem] bg-white/75 px-4 py-3">
            如果娱乐消费已经明显偏多，同样的金额会更容易收到“再等等”。
          </div>
          <div className="rounded-[1.2rem] bg-white/75 px-4 py-3">
            越接近月底，系统越倾向保守，避免最后几天预算失速。
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => setAmountDraft("")}>
        清掉金额，回到默认判断
      </Button>
    </AppShell>
  );
}
