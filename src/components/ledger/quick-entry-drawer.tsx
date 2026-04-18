"use client";

import { useState, useTransition } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { z } from "zod";
import { CATEGORY_META, QUICK_EMOJIS } from "@/constants/app";
import { ledgerRepository } from "@/db/repositories/ledger-repository";
import { useAppStore } from "@/stores/app-store";
import { useUiStore } from "@/stores/ui-store";
import type { CategoryType, LedgerEntry } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const quickEntrySchema = z.object({
  amount: z.number().positive("金额要大于 0").max(99999, "金额先控制在五位数以内"),
  category: z.enum(["essential", "fun"]),
  emoji: z.string().min(1, "选一个 emoji 会更好认"),
});

interface EntryFormBodyProps {
  currentMonthKey: string;
  entry?: LedgerEntry | null;
  onClose: () => void;
  onSaved: () => void;
}

function EntryFormBody({
  currentMonthKey,
  entry,
  onClose,
  onSaved,
}: EntryFormBodyProps) {
  const [amount, setAmount] = useState(entry ? String(entry.amount) : "");
  const [category, setCategory] = useState<CategoryType>(entry?.category ?? "fun");
  const [emoji, setEmoji] = useState(entry?.emoji ?? QUICK_EMOJIS.fun[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(entry);

  const handleCategoryChange = (nextCategory: CategoryType) => {
    setCategory(nextCategory);
    if (!QUICK_EMOJIS[nextCategory].includes(emoji)) {
      setEmoji(QUICK_EMOJIS[nextCategory][0]);
    }
  };

  const handleSubmit = () => {
    const parsed = quickEntrySchema.safeParse({
      amount: Number.parseFloat(amount),
      category,
      emoji,
    });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "表单还没填完整");
      return;
    }

    startTransition(() => {
      const task =
        isEditing && entry
          ? ledgerRepository.updateEntry(entry.id, parsed.data)
          : ledgerRepository.addEntry({
              ...parsed.data,
              monthKey: currentMonthKey,
            });

      void task
        .then(() => {
          onSaved();
          onClose();
        })
        .catch(() => {
          setErrorMessage(isEditing ? "更新失败，请稍后再试。" : "保存失败，请稍后再试。");
        });
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="amount">
          金额
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-text-muted">
            ¥
          </span>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="比如 38"
            className="h-12 pl-9 text-lg font-semibold tabular-nums"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">分类</p>
        <div className="grid grid-cols-2 gap-3">
          {(["essential", "fun"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleCategoryChange(item)}
              className={cn(
                "rounded-md border px-4 py-3 text-left transition-colors",
                category === item
                  ? "border-foreground bg-surface-strong text-foreground"
                  : "border-border-soft bg-surface text-text-muted",
              )}
            >
              <p className="text-sm font-semibold">
                {CATEGORY_META[item].emoji} {CATEGORY_META[item].label}
              </p>
              <p className="mt-1 text-xs">点一下就归类</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">emoji</p>
        <div className="grid grid-cols-6 gap-2">
          {QUICK_EMOJIS[category].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setEmoji(item)}
              className={cn(
                "flex h-11 items-center justify-center rounded-md border text-xl transition-colors",
                emoji === item
                  ? "border-foreground bg-surface-strong"
                  : "border-border-soft bg-surface",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? (
        <div className="app-feedback border-danger text-sm text-danger">{errorMessage}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onClose}>
          先不记
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "保存中..." : isEditing ? "更新记录" : "保存这笔"}
        </Button>
      </div>
    </div>
  );
}

export function QuickEntryDrawer() {
  const isOpen = useUiStore((state) => state.isQuickEntryOpen);
  const closeQuickEntry = useUiStore((state) => state.closeQuickEntry);
  const markEntrySaved = useUiStore((state) => state.markEntrySaved);
  const editingEntryId = useUiStore((state) => state.editingEntryId);
  const currentMonthKey = useAppStore((state) => state.currentMonthKey);
  const editingEntry = useLiveQuery(
    () => (editingEntryId ? ledgerRepository.getEntry(editingEntryId) : null),
    [editingEntryId],
  );

  const isEditing = Boolean(editingEntryId);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeQuickEntry();
        }
      }}
      title={isEditing ? "编辑记录" : "记一笔"}
      description={
        isEditing
          ? "改完金额或分类后，这个月的预算会立刻重算。"
          : "金额最重要，分类和 emoji 尽量点一下就能完成。"
      }
    >
      {isEditing && editingEntry === undefined ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-md bg-surface-strong" />
          <div className="h-24 animate-pulse rounded-md bg-surface-strong" />
          <div className="h-24 animate-pulse rounded-md bg-surface-strong" />
        </div>
      ) : editingEntryId && !editingEntry ? (
        <div className="space-y-4">
          <div className="app-feedback border-danger text-sm text-danger">
            这条记录已经不存在了，可能刚刚被删除。
          </div>
          <Button variant="outline" className="w-full" onClick={closeQuickEntry}>
            关闭
          </Button>
        </div>
      ) : (
        <EntryFormBody
          key={editingEntry?.id ?? "create-entry"}
          currentMonthKey={currentMonthKey}
          entry={editingEntry}
          onClose={closeQuickEntry}
          onSaved={markEntrySaved}
        />
      )}
    </Sheet>
  );
}
