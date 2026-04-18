import Link from "next/link";
import { CATEGORY_META } from "@/constants/app";
import { formatCurrency } from "@/lib/currency";
import { getFriendlyDate } from "@/lib/date";
import type { DashboardSnapshot } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader className="pb-3">
        <span className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-foreground/80">
          最近记录
        </span>
        <CardTitle className="text-xl">这几笔最能代表你这月的消费节奏</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {snapshot.latestEntries.length === 0 ? (
          <>
            <div className="rounded-[1.3rem] bg-white/75 px-4 py-5 text-sm leading-6 text-text-muted">
              这个月还没有支出记录。先随手记下一笔，首页的建议和分类统计才会更像你自己的节奏。
            </div>
            <Button className="w-full" onClick={onQuickEntry}>
              先记第一笔
            </Button>
          </>
        ) : (
          <>
            {snapshot.latestEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-[1.25rem] bg-white/75 px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {entry.emoji} {CATEGORY_META[entry.category].label}
                  </p>
                  <p className="text-xs text-text-muted">
                    {getFriendlyDate(entry.createdAt)}
                  </p>
                </div>
                <p className="font-display text-lg font-semibold">
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
