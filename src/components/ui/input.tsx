import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-[1.15rem] border border-border-soft bg-white/85 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-text-muted/80 focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
