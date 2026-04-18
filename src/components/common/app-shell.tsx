import type { PropsWithChildren } from "react";
import { PageTransition } from "@/components/animation/page-transition";
import { cn } from "@/lib/utils";

interface AppShellProps extends PropsWithChildren {
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return <PageTransition className={cn(className)}>{children}</PageTransition>;
}
