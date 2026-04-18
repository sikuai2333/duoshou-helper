import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
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
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">💡 今日决策</p>
          <InfoTip
            text="建议会结合剩余额度、娱乐支出占比和离月底还有多少天，不是固定文案。"
            label="查看决策卡说明"
          />
        </div>
        <CardTitle>今日建议</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-l-4 border-border-soft bg-surface-strong px-4 py-4">
          <p
            className={cn(
              "text-sm font-semibold",
              toneStyles[isBlankMonth ? "wait" : snapshot.suggestion.tone],
            )}
          >
            {isBlankMonth ? "先记一笔会更准" : snapshot.suggestion.title}
          </p>
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
