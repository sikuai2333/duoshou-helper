import Link from "next/link";
import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { getFriendlyDate } from "@/lib/date";
import type { DashboardSnapshot } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";

interface RecentEntriesCardProps {
  snapshot: DashboardSnapshot;
  onQuickEntry: () => void;
}

export function RecentEntriesCard({
  snapshot,
  onQuickEntry,
}: RecentEntriesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">最近记录</p>
          <InfoTip text="这里只显示最近几笔，完整修改和筛选放在账本页。" label="查看最近记录说明" />
        </div>
        <CardTitle>最近记录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
                  <p className="text-xs text-text-muted">
                    {getFriendlyDate(entry.createdAt)}
                  </p>
                </div>
                <p className="text-base font-semibold tabular-nums">
                  {formatCurrency(entry.amount)}
                </p>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/ledger">去账本页继续整理</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
