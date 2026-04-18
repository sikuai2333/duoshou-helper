"use client";

import { useState, useTransition } from "react";
import { appRepository } from "@/db/repositories/app-repository";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="bg-[linear-gradient(135deg,rgba(143,217,199,0.24),rgba(255,250,246,0.92))]">
      <CardHeader className="pb-4">
        <span className="inline-flex w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-foreground/80">
          ☕ 奶茶额度
        </span>
        <CardTitle className="text-xl">想犒劳自己时，别忘了看看还剩几杯</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-[1.25rem] bg-white/80 p-3">
            <p className="text-text-muted">总杯数</p>
            <p className="mt-1 font-semibold">{snapshot.milkTeaQuota.totalCups}</p>
          </div>
          <div className="rounded-[1.25rem] bg-white/80 p-3">
            <p className="text-text-muted">已使用</p>
            <p className="mt-1 font-semibold">{snapshot.milkTeaQuota.usedCups}</p>
          </div>
          <div className="rounded-[1.25rem] bg-white/80 p-3">
            <p className="text-text-muted">剩余</p>
            <p className="mt-1 font-semibold">{remainingCups}</p>
          </div>
        </div>
        <div className="rounded-[1.25rem] bg-white/75 px-4 py-3 text-sm text-text-muted">
          今天如果预算很乖，这杯可以是奖励。当前剩余额度{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(snapshot.remainingBudget)}
          </span>
          。
        </div>
        {feedback ? (
          <div className="rounded-[1.25rem] bg-white/75 px-4 py-3 text-sm text-text-muted">
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
