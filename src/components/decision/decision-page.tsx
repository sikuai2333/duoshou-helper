"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/common/app-shell";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatCurrency } from "@/lib/currency";
import { getDecisionSuggestion } from "@/lib/decision";
import { useAppStore } from "@/stores/app-store";
import type { CategoryType } from "@/types/domain";

export function DecisionPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const { snapshot, isLoading } = useDashboardData(currentMonthKey);
  const [amountDraft, setAmountDraft] = useState("");
  const [category, setCategory] = useState<CategoryType>("fun");
  const [isEssential, setIsEssential] = useState(false);
  const [note, setNote] = useState("");

  const amount = useMemo(() => {
    const nextAmount = Number.parseFloat(amountDraft);
    return Number.isFinite(nextAmount) && nextAmount > 0 ? nextAmount : undefined;
  }, [amountDraft]);

  const suggestion = snapshot
    ? getDecisionSuggestion({
        amount,
        category: isEssential ? "essential" : category,
        remainingBudget: snapshot.remainingBudget,
        funSpent: snapshot.funSpent,
        essentialSpent: snapshot.essentialSpent,
        daysLeftInMonth: snapshot.daysLeftInMonth,
      })
    : undefined;

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">决策</h1>
        <p className="text-sm text-text-muted">预算与剩余可花</p>
      </header>

      <section className="list-row p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-muted">当月预算</p>
            <p className="mt-1 font-semibold tabular-nums">
              {isLoading || !snapshot ? "--" : formatCurrency(snapshot.budget)}
            </p>
          </div>
          <div>
            <p className="text-text-muted">剩余可花</p>
            <p className="mt-1 font-semibold tabular-nums">
              {isLoading || !snapshot ? "--" : formatCurrency(snapshot.remainingBudget)}
            </p>
          </div>
        </div>
      </section>

      <section className="list-row space-y-3 p-4">
        <h2 className="text-sm font-medium">买不买判断</h2>
        <div className="space-y-1.5">
          <label className="text-xs text-text-muted" htmlFor="decision-amount">
            金额
          </label>
          <Input
            id="decision-amount"
            inputMode="decimal"
            value={amountDraft}
            onChange={(event) => setAmountDraft(event.target.value)}
            placeholder="输入预计花费"
            className="tabular-nums"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs text-text-muted">分类</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["essential", "必要"],
              ["fun", "可选"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setCategory(value);
                  setIsEssential(value === "essential");
                }}
                className={`h-9 rounded-md border text-sm ${
                  category === value ? "border-foreground text-foreground" : "border-border-soft text-text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-text-muted" htmlFor="decision-note">
            备注（可选）
          </label>
          <Input
            id="decision-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：替换旧耳机"
          />
        </div>
      </section>

      <section className="list-row space-y-2 p-4">
        <h2 className="text-sm font-medium">结果</h2>
        <p className="text-sm">{isLoading || !suggestion ? "正在读取本地预算数据..." : suggestion.title}</p>
        <p className="text-sm text-text-muted">
          {isLoading || !suggestion ? "" : suggestion.description}
        </p>
        {snapshot && suggestion ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-text-muted">可花余额</p>
              <p className="font-semibold tabular-nums">{formatCurrency(snapshot.remainingBudget)}</p>
            </div>
            <div>
              <p className="text-text-muted">剩余天数</p>
              <p className="font-semibold tabular-nums">{snapshot.daysLeftInMonth} 天</p>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
