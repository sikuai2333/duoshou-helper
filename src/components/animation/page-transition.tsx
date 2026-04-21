"use client";

import type { PropsWithChildren } from "react";
import { motion } from "motion/react";
import { useMotionPreference } from "@/hooks/use-motion-preference";
import { getFadeUpMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps extends PropsWithChildren {
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const reducedMotion = useMotionPreference();
  const motionProps = getFadeUpMotion(reducedMotion);

  return (
    <motion.main
      className={cn("app-container flex flex-1 flex-col gap-4", className)}
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
    >
      {children}
    </motion.main>
  );
}
