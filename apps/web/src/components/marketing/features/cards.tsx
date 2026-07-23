"use client";

import { motion } from "motion/react";
import { fadeUp, springs } from "@/lib/motion.js";

/* ---------- base ---------- */

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-3xl border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardCopy({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mt-4">
      <h3 className="text-[14px] font-bold text-[var(--color-quantum-text)]">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-quantum-muted)]">
        {desc}
      </p>
    </div>
  );
}

/* ---------- iconos ---------- */

function DiceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
      <circle cx="15" cy="15" r="1.4" fill="currentColor" />
      <circle cx="15" cy="9" r="1.4" fill="currentColor" />
      <circle cx="9" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

function TileIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9l8-4 8 4-8 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 15l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M2.5 1.5v9l8-4.5z" />
    </svg>
  );
}

function AtomIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.8" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.8" transform="rotate(120 12 12)" />
    </svg>
  );
}

/* ---------- FÁCIL (card alta con menú de "cómo se juega") ---------- */

const MENU_ROWS = [
  {
    icon: <DiceIcon />,
    bg: "#8b5cf6",
    title: "Tira el dado",
    desc: "Avanza por el tablero por turnos",
  },
  {
    icon: <TileIcon />,
    bg: "#22d3ee",
    title: "Cae en una casilla",
    desc: "Cada casilla es un concepto cuántico",
  },
  {
    icon: <PlayIcon />,
    bg: "#f59e0b",
    title: "Juega el minijuego",
    desc: "P1 con WASD, P2 con las flechas",
  },
  {
    icon: <AtomIcon />,
    bg: "#38bdf8",
    title: "Aprende de verdad",
    desc: "Superposición, entrelazamiento y más",
  },
];

export function EasyCard() {
  return (
    <Card className="flex flex-col md:row-span-2">
      <div className="flex flex-1 items-center justify-center py-6">
        <motion.div
          whileHover={{ scale: 1.03, rotate: -1 }}
          transition={springs.gentle}
          className="w-full max-w-[236px] rounded-[20px] bg-[#0b1020] p-1.5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.06]"
        >
          {MENU_ROWS.map((row, i) => (
            <div
              key={row.title}
              className={`flex items-start gap-3 px-3.5 py-3 ${
                i > 0 ? "border-t border-white/[0.08]" : ""
              }`}
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: row.bg }}
              >
                {row.icon}
              </span>
              <span>
                <span className="block text-[13px] font-semibold text-white">
                  {row.title}
                </span>
                <span className="block text-[11px] leading-snug text-white/50">
                  {row.desc}
                </span>
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      <CardCopy
        title="Fácil"
        desc="Seas nuevo o ya sepas de cuántica, Qura te lleva de la mano."
      />
    </Card>
  );
}

/* ---------- EN VIVO (pill con spinner) ---------- */

export function SecureCard() {
  return (
    <Card>
      <div className="flex h-28 items-center justify-center">
        <div className="flex items-center gap-2.5 rounded-full border-[3px] border-[var(--color-entanglement)] bg-[var(--color-quantum-surface-2)] py-2.5 pl-4 pr-5">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-[var(--color-entanglement)] border-t-transparent"
          />
          <span className="text-[14px] font-semibold text-[var(--color-entanglement)]">
            Sesión en vivo
          </span>
        </div>
      </div>
      <CardCopy
        title="En tiempo real"
        desc="Marcadores y progreso sincronizados en vivo con Supabase."
      />
    </Card>
  );
}

/* ---------- PROGRESIVO (timeline de niveles) ---------- */

const TIMELINE = [
  { label: "Básico", state: "done", meta: "qbronze" },
  { label: "Intermedio", state: "active", meta: "qsilver" },
  { label: "Temple cuántico", state: "pending", meta: "" },
] as const;

function TimelineIcon({ state }: { state: (typeof TIMELINE)[number]["state"] }) {
  if (state === "done") {
    return (
      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-superposition)]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-4.5 w-4.5 items-center justify-center">
        <motion.span
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-3 w-3 rounded-full border-2 border-[var(--color-entanglement)]"
        />
      </span>
    );
  }
  return (
    <span className="flex h-4.5 w-4.5 items-center justify-center">
      <span className="h-3 w-3 rounded-full border-2 border-[var(--color-quantum-border)]" />
    </span>
  );
}

