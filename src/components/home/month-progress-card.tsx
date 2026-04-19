import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSnapshot } from "@/types/domain";

interface MonthProgressCardProps {
  snapshot: DashboardSnapshot;
}

export function MonthProgressCard({ snapshot }: MonthProgressCardProps) {
  const progressTone =
    snapshot.daysLeftInMonth <= 4
      ? "bg-danger"
      : snapshot.daysLeftInMonth <= 9
        ? "bg-secondary"
        : "bg-accent";

  return (
    <Card className="border-secondary/55 bg-secondary/[0.06]">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="app-eyebrow">⏳ 月度倒计时</p>
            <CardTitle>这个月还剩 {snapshot.daysLeftInMonth} 天</CardTitle>
          </div>
          <div className="rounded-md border border-secondary/25 bg-secondary/12 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground">
            {snapshot.monthProgressPercent}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 overflow-hidden rounded-sm bg-surface-strong">
          <div
            className={`h-full ${progressTone}`}
            style={{ width: `${snapshot.monthProgressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>已过 {snapshot.elapsedDays} 天</span>
          <span>共 {snapshot.totalDaysInMonth} 天</span>
        </div>
      </CardContent>
    </Card>
  );
}
