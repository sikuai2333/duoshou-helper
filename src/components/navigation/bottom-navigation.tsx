"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_ITEMS } from "@/constants/app";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto flex w-full items-stretch border-t border-border-soft bg-surface/98 pb-[max(env(safe-area-inset-bottom),0px)] backdrop-blur-sm">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 border-t-2 px-3 py-3 text-[11px] font-medium transition-colors duration-150",
                isActive ? "text-foreground" : "text-text-muted",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-0 top-0 h-0.5 bg-foreground"
                  transition={{ duration: 0.16 }}
                />
              ) : null}
              <span className={cn("relative z-10 flex size-5 items-center justify-center", isActive ? "text-foreground" : "text-text-muted")}>
                <Icon className="size-4" />
              </span>
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
