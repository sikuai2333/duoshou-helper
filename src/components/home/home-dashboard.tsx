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
import { InfoTip } from "@/components/ui/info-tip";

function LoadingCards() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((index) => (
        <Card key={index} className="h-32 animate-pulse bg-surface-strong" />
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
        <section className="surface-card rounded-xl border border-primary/45 bg-primary/[0.06] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <p className="app-eyebrow">剁手辅助</p>
                <InfoTip
                  text={
                    snapshot?.totalEntries
                      ? "首页只保留预算、分类、奶茶和决策四组高频信息，打开就能知道今天该不该花。"
                      : "当前还是空白月度，不会自动塞进演示数据。先记一笔，首页的统计和建议才会开始工作。"
                  }
                  label="查看首页说明"
                />
              </div>
              <h1 className="text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-balance">
                {snapshot?.totalEntries ? "本月概览" : "开始记账"}
              </h1>
            </div>
            <div className="min-w-24 rounded-lg border border-primary/20 bg-primary/12 px-3 py-2 text-right">
              <p className="text-xs text-text-muted">当前月份</p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {getMonthLabel(getMonthDate(currentMonthKey))}
              </p>
              <p className="mt-3 text-xs text-text-muted">本月记录</p>
              <p className="mt-1 text-sm font-medium tabular-nums">
                {snapshot?.totalEntries ?? 0} 笔
              </p>
            </div>
          </div>
          <AnimatePresence>
            {lastEntrySavedAt ? (
              <motion.div
                key={lastEntrySavedAt}
                className="app-feedback mt-4 text-sm text-text-muted"
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
