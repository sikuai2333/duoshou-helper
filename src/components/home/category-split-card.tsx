import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";
import { CollapsibleCard } from "@/components/ui/collapsible-card";

interface CategorySplitCardProps {
  snapshot: DashboardSnapshot;
}

export function CategorySplitCard({ snapshot }: CategorySplitCardProps) {
  const totalSpent = snapshot.essentialSpent + snapshot.funSpent;
  const essentialRatio =
    totalSpent === 0 ? 0 : Math.round((snapshot.essentialSpent / totalSpent) * 100);
  const funRatio = totalSpent === 0 ? 0 : 100 - essentialRatio;

  return (
    <CollapsibleCard
      eyebrow="分类统计"
      title="分类分布"
      tipText="这里只看生活必需和娱乐两类，帮助你快速判断本月花钱的重心。"
      summary={
        <span className="tabular-nums">
          生活 {formatCurrency(snapshot.essentialSpent)} · 娱乐 {formatCurrency(snapshot.funSpent)}
        </span>
      }
      accentClassName="border-essential/55"
      className="bg-essential/[0.05]"
      summaryClassName="border-essential/15 bg-essential/[0.08] text-foreground"
    >
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
              category === "essential"
                ? "border-essential/25 bg-essential/[0.08]"
                : "border-fun/25 bg-fun/[0.08]",
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
    </CollapsibleCard>
  );
}
