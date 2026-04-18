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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <span className="inline-flex w-fit rounded-full bg-secondary/16 px-3 py-1 text-xs font-medium text-foreground/80">
          ⏳ 月度倒计时
        </span>
        <CardTitle className="text-xl">这个月还剩 {snapshot.daysLeftInMonth} 天</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-full bg-white/75 p-1">
          <div
            className={`h-3 rounded-full ${progressTone}`}
            style={{ width: `${snapshot.monthProgressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>已走过 {snapshot.elapsedDays} 天</span>
          <span>共 {snapshot.totalDaysInMonth} 天</span>
        </div>
      </CardContent>
    </Card>
  );
}