export function FastCard() {
  return (
    <Card>
      <div className="flex h-28 items-center justify-center">
        <div className="w-full max-w-[220px] rounded-2xl bg-[var(--color-quantum-surface-2)] px-4 py-3">
          {TIMELINE.map((row, i) => (
            <div key={row.label} className="relative flex items-center gap-2.5 py-1.5">
              {i < TIMELINE.length - 1 && (
                <span className="absolute left-[8.5px] top-[26px] h-3 border-l-2 border-dotted border-[var(--color-quantum-border)]" />
              )}
              <TimelineIcon state={row.state} />
              <span
                className={`text-[12px] font-semibold ${
                  row.state === "pending"
                    ? "text-[var(--color-quantum-muted)]"
                    : "text-[var(--color-quantum-text)]"
                }`}
              >
                {row.label}
              </span>
              {row.meta && (
                <span className="ml-auto text-[10px] text-[var(--color-quantum-muted)]">
                  {row.meta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <CardCopy
        title="Progresivo"
        desc="Empieza fácil y llega hasta el recocido cuántico, paso a paso."
      />
    </Card>
  );
}

/* ---------- AUTÉNTICO (mini card del motor cuántico) ---------- */

function Bolt({ color }: { color: string }) {
  return (
    <svg width="11" height="14" viewBox="0 0 12 16" aria-hidden>
      <path d="M7 0 0 9h4l-1 7 7-9H6z" fill={color} />
    </svg>
  );
}

export function PowerfulCard() {
  return (
    <Card>
      <div className="flex h-28 items-center justify-center">
        <motion.div
          whileHover={{ y: -3 }}
          transition={springs.gentle}
          className="flex w-full max-w-[210px] items-center justify-between rounded-2xl bg-[var(--color-quantum-surface-2)] px-4 py-3"
        >
          <div>
            <p className="text-[10.5px] text-[var(--color-quantum-muted)]">Estado cuántico</p>
            <p className="text-[15px] font-bold text-[var(--color-quantum-text)]">|ψ⟩ · 2 qubits</p>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Bolt color="#22d3ee" />
            <Bolt color="#f59e0b" />
            <Bolt color="#8b5cf6" />
          </div>
        </motion.div>
      </div>
      <CardCopy
        title="Auténtico"
        desc="Un motor cuántico real: superposición y medición de verdad, no animaciones."
      />
    </Card>
  );
}

/* ---------- DIVERTIDO (fila de íconos) ---------- */

function DiceGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2" />
      <circle cx="9" cy="9" r="1.5" fill="#fff" />
      <circle cx="15" cy="15" r="1.5" fill="#fff" />
      <circle cx="15" cy="9" r="1.5" fill="#fff" />
      <circle cx="9" cy="15" r="1.5" fill="#fff" />
    </svg>
  );
}

function TrophyGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 4h10v4a5 5 0 01-10 0z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 5H4v1a3 3 0 003 3M17 5h3v1a3 3 0 01-3 3M9 20h6M10 20l.5-4h3l.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AtomGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="2.4" fill="#fff" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#fff" strokeWidth="2" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#fff" strokeWidth="2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#fff" strokeWidth="2" transform="rotate(120 12 12)" />
    </svg>
  );
}

function CatGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 10 4 4l6 3a8 8 0 018 0l6-3-2 6a8 8 0 01-16 0z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="9.5" cy="12" r="1.2" fill="#fff" />
      <circle cx="14.5" cy="12" r="1.2" fill="#fff" />
    </svg>
  );
}

const FUN_ITEMS = [
  { key: "dice", bg: "#8b5cf6", Glyph: DiceGlyph },
  { key: "trophy", bg: "#f59e0b", Glyph: TrophyGlyph },
  { key: "atom", bg: "#22d3ee", Glyph: AtomGlyph },
  { key: "cat", bg: "#fb7185", Glyph: CatGlyph },
];

export function FunCard() {
  return (
    <Card>
      <div className="flex h-28 items-center justify-center">
        <div className="flex -space-x-1.5">
          {FUN_ITEMS.map((item) => (
            <motion.span
              key={item.key}
              whileHover={{ y: -8, scale: 1.1 }}
              transition={springs.bouncy}
              style={{ background: item.bg }}
              className="flex h-12 w-12 cursor-default items-center justify-center rounded-full ring-4 ring-[var(--color-quantum-surface)]"
            >
              <item.Glyph />
            </motion.span>
          ))}
        </div>
      </div>
      <CardCopy
        title="Divertido"
        desc="Dados, minijuegos y Qura como anfitrión. Aprender nunca fue tan party."
      />
    </Card>
  );
}
