import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";

interface CategorySplitCardProps {
  snapshot: DashboardSnapshot;
}

export function CategorySplitCard({ snapshot }: CategorySplitCardProps) {
  const totalSpent = snapshot.essentialSpent + snapshot.funSpent;
  const essentialRatio =
    totalSpent === 0 ? 0 : Math.round((snapshot.essentialSpent / totalSpent) * 100);
  const funRatio = totalSpent === 0 ? 0 : 100 - essentialRatio;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">分类统计</p>
          <InfoTip
            text="这里只看生活必需和娱乐两类，帮助你快速判断本月花钱的重心。"
            label="查看分类说明"
          />
        </div>
        <CardTitle>分类分布</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSpent === 0 ? (
          <div className="text-sm text-text-muted">记下第一笔之后，这里会开始分布统计。</div>
        ) : (
          <div className="h-2 overflow-hidden rounded-sm bg-surface-strong">
            <div className="flex h-full overflow-hidden">
              <div className="bg-essential" style={{ width: `${essentialRatio}%` }} />
              <div className="bg-fun" style={{ width: `${funRatio}%` }} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {(["essential", "fun"] as const).map((category) => (
            <div
              key={category}
              className={cn(
                "rounded-lg border p-4",
                category === "essential" ? "border-essential/30" : "border-fun/30",
              )}
            >
              <p className="text-sm text-text-muted">
                {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
              </p>
              <p className="mt-2 text-lg font-semibold tabular-nums">
                {formatCurrency(
                  category === "essential" ? snapshot.essentialSpent : snapshot.funSpent,
                )}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {totalSpent === 0
                  ? "等第一笔记录后开始统计"
                  : `${category === "essential" ? essentialRatio : funRatio}% 的月度支出`}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
