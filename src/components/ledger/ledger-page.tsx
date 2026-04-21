"use client";

import { useMemo, useState, useTransition } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronRight, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/common/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_META } from "@/constants/app";
import { ledgerRepository } from "@/db/repositories/ledger-repository";
import { useMonthEntries } from "@/hooks/use-month-entries";
import { formatCurrency } from "@/lib/currency";
import { getMonthDate, getMonthLabel, listRecentMonthKeys, shiftMonthKey } from "@/lib/date";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";
import type { CategoryType } from "@/types/domain";

type FilterType = CategoryType | "all";

export function LedgerPageView() {
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const setCurrentMonthKey = useAppStore((state) => state.setCurrentMonthKey);
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const [category, setCategory] = useState<FilterType>("all");
  const [query, setQuery] = useState("");
  const [isDeleting, startDelete] = useTransition();
  const availableMonths = useLiveQuery(() => ledgerRepository.listAvailableMonths(), []);
  const { entries, isLoading } = useMonthEntries(currentMonthKey);

  const monthOptions = useMemo(() => {
    const recent = listRecentMonthKeys(currentMonthKey, 6);
    const merged = new Set<string>([currentMonthKey, ...recent, ...(availableMonths ?? [])]);
    return [...merged].sort((left, right) => right.localeCompare(left));
  }, [availableMonths, currentMonthKey]);

  const filtered = useMemo(() => {
    return (entries ?? []).filter((entry) => {
      const passCategory = category === "all" || entry.category === category;
      const passQuery =
        query.trim().length === 0 ||
        entry.emoji.includes(query.trim()) ||
        CATEGORY_META[entry.category].label.includes(query.trim());

      return passCategory && passQuery;
    });
  }, [category, entries, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, entry) => {
      const key = entry.createdAt.slice(0, 10);
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    }, {});
  }, [filtered]);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handleDelete = (entryId: string) => {
    if (!window.confirm("删除后不会自动恢复，确定删除这条记录吗？")) {
      return;
    }

    startDelete(() => {
      void ledgerRepository.deleteEntry(entryId);
    });
  };

  return (
    <AppShell>
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">账本</h1>
          <Button variant="outline" size="sm" onClick={() => openQuickEntry()}>
            记一笔
          </Button>
        </div>
        <p className="text-sm text-text-muted">{getMonthLabel(getMonthDate(currentMonthKey))}</p>
      </header>

      <section className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonthKey(shiftMonthKey(currentMonthKey, -1))}>
            上个月
          </Button>
          <select
            value={currentMonthKey}
            onChange={(event) => setCurrentMonthKey(event.target.value)}
            className="h-8 rounded-md border border-border-soft bg-surface px-2 text-sm"
          >
            {monthOptions.map((monthKey) => (
              <option key={monthKey} value={monthKey}>
                {getMonthLabel(getMonthDate(monthKey))}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonthKey(shiftMonthKey(currentMonthKey, 1))}>
            下个月
          </Button>
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
              onClick={() => setCategory(value)}
              className={`h-8 rounded-md border text-sm ${
                category === value ? "border-foreground text-foreground" : "border-border-soft text-text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按分类或 emoji 搜索"
            className="h-9 pl-8"
          />
        </div>
      </section>

      <section className="space-y-3">
        {isLoading ? <div className="list-row px-3 py-4 text-sm text-text-muted">加载中...</div> : null}

        {!isLoading && sortedDates.length === 0 ? (
          <div className="list-row px-3 py-4 text-sm text-text-muted">当前筛选条件下没有记录。</div>
        ) : null}

        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-2">
            <h2 className="px-1 text-xs font-medium text-text-muted">
              {new Date(dateKey).toLocaleDateString("zh-CN", {
                month: "long",
                day: "numeric",
                weekday: "short",
              })}
            </h2>
            <div className="space-y-2">
              {grouped[dateKey]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className="list-row flex w-full items-center gap-3 px-3 py-2 text-left"
                    onClick={() => openQuickEntry(entry.id)}
                  >
                    <span className="text-base">{entry.emoji || CATEGORY_META[entry.category].emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{CATEGORY_META[entry.category].label}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(entry.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(entry.amount)}</p>
                    <ChevronRight className="size-4 text-text-muted" />
                    <span
                      className="ml-1 inline-flex size-6 items-center justify-center rounded-md border border-border-soft"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(entry.id);
                      }}
                    >
                      <Trash2 className="size-3.5 text-text-muted" />
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>

      {isDeleting ? <p className="text-xs text-text-muted">正在删除...</p> : null}
    </AppShell>
  );
}
