import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader className="pb-4">
        <span className="inline-flex w-fit rounded-full bg-accent/16 px-3 py-1 text-xs font-medium text-foreground/80">
          分类统计
        </span>
        <CardTitle className="text-xl">钱主要流向哪里，一眼就能看出来</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalSpent === 0 ? (
          <div className="rounded-[1.25rem] bg-white/75 px-4 py-4 text-sm leading-6 text-text-muted">
            还没有任何支出记录。等你记下第一笔后，这里会告诉你本月是更偏生活必需，还是更偏娱乐消费。
          </div>
        ) : (
          <div className="overflow-hidden rounded-full bg-white/75 p-1">
            <div className="flex h-3 overflow-hidden rounded-full">
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
                "rounded-[1.3rem] bg-white/80 p-4 ring-1 ring-inset",
                category === "essential" ? "ring-essential/18" : "ring-fun/18",
              )}
            >
              <p className="text-sm text-text-muted">
                {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
              </p>
              <p className="mt-2 text-lg font-semibold">
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
