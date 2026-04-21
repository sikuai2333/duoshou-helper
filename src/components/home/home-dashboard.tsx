"use client";

import Link from "next/link";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-xl font-semibold">首页</h1>
        <p className="text-sm text-text-muted">{getMonthLabel(getMonthDate(currentMonthKey))}</p>
      </header>

      <section className="surface-card p-4">
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
            <p className="mt-1 text-base font-semibold tabular-nums">¥0.00</p>
          </div>
          <div>
            <p className="text-text-muted">结余</p>
            <p className="mt-1 text-base font-semibold tabular-nums">
              {isLoading || !snapshot ? "--" : formatCurrency(snapshot.remainingBudget)}
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">最近流水</h2>
          <Link href="/ledger" className="text-sm text-primary">
            查看全部
          </Link>
        </div>
        <div className="space-y-2">
          {!snapshot || snapshot.latestEntries.length === 0 ? (
            <p className="text-sm text-text-muted">还没有流水，先记一笔。</p>
          ) : (
            snapshot.latestEntries.slice(0, 7).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b border-border-soft py-2 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium">
                    {entry.emoji} {entry.category === "essential" ? "生活必需" : "娱乐"}
                  </p>
                  <p className="text-xs text-text-muted">{new Date(entry.createdAt).toLocaleString("zh-CN")}</p>
                </div>
                <p className="font-semibold tabular-nums">{formatCurrency(entry.amount)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="surface-card p-4">
        <h2 className="mb-3 text-sm font-medium">快捷入口</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => openQuickEntry()}>
            记一笔
          </Button>
          <Button asChild variant="outline">
            <Link href="/decision">买不买判断</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
