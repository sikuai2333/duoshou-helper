"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_ITEMS } from "@/constants/app";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto surface-card flex w-full max-w-[30rem] items-center justify-between rounded-[1.85rem] px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-[1.3rem] px-3 py-2 text-[11px] font-medium",
                isActive ? "text-foreground" : "text-text-muted",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 rounded-[1.3rem] bg-white/85 shadow-[0_10px_24px_rgba(83,61,47,0.1)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 flex size-9 items-center justify-center rounded-full",
                  isActive ? "bg-primary/14 text-primary" : "bg-white/70",
                )}
              >
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
