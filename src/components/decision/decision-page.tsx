"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
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
  const [isNecessary, setIsNecessary] = useState(false);
  const [note, setNote] = useState("");

  const amount = useMemo(() => {
    const value = Number.parseFloat(amountDraft);
    return Number.isFinite(value) && value > 0 ? value : undefined;
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
    : null;

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">买不买判断</h1>
        <p className="text-sm text-text-muted">输入金额后可得到更具体建议。</p>
      </header>

      <section className="surface-card p-4">
        <h2 className="mb-3 text-sm font-medium">当月预算</h2>
        {isLoading || !snapshot ? (
          <p className="text-sm text-text-muted">预算读取中...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-text-muted">预算总额</p>
              <p className="mt-1 font-semibold tabular-nums">{formatCurrency(snapshot.budget)}</p>
            </div>
            <div>
              <p className="text-text-muted">剩余可花</p>
              <p className="mt-1 font-semibold tabular-nums">{formatCurrency(snapshot.remainingBudget)}</p>
            </div>
          </div>
        )}
      </section>

      <section className="surface-card space-y-4 p-4">
        <h2 className="text-sm font-medium">买不买表单</h2>

        <div className="space-y-2">
          <label className="text-sm" htmlFor="decision-amount">
            金额
          </label>
          <Input
            id="decision-amount"
            inputMode="decimal"
            placeholder="例如 199"
            value={amountDraft}
            onChange={(event) => setAmountDraft(event.target.value)}
            className="tabular-nums"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm">类型</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={category === "essential" ? "default" : "outline"}
              onClick={() => setCategory("essential")}
            >
              必要
            </Button>
            <Button
              variant={category === "fun" ? "default" : "outline"}
              onClick={() => setCategory("fun")}
            >
              可选
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">必要性标记</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={isNecessary ? "default" : "outline"} onClick={() => setIsNecessary(true)}>
              必须买
            </Button>
            <Button variant={!isNecessary ? "default" : "outline"} onClick={() => setIsNecessary(false)}>
              可延后
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm" htmlFor="decision-note">
            备注（可选）
          </label>
          <Input
            id="decision-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：本周促销，担心错过"
          />
        </div>
      </section>

      <section className="surface-card p-4">
        <h2 className="mb-3 text-sm font-medium">建议结果</h2>
        {!snapshot || !suggestion ? (
          <p className="text-sm text-text-muted">先读取预算数据。</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-base font-semibold">{suggestion.title}</p>
            <p>{isNecessary ? `${suggestion.description}（已标记为必要消费）` : suggestion.description}</p>
            <div className="grid grid-cols-2 gap-2">
              <p className="border border-border-soft p-2 tabular-nums">余额：{formatCurrency(snapshot.remainingBudget)}</p>
              <p className="border border-border-soft p-2 tabular-nums">剩余天数：{snapshot.daysLeftInMonth} 天</p>
            </div>
            {note.trim() ? <p className="text-text-muted">备注：{note.trim()}</p> : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}
