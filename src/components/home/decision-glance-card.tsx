import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/types/domain";

interface DecisionGlanceCardProps {
  snapshot: DashboardSnapshot;
}

const toneStyles = {
  buy: {
    badge: "bg-essential/12 text-essential",
    accent: "border-essential/55",
    card: "bg-essential/[0.05]",
    summary: "border-essential/15 bg-essential/[0.08] text-foreground",
    panel: "border-essential/30 bg-essential/[0.08]",
  },
  wait: {
    badge: "bg-secondary/18 text-foreground",
    accent: "border-secondary/55",
    card: "bg-secondary/[0.05]",
    summary: "border-secondary/15 bg-secondary/[0.08] text-foreground",
    panel: "border-secondary/25 bg-secondary/[0.08]",
  },
  skip: {
    badge: "bg-danger/12 text-danger",
    accent: "border-danger/55",
    card: "bg-danger/[0.05]",
    summary: "border-danger/15 bg-danger/[0.08] text-foreground",
    panel: "border-danger/25 bg-danger/[0.08]",
  },
} as const;

export function DecisionGlanceCard({ snapshot }: DecisionGlanceCardProps) {
  const isBlankMonth = snapshot.totalEntries === 0;
  const tone = toneStyles[isBlankMonth ? "wait" : snapshot.suggestion.tone];

  return (
    <CollapsibleCard
      eyebrow="💡 今日决策"
      title="今日建议"
      tipText="建议会结合剩余额度、娱乐支出占比和离月底还有多少天，不是固定文案。"
      summary={isBlankMonth ? "先记一笔会更准" : snapshot.suggestion.title}
      accentClassName={tone.accent}
      className={tone.card}
      summaryClassName={tone.summary}
    >
      <div className={cn("border-l-4 px-4 py-4", tone.panel)}>
        <p className={cn("text-sm font-semibold", tone.badge)}>
          {isBlankMonth ? "先记一笔会更准" : snapshot.suggestion.title}
        </p>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {isBlankMonth
            ? "现在预算还是空白节奏，系统还没观察到你的本月消费习惯。先记下一笔，后面的建议会更像在陪你做决定。"
            : snapshot.suggestion.description}
        </p>
        {!isBlankMonth ? (
          <p className="mt-2 text-xs text-text-muted">主要依据：{snapshot.suggestion.reasons[0]}</p>
        ) : null}
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/decision">打开决策页再细看</Link>
      </Button>
    </CollapsibleCard>
  );
}
