import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/ui/collapsible-card";

interface QuickActionsProps {
  onQuickEntry: () => void;
}

export function QuickActions({ onQuickEntry }: QuickActionsProps) {
  return (
    <CollapsibleCard
      eyebrow="快速操作"
      title="快捷入口"
      tipText="首页只保留两个最高频入口，避免每次打开都要重新找按钮。"
      summary="记一笔 / 帮我决定"
      defaultOpen
      accentClassName="border-primary/60"
      className="surface-card-strong bg-primary/[0.08]"
      summaryClassName="border-primary/15 bg-primary/[0.12] text-foreground"
    >
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={onQuickEntry}>
          记一笔
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/decision">帮我决定</Link>
        </Button>
      </div>
    </CollapsibleCard>
  );
}
