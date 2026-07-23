import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface DialogueBoxProps {
  /** Personaje que habla (narrativa Alicia). */
  speaker: string;
  children: ReactNode;
  accent?: string;
  className?: string;
}

/** Caja de diálogo narrativo (tutoriales/historia). El copy real vive en i18n. */
export function DialogueBox({ speaker, children, accent = "var(--color-superposition)", className }: DialogueBoxProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)]/95 p-4 shadow-lg",
        className,
      )}
    >
      <div className="mb-1 text-sm font-semibold" style={{ color: accent }}>
        {speaker}
      </div>
      <div className="text-[var(--color-quantum-text)]">{children}</div>
    </div>
  );
}
