"use client";

import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  text: string;
  label?: string;
  align?: "left" | "right";
  widthClassName?: string;
  className?: string;
}

const TIP_DISMISS_MS = 3200;

export function InfoTip({
  text,
  label = "显示说明",
  align = "right",
  widthClassName = "w-56",
  className,
}: InfoTipProps) {
  const reducedMotion = useMotionPreference();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => setOpen(false), TIP_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-5 items-center justify-center rounded-full text-text-muted transition-colors duration-150 hover:bg-surface-strong hover:text-foreground"
      >
        <CircleHelp className="size-4" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className={cn(
              "pointer-events-none absolute top-full z-30 mt-2 rounded-md border border-border-soft bg-surface px-3 py-2 text-xs leading-5 text-text-muted shadow-[0_2px_8px_rgba(45,41,38,0.08)]",
              align === "left" ? "left-0" : "right-0",
              widthClassName,
            )}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.16, ease: "easeOut" }}
          >
            {text}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
