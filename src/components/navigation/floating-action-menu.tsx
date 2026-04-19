"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Gamepad2, Menu, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const FAB_ITEMS = [
  {
    id: "decision",
    label: "帮我决定",
    icon: Gamepad2,
    accentClassName: "border-fun/20 bg-fun/[0.12] text-foreground",
  },
  {
    id: "entry",
    label: "记一笔",
    icon: Plus,
    accentClassName: "border-primary/20 bg-primary/[0.12] text-foreground",
  },
] as const;

export function FloatingActionMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useMotionPreference();
  const openQuickEntry = useUiStore((state) => state.openQuickEntry);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  const handleQuickEntry = () => {
    setOpenPath(null);
    openQuickEntry();
  };

  const handleDecision = () => {
    setOpenPath(null);
    if (pathname !== "/decision") {
      router.push("/decision");
    }
  };

  return (
    <div className="pointer-events-none absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            className="pointer-events-auto flex flex-col items-end gap-2"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 10, scale: reducedMotion ? 1 : 0.98 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.16, ease: "easeOut" }}
          >
            {FAB_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const handleClick = item.id === "entry" ? handleQuickEntry : handleDecision;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={handleClick}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-2 shadow-[0_8px_24px_rgba(45,41,38,0.12)] backdrop-blur-sm",
                    item.accentClassName,
                  )}
                  initial={{ opacity: 0, x: 10, y: reducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 8, y: reducedMotion ? 0 : 6 }}
                  transition={{
                    duration: reducedMotion ? 0.1 : 0.14,
                    delay: reducedMotion ? 0 : (FAB_ITEMS.length - index - 1) * 0.02,
                    ease: "easeOut",
                  }}
                >
                  <span className="rounded-full bg-surface px-2 py-1 text-xs font-medium leading-none text-text-muted">
                    {item.label}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-surface text-foreground">
                    <Icon className="size-[18px]" />
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? "关闭快捷操作" : "打开快捷操作"}
        aria-expanded={open}
        onClick={() => setOpenPath((current) => (current === pathname ? null : pathname))}
        className="pointer-events-auto flex size-14 items-center justify-center rounded-full border border-primary/20 bg-primary text-white shadow-[0_14px_28px_rgba(164,90,42,0.26)] transition-transform duration-150 hover:scale-[1.02]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </div>
  );
}
