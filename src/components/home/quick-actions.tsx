import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  onQuickEntry: () => void;
}

export function QuickActions({ onQuickEntry }: QuickActionsProps) {
  return (
    <Card className="surface-card-strong">
      <CardHeader className="pb-3">
        <span className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-foreground/80">
          快速操作
        </span>
        <CardTitle className="text-xl">高频动作只保留两件事：记账和判断</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button size="lg" onClick={onQuickEntry}>
          记一笔
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/decision">帮我决定</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
