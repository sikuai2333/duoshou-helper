"use client";

import { useMemo, useState, useTransition } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { PencilLine, Trash2 } from "lucide-react";
import { CATEGORY_META } from "@/constants/app";
import { ledgerRepository } from "@/db/repositories/ledger-repository";
import { formatCurrency } from "@/lib/currency";
import {
  getFriendlyDate,
  getMonthDate,
  getMonthLabel,
  listRecentMonthKeys,
  shiftMonthKey,
} from "@/lib/date";
import { useMonthEntries } from "@/hooks/use-month-entries";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";
import type { CategoryType } from "@/types/domain";
import { AppShell } from "@/components/common/app-shell";
import { QuickEntryDrawer } from "@/components/ledger/quick-entry-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EntriesPanelProps {
  monthKey: string;
  category: CategoryType;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
  isDeleting: boolean;
}

function EntriesPanel({
  monthKey,
  category,
  onEdit,
  onDelete,
  isDeleting,
}: EntriesPanelProps) {
  const { entries, isLoading } = useMonthEntries(monthKey);
  const filteredEntries = (entries ?? []).filter((entry) => entry.category === category);
  const total = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  if (isLoading) {
    return <Card className="h-44 animate-pulse bg-surface-strong" />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="app-eyebrow">
          {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
        </p>
        <CardTitle>本月合计 {formatCurrency(total)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="app-feedback text-sm text-text-muted">
            这个分类还没有记录。你可以先记一笔，或者切到另一个月份看看。
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="border-b border-border-soft pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {entry.emoji} {CATEGORY_META[entry.category].label}
                  </p>
                  <p className="text-xs text-text-muted">{getFriendlyDate(entry.createdAt)}</p>
                </div>
                <p className="text-base font-semibold tabular-nums">
                  {formatCurrency(entry.amount)}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit(entry.id)}
                >
                  <PencilLine className="size-3.5" />
                  编辑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-danger hover:bg-danger/8 hover:text-danger"
                  onClick={() => onDelete(entry.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-3.5" />
                  删除
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function LedgerPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const setCurrentMonthKey = useAppStore((state) => state.setCurrentMonthKey);
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const [tabValue, setTabValue] = useState<CategoryType>("essential");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const availableMonths = useLiveQuery(() => ledgerRepository.listAvailableMonths(), []);
  const { entries } = useMonthEntries(currentMonthKey);
  const monthTotal = (entries ?? []).reduce((sum, entry) => sum + entry.amount, 0);

  const monthOptions = useMemo(() => {
    const recent = listRecentMonthKeys(currentMonthKey, 6);
    const merged = new Set<string>([currentMonthKey, ...recent, ...(availableMonths ?? [])]);

    return [...merged].sort((left, right) => right.localeCompare(left));
  }, [availableMonths, currentMonthKey]);

  const handleDelete = (entryId: string) => {
    if (!window.confirm("删除后不会自动恢复，确定删掉这条记录吗？")) {
      return;
    }

    startDeleteTransition(() => {
      void ledgerRepository
        .deleteEntry(entryId)
        .then(() => setFeedback("这条记录已经删除，本月统计也同步更新了。"))
        .catch(() => setFeedback("删除失败，请稍后再试。"));
    });
  };

  return (
    <>
      <AppShell>
        <section className="surface-card rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <p className="app-eyebrow">账本</p>
                <InfoTip
                  text="新增、编辑、删除、筛选和按月查看都集中在这一页，避免在多个页面之间来回跳。"
                  label="查看账本说明"
                />
              </div>
              <h1 className="text-[1.85rem] font-semibold tracking-tight">账本</h1>
              <p className="text-sm leading-6 text-text-muted">
                当前查看 {getMonthLabel(getMonthDate(currentMonthKey))}，本月总支出{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(monthTotal)}
                </span>
                。
              </p>
            </div>
            <Button onClick={() => openQuickEntry()}>新增</Button>
          </div>
        </section>

        {feedback ? (
          <div className="app-feedback text-sm text-text-muted">{feedback}</div>
        ) : null}

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>按月查看</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentMonthKey(shiftMonthKey(currentMonthKey, -1))}
              >
                上个月
              </Button>
              <div className="rounded-md border border-border-soft bg-surface-strong px-4 py-3 text-center">
                <p className="text-xs text-text-muted">当前月份</p>
                <p className="mt-1 text-base font-semibold tabular-nums">
                  {getMonthLabel(getMonthDate(currentMonthKey))}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentMonthKey(shiftMonthKey(currentMonthKey, 1))}
                disabled={currentMonthKey >= listRecentMonthKeys()[0]}
              >
                下个月
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {monthOptions.map((monthKey) => (
                <button
                  key={monthKey}
                  type="button"
                  onClick={() => setCurrentMonthKey(monthKey)}
                  className={
                    monthKey === currentMonthKey
                      ? "rounded-md border border-primary bg-primary px-3 py-2 text-sm font-medium text-white"
                      : "rounded-md border border-border-soft bg-surface px-3 py-2 text-sm text-text-muted"
                  }
                >
                  {getMonthLabel(getMonthDate(monthKey))}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs value={tabValue} onValueChange={(value) => setTabValue(value as CategoryType)}>
          <TabsList className="w-full">
            <TabsTrigger value="essential" className="flex-1">
              🥬 生活必需
            </TabsTrigger>
            <TabsTrigger value="fun" className="flex-1">
              💸 娱乐
            </TabsTrigger>
          </TabsList>
          <TabsContent value="essential">
            <EntriesPanel
              monthKey={currentMonthKey}
              category="essential"
              onEdit={(entryId) => openQuickEntry(entryId)}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </TabsContent>
          <TabsContent value="fun">
            <EntriesPanel
              monthKey={currentMonthKey}
              category="fun"
              onEdit={(entryId) => openQuickEntry(entryId)}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </TabsContent>
        </Tabs>
      </AppShell>
      <QuickEntryDrawer />
    </>
  );
}
