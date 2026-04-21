"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/app";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto flex w-full items-stretch border-t border-border-soft bg-surface pb-[max(env(safe-area-inset-bottom),0px)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 border-t-2 px-3 py-3 text-[11px] font-medium transition-colors duration-150",
                isActive ? "border-primary text-primary" : "border-transparent text-text-muted",
              )}
            >
              <span className="flex size-5 items-center justify-center">
                <Icon className="size-4" />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
