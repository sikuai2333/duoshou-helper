"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/app";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[32rem] border-t border-border-soft bg-surface pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="flex w-full items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 px-3 py-3 text-[11px] font-medium transition-colors duration-150",
                isActive ? "text-foreground" : "text-text-muted",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-3 top-0 h-0.5",
                  isActive ? "bg-foreground" : "bg-transparent",
                )}
              />
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
