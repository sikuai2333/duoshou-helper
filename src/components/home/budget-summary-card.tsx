import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="soft-mask overflow-hidden bg-[linear-gradient(135deg,rgba(255,140,107,0.18),rgba(255,255,255,0.78))]">
      <CardHeader className="pb-4">
        <span className="inline-flex w-fit rounded-full bg-primary/14 px-3 py-1 text-xs font-medium text-primary-strong">
          本月预算总览
        </span>
        <CardTitle className="text-xl">剩余额度是这次消费前的第一道门</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-text-muted">本月还能花</p>
          <p className="font-display text-4xl font-semibold tracking-tight">
            {formatCurrency(snapshot.remainingBudget)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-[1.3rem] bg-white/80 p-3">
            <p className="text-text-muted">月预算</p>
            <p className="mt-1 font-semibold">{formatCurrency(snapshot.budget)}</p>
          </div>
          <div className="rounded-[1.3rem] bg-white/80 p-3">
            <p className="text-text-muted">已花</p>
            <p className="mt-1 font-semibold">{formatCurrency(snapshot.monthSpent)}</p>
          </div>
          <div className="rounded-[1.3rem] bg-white/80 p-3">
            <p className="text-text-muted">进度</p>
            <p className="mt-1 font-semibold">{spentRatio}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
