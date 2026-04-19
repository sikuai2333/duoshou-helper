"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { getAppOverlayRoot, getAppScreenElement } from "@/lib/portal";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  text: string;
  label?: string;
  align?: "left" | "right";
  maxWidth?: number;
  className?: string;
}

const TIP_DISMISS_MS = 3200;
const VIEWPORT_PADDING = 12;

export function InfoTip({
  text,
  label = "显示说明",
  align = "right",
  maxWidth = 280,
  className,
}: InfoTipProps) {
  const reducedMotion = useMotionPreference();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const canPortal = typeof document !== "undefined";
  const portalContainer = canPortal ? getAppOverlayRoot() : null;
  const screenElement = canPortal ? getAppScreenElement() : null;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timer = window.setTimeout(() => setOpen(false), TIP_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return undefined;
    }

    const updatePosition = () => {
      if (!triggerRef.current) {
        return;
      }

      const rect = triggerRef.current.getBoundingClientRect();
      const containerRect = screenElement?.getBoundingClientRect() ??
        portalContainer?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      const width = Math.min(maxWidth, containerRect.width - VIEWPORT_PADDING * 2);
      const idealLeft =
        align === "left"
          ? rect.left - containerRect.left
          : rect.right - containerRect.left - width;
      const left = Math.min(
        Math.max(VIEWPORT_PADDING, idealLeft),
        containerRect.width - width - VIEWPORT_PADDING,
      );
      const top = Math.min(
        rect.bottom - containerRect.top + 8,
        containerRect.height - 72,
      );

      setPosition({ top, left, width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, maxWidth, open, portalContainer, screenElement]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || bubbleRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const bubble = open && canPortal && position
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={bubbleRef}
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className={cn(
              "z-50 rounded-md border border-border-soft bg-surface px-3 py-2 text-xs leading-5 text-text-muted shadow-[0_2px_8px_rgba(45,41,38,0.08)]",
              portalContainer ? "absolute pointer-events-auto" : "fixed",
            )}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : 4 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.16, ease: "easeOut" }}
          >
            {text}
          </motion.div>
        </AnimatePresence>,
        portalContainer ?? document.body,
      )
    : null;

  return (
    <div className={cn("inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex size-5 items-center justify-center rounded-full text-text-muted transition-colors duration-150 hover:bg-surface-strong hover:text-foreground"
      >
        <CircleHelp className="size-4" />
      </button>
      {bubble}
    </div>
  );
}
