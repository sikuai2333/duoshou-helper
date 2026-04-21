"use client";

import { useMemo, useState, useTransition } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search } from "lucide-react";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_META } from "@/constants/app";
import { ledgerRepository } from "@/db/repositories/ledger-repository";
import { useMonthEntries } from "@/hooks/use-month-entries";
import { formatCurrency } from "@/lib/currency";
import { getMonthDate, getMonthLabel, listRecentMonthKeys } from "@/lib/date";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";
import type { CategoryType } from "@/types/domain";

type FilterCategory = "all" | CategoryType;

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function LedgerPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const setCurrentMonthKey = useAppStore((state) => state.setCurrentMonthKey);
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [keyword, setKeyword] = useState("");

  const availableMonths = useLiveQuery(() => ledgerRepository.listAvailableMonths(), []);
  const { entries, isLoading } = useMonthEntries(currentMonthKey);

  const monthOptions = useMemo(() => {
    const recent = listRecentMonthKeys(currentMonthKey, 6);
    const merged = new Set<string>([currentMonthKey, ...recent, ...(availableMonths ?? [])]);
    return [...merged].sort((a, b) => b.localeCompare(a));
  }, [availableMonths, currentMonthKey]);

  const filteredEntries = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return (entries ?? []).filter((entry) => {
      const categoryMatch = categoryFilter === "all" || entry.category === categoryFilter;
      const textMatch =
        text.length === 0 ||
        entry.emoji.toLowerCase().includes(text) ||
        CATEGORY_META[entry.category].label.toLowerCase().includes(text);
      return categoryMatch && textMatch;
    });
  }, [categoryFilter, entries, keyword]);

  const groupedEntries = useMemo(() => {
    return filteredEntries.reduce<Record<string, typeof filteredEntries>>((groups, entry) => {
      const key = dayKey(entry.createdAt);
      groups[key] = [...(groups[key] ?? []), entry];
      return groups;
    }, {});
  }, [filteredEntries]);

  const sortedGroupKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  const handleDelete = (entryId: string) => {
    if (!window.confirm("删除后无法恢复，确定删除这条记录吗？")) {
      return;
    }

    startDeleteTransition(() => {
      void ledgerRepository.deleteEntry(entryId);
    });
  };

  return (
    <AppShell>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">账本</h1>
        <p className="text-sm text-text-muted">按时间、分类筛选流水，点记录可直接编辑。</p>
      </header>

      <section className="surface-card space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          {monthOptions.map((monthKey) => (
            <button
              key={monthKey}
              type="button"
              onClick={() => setCurrentMonthKey(monthKey)}
              className={
                monthKey === currentMonthKey
                  ? "rounded-md border border-primary bg-surface px-3 py-2 text-sm text-primary"
                  : "rounded-md border border-border-soft bg-surface px-3 py-2 text-sm text-text-muted"
              }
            >
              {getMonthLabel(getMonthDate(monthKey))}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {([
            ["all", "全部"],
            ["essential", "生活必需"],
            ["fun", "娱乐"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={
                categoryFilter === value
                  ? "rounded-md border border-primary bg-surface px-3 py-2 text-sm text-primary"
                  : "rounded-md border border-border-soft bg-surface px-3 py-2 text-sm text-text-muted"
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索分类或 emoji"
            className="pl-9"
          />
        </div>
      </section>

      <Button variant="outline" onClick={() => openQuickEntry()}>
        记一笔
      </Button>

      <section className="surface-card p-4">
        {isLoading ? (
          <p className="text-sm text-text-muted">正在读取流水...</p>
        ) : sortedGroupKeys.length === 0 ? (
          <p className="text-sm text-text-muted">这个筛选条件下暂无流水。</p>
        ) : (
          <div className="space-y-4">
            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="space-y-1">
                <h2 className="text-xs font-medium text-text-muted">{groupKey}</h2>
                {groupedEntries[groupKey].map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border-soft py-2 last:border-b-0"
                  >
                    <button
                      type="button"
                      className="text-xl"
                      onClick={() => openQuickEntry(entry.id)}
                      aria-label="编辑这条记录"
                    >
                      {entry.emoji}
                    </button>
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => openQuickEntry(entry.id)}
                    >
                      <p className="text-sm font-medium">{CATEGORY_META[entry.category].label}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(entry.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(entry.amount)}</p>
                      <button
                        type="button"
                        className="text-xs text-danger"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
