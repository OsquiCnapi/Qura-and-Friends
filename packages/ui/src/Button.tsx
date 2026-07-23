import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn.js";

const button = cva(
  "inline-flex items-center justify-center rounded-[var(--radius-quantum)] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-superposition)] disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-superposition)] text-white hover:brightness-110",
        ghost: "bg-transparent text-[var(--color-quantum-text)] hover:bg-[var(--color-quantum-surface-2)]",
        outline:
          "border border-[var(--color-quantum-border)] text-[var(--color-quantum-text)] hover:bg-[var(--color-quantum-surface-2)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
