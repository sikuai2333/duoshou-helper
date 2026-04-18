"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { getSheetMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: SheetProps) {
  const reducedMotion = useMotionPreference();
  const motionConfig = getSheetMotion(reducedMotion);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-[rgba(44,33,29,0.36)] backdrop-blur-sm"
                initial={motionConfig.overlay.initial}
                animate={motionConfig.overlay.animate}
                exit={motionConfig.overlay.exit}
                transition={motionConfig.overlay.transition}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild onOpenAutoFocus={(event) => event.preventDefault()}>
              <motion.div
                className={cn(
                  "fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] border border-border-soft bg-surface-strong px-5 pb-8 pt-3 shadow-[0_-18px_60px_rgba(84,58,44,0.18)]",
                  className,
                )}
                initial={motionConfig.panel.initial}
                animate={motionConfig.panel.animate}
                exit={motionConfig.panel.exit}
                transition={motionConfig.panel.transition}
              >
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[rgba(122,102,93,0.2)]" />
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Dialog.Title className="font-display text-xl font-semibold">
                      {title}
                    </Dialog.Title>
                    {description ? (
                      <Dialog.Description className="text-sm leading-6 text-text-muted">
                        {description}
                      </Dialog.Description>
                    ) : null}
                  </div>
                  <Dialog.Close className="flex size-9 items-center justify-center rounded-full bg-white/80 text-text-muted transition hover:text-foreground">
                    <X className="size-4" />
                    <span className="sr-only">关闭</span>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
