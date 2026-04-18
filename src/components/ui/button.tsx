import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-[0_14px_32px_rgba(255,111,71,0.28)] hover:bg-primary-strong",
        secondary:
          "bg-secondary text-foreground shadow-[0_12px_28px_rgba(255,211,114,0.24)] hover:brightness-95",
        outline:
          "border border-border-soft bg-white/80 text-foreground hover:bg-white",
        ghost: "bg-transparent text-text-muted hover:bg-white/70 hover:text-foreground",
        essential: "bg-essential text-white hover:brightness-95",
        fun: "bg-fun text-white hover:brightness-95",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
