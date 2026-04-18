import type { LucideIcon } from "lucide-react";
import {
  House,
  NotebookTabs,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { CategoryType } from "@/types/domain";

export const APP_SETTINGS_ID = "app-settings";
export const DEFAULT_BUDGET = 3200;
export const DEFAULT_MILK_TEA_CUPS = 10;
export const EXPORT_SCHEMA_VERSION = "1.0.0";

export const CATEGORY_META: Record<
  CategoryType,
  {
    label: string;
    emoji: string;
    accentClassName: string;
    badgeClassName: string;
  }
> = {
  essential: {
    label: "生活必需",
    emoji: "🥬",
    accentClassName:
      "from-essential/18 to-accent/10 text-foreground ring-essential/25",
    badgeClassName: "bg-essential/12 text-essential",
  },
  fun: {
    label: "娱乐",
    emoji: "💸",
    accentClassName: "from-fun/18 to-primary/10 text-foreground ring-fun/25",
    badgeClassName: "bg-fun/12 text-fun",
  },
};

export const QUICK_EMOJIS: Record<CategoryType, string[]> = {
  essential: ["🥬", "🛒", "🍜", "🚇", "🧻", "💊"],
  fun: ["💸", "🎬", "🧋", "🎮", "🎁", "🍰"],
};

export const NAV_ITEMS: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/", label: "首页", icon: House },
  { href: "/ledger", label: "账本", icon: NotebookTabs },
  { href: "/decision", label: "决策", icon: Sparkles },
  { href: "/settings", label: "设置", icon: SlidersHorizontal },
];
