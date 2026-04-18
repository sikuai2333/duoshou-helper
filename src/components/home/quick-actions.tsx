import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";

interface QuickActionsProps {
  onQuickEntry: () => void;
}

export function QuickActions({ onQuickEntry }: QuickActionsProps) {
  return (
    <Card className="surface-card-strong">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">快速操作</p>
          <InfoTip text="首页只保留两个最高频入口，避免每次打开都要重新找按钮。" label="查看快捷入口说明" />
        </div>
        <CardTitle>快捷入口</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" onClick={onQuickEntry}>
            记一笔
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/decision">帮我决定</Link>
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}
