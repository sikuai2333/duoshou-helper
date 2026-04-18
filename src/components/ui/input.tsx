import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-border-soft bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-text-muted/80 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
