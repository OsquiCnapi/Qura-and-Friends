import type { HTMLAttributes } from "react";
import { cn } from "./cn.js";

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)]/90 p-4 backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
