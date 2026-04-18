import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { formatCurrency } from "@/lib/currency";
import type { DashboardSnapshot } from "@/types/domain";

interface BudgetSummaryCardProps {
  snapshot: DashboardSnapshot;
}

export function BudgetSummaryCard({ snapshot }: BudgetSummaryCardProps) {
  const spentRatio = Math.min(
    100,
    Math.max(0, Math.round((snapshot.monthSpent / Math.max(snapshot.budget, 1)) * 100)),
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">预算总览</p>
          <InfoTip text="先看剩余额度，再决定这笔钱要不要花。" label="查看预算说明" />
        </div>
        <CardTitle>剩余额度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-text-muted">本月还能花</p>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(snapshot.remainingBudget)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="app-stat">
            <p className="text-text-muted">月预算</p>
            <p className="mt-1 font-semibold tabular-nums">{formatCurrency(snapshot.budget)}</p>
          </div>
          <div className="app-stat">
            <p className="text-text-muted">已花</p>
            <p className="mt-1 font-semibold tabular-nums">{formatCurrency(snapshot.monthSpent)}</p>
          </div>
          <div className="app-stat">
            <p className="text-text-muted">进度</p>
            <p className="mt-1 font-semibold tabular-nums">{spentRatio}%</p>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-sm bg-surface-strong">
          <div className="h-full bg-primary" style={{ width: `${spentRatio}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
