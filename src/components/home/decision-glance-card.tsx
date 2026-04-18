import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";

interface DecisionGlanceCardProps {
  snapshot: DashboardSnapshot;
}

const toneStyles = {
  buy: "bg-essential/12 text-essential",
  wait: "bg-secondary/18 text-foreground",
  skip: "bg-danger/12 text-danger",
} as const;

export function DecisionGlanceCard({ snapshot }: DecisionGlanceCardProps) {
  const isBlankMonth = snapshot.totalEntries === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <span className="inline-flex w-fit rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary-strong">
          💡 今日决策
        </span>
        <CardTitle className="text-xl">当前状态下，剁手建议是这样</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.35rem] bg-white/78 p-4">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              toneStyles[isBlankMonth ? "wait" : snapshot.suggestion.tone],
            )}
          >
            {isBlankMonth ? "先记一笔会更准" : snapshot.suggestion.title}
          </span>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            {isBlankMonth
              ? "现在预算还是空白节奏，系统还没观察到你的本月消费习惯。先记下一笔，后面的建议会更像在陪你做决定。"
              : snapshot.suggestion.description}
          </p>
          {!isBlankMonth ? (
            <p className="mt-2 text-xs text-text-muted">
              主要依据：{snapshot.suggestion.reasons[0]}
            </p>
          ) : null}
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/decision">打开决策页再细看</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
