"use client";

import { AnimatePresence, motion } from "motion/react";
import { AppShell } from "@/components/common/app-shell";
import { QuickEntryDrawer } from "@/components/ledger/quick-entry-drawer";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { getMonthDate, getMonthLabel } from "@/lib/date";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";
import { BudgetSummaryCard } from "@/components/home/budget-summary-card";
import { CategorySplitCard } from "@/components/home/category-split-card";
import { DecisionGlanceCard } from "@/components/home/decision-glance-card";
import { MilkTeaCard } from "@/components/home/milk-tea-card";
import { MonthProgressCard } from "@/components/home/month-progress-card";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentEntriesCard } from "@/components/home/recent-entries-card";
import { Card } from "@/components/ui/card";

function LoadingCards() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((index) => (
        <Card key={index} className="h-36 animate-pulse rounded-[1.75rem] bg-white/70" />
      ))}
    </div>
  );
}

export function HomeDashboard() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const lastEntrySavedAt = useUiStore((state) => state.lastEntrySavedAt);
  const { snapshot, isLoading } = useDashboardData(currentMonthKey);

  return (
    <>
      <AppShell>
        <section className="surface-card soft-mask rounded-[2rem] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary-strong">
                剁手辅助 · 本地优先
              </span>
              <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-balance">
                {snapshot?.totalEntries
                  ? "先看还能花多少，再决定今天要不要动手。"
                  : "先记下第一笔，消费节奏才会慢慢变清楚。"}
              </h1>
              <p className="max-w-sm text-sm leading-6 text-text-muted">
                {snapshot?.totalEntries
                  ? "首页先给你预算和情绪反馈，真正高频的动作只需要一只手就能完成。"
                  : "现在还是空白月度，首页会先给你默认预算和清晰入口，不会用 demo 数据替你“伪装已使用”。"}
              </p>
            </div>
            <div className="rounded-[1.45rem] bg-white/78 px-3 py-2 text-right shadow-sm">
              <p className="text-[11px] text-text-muted">当前月份</p>
              <p className="font-display text-base font-semibold">
                {getMonthLabel(getMonthDate(currentMonthKey))}
              </p>
            </div>
          </div>
          <AnimatePresence>
            {lastEntrySavedAt ? (
              <motion.div
                key={lastEntrySavedAt}
                className="mt-4 rounded-[1.2rem] bg-white/78 px-4 py-3 text-sm text-text-muted"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8] }}
                transition={{ duration: 4, times: [0, 0.12, 0.82, 1] }}
              >
                已经记下一笔，预算数字也跟着刷新了。
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        {isLoading || !snapshot ? (
          <LoadingCards />
        ) : (
          <>
            <MonthProgressCard snapshot={snapshot} />
            <BudgetSummaryCard snapshot={snapshot} />
            <CategorySplitCard snapshot={snapshot} />
            <MilkTeaCard snapshot={snapshot} />
            <DecisionGlanceCard snapshot={snapshot} />
            <RecentEntriesCard snapshot={snapshot} onQuickEntry={() => openQuickEntry()} />
            <QuickActions onQuickEntry={openQuickEntry} />
          </>
        )}
      </AppShell>
      <QuickEntryDrawer />
    </>
  );
}
