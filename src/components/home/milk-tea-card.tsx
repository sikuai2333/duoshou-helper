"use client";

import { useState, useTransition } from "react";
import { appRepository } from "@/db/repositories/app-repository";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import type { DashboardSnapshot } from "@/types/domain";

interface MilkTeaCardProps {
  snapshot: DashboardSnapshot;
}

export function MilkTeaCard({ snapshot }: MilkTeaCardProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const remainingCups =
    snapshot.milkTeaQuota.totalCups +
    snapshot.milkTeaQuota.bonusCups -
    snapshot.milkTeaQuota.usedCups;

  const handleDrink = () => {
    startTransition(() => {
      void appRepository.drinkMilkTea(snapshot.monthKey).then(() => {
        setFeedback("已经记成喝掉一杯，别忘了今天也给自己一点开心。");
      });
    });
  };

  const handleBonus = () => {
    startTransition(() => {
      void appRepository.addBonusCup(snapshot.monthKey).then(() => {
        setFeedback("奖励杯数 +1，这杯是认真生活换来的。");
      });
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">☕ 奶茶额度</p>
          <InfoTip
            text="默认杯数、已喝和奖励杯数都会写入本地数据库，适合拿来做情绪消费的软上限。"
            label="查看奶茶额度说明"
          />
        </div>
        <CardTitle>奶茶额度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="app-stat">
            <p className="text-text-muted">总杯数</p>
            <p className="mt-1 font-semibold tabular-nums">{snapshot.milkTeaQuota.totalCups}</p>
          </div>
          <div className="app-stat">
            <p className="text-text-muted">已使用</p>
            <p className="mt-1 font-semibold tabular-nums">{snapshot.milkTeaQuota.usedCups}</p>
          </div>
          <div className="app-stat">
            <p className="text-text-muted">剩余</p>
            <p className="mt-1 font-semibold tabular-nums">{remainingCups}</p>
          </div>
        </div>
        <div className="text-sm text-text-muted">
          当前剩余额度{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(snapshot.remainingBudget)}
          </span>
        </div>
        {feedback ? (
          <div className="app-feedback text-sm text-text-muted">
            {feedback}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleDrink} disabled={isPending || remainingCups <= 0}>
            喝一杯
          </Button>
          <Button variant="outline" onClick={handleBonus} disabled={isPending}>
            🚴 +1 奖励
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
