"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/info-tip";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  summary?: React.ReactNode;
  summaryClassName?: string;
  tipText?: string;
  defaultOpen?: boolean;
  accentClassName?: string;
  className?: string;
  contentClassName?: string;
}

export function CollapsibleCard({
  eyebrow,
  title,
  children,
  summary,
  summaryClassName,
  tipText,
  defaultOpen = false,
  accentClassName = "border-primary/55",
  className,
  contentClassName,
}: CollapsibleCardProps) {
  const reducedMotion = useMotionPreference();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className={cn("overflow-hidden border-t-4", accentClassName, className)}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-1">
          <p className="app-eyebrow">{eyebrow}</p>
          {tipText ? <InfoTip text={tipText} label={`查看${title}说明`} /> : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-start justify-between gap-4 py-1 text-left"
          aria-expanded={open}
        >
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            {summary ? (
              <div
                className={cn(
                  "mt-2 inline-flex max-w-full rounded-md border border-border-soft/80 bg-surface-strong px-3 py-2 text-sm leading-5 text-text-muted",
                  summaryClassName,
                )}
              >
                {summary}
              </div>
            ) : null}
          </div>
          <motion.span
            className="mt-1 text-text-muted"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.16 }}
          >
            <ChevronDown className="size-4" />
          </motion.span>
        </button>
      </CardHeader>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <CardContent className={cn("pt-4", contentClassName)}>{children}</CardContent>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
