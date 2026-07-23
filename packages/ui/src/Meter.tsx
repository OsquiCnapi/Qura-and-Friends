import { cn } from "./cn.js";

export interface MeterProps {
  /** Valor normalizado 0..1 (p.ej. la barra de coherencia). */
  value: number;
  label?: string;
  color?: string;
  className?: string;
}

/** Barra/medidor accesible — base de la barra de coherencia del HUD. */
export function Meter({ value, label, color = "var(--color-superposition)", className }: MeterProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={cn("w-full", className)}
      role="meter"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      {label && <span className="mb-1 block text-xs text-[var(--color-quantum-muted)]">{label}</span>}
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-quantum-surface-2)]">
        <div
          className="h-full rounded-full transition-[width] duration-150 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
