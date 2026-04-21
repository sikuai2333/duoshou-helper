"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/constants/app";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatCurrency } from "@/lib/currency";
import { getMonthDate, getMonthLabel } from "@/lib/date";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";

export function HomeDashboard() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const { snapshot, isLoading } = useDashboardData(currentMonthKey);

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">首页</h1>
        <p className="text-sm text-text-muted">{getMonthLabel(getMonthDate(currentMonthKey))}</p>
      </header>

      <section className="list-row p-4">
        <h2 className="mb-3 text-sm font-medium text-text-muted">当月收支概览</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-text-muted">支出</p>
            <p className="mt-1 text-base font-semibold tabular-nums">
              {isLoading || !snapshot ? "--" : formatCurrency(snapshot.monthSpent)}
            </p>
          </div>
          <div>
            <p className="text-text-muted">收入</p>
            <p className="mt-1 text-base font-semibold tabular-nums">{formatCurrency(0)}</p>
          </div>
          <div>
            <p className="text-text-muted">结余</p>
            <p className="mt-1 text-base font-semibold tabular-nums">
              {isLoading || !snapshot ? "--" : formatCurrency(snapshot.remainingBudget)}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-muted">最近流水</h2>
          <Link href="/ledger" className="inline-flex items-center gap-1 text-sm text-foreground">
            查看全部
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {(snapshot?.latestEntries ?? []).slice(0, 7).map((entry) => (
            <div key={entry.id} className="list-row flex items-center gap-3 px-3 py-2.5">
              <span className="text-base">{entry.emoji || CATEGORY_META[entry.category].emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{CATEGORY_META[entry.category].label}</p>
                <p className="text-xs text-text-muted">
                  {new Date(entry.createdAt).toLocaleDateString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatCurrency(entry.amount)}</p>
            </div>
          ))}

          {!isLoading && snapshot && snapshot.latestEntries.length === 0 ? (
            <div className="list-row px-3 py-4 text-sm text-text-muted">本月还没有记录，先记一笔。</div>
          ) : null}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-text-muted">快捷入口</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => openQuickEntry()}>
            <Plus className="size-4" />
            记一笔
          </Button>
          <Button variant="outline" asChild>
            <Link href="/decision">买不买判断</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
