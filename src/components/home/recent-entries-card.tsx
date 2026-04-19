import Link from "next/link";
import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { getFriendlyDate } from "@/lib/date";
import type { DashboardSnapshot } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";

interface RecentEntriesCardProps {
  snapshot: DashboardSnapshot;
  onQuickEntry: () => void;
}

export function RecentEntriesCard({
  snapshot,
  onQuickEntry,
}: RecentEntriesCardProps) {
  return (
    <CollapsibleCard
      eyebrow="最近记录"
      title="最近记录"
      tipText="这里只显示最近几笔，完整修改和筛选放在账本页。"
      summary={
        snapshot.latestEntries.length === 0
          ? "本月还没有记录"
          : `最近 ${snapshot.latestEntries.length} 笔`
      }
      accentClassName="border-accent/45"
      className="bg-accent/[0.04]"
      summaryClassName="border-accent/15 bg-accent/[0.07] text-foreground"
    >
      {snapshot.latestEntries.length === 0 ? (
        <>
          <div className="text-sm text-text-muted">这个月还没有记录。</div>
          <Button className="w-full" onClick={onQuickEntry}>
            先记第一笔
          </Button>
        </>
      ) : (
        <>
          {snapshot.latestEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between border-b border-border-soft pb-3 last:border-b-0 last:pb-0"
            >
              <div>
                <p className="font-medium">
                  {entry.emoji} {CATEGORY_META[entry.category].label}
                </p>
                <p className="text-xs text-text-muted">{getFriendlyDate(entry.createdAt)}</p>
              </div>
              <p className="text-base font-semibold tabular-nums">{formatCurrency(entry.amount)}</p>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full">
            <Link href="/ledger">去账本页继续整理</Link>
          </Button>
        </>
      )}
    </CollapsibleCard>
  );
}
