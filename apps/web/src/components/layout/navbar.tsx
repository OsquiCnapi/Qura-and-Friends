"use client";

import { motion } from "motion/react";
import { springs } from "@/lib/motion.js";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2 3.5 5 6.5 8 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Lockup de marca: glyph de gato/átomo + wordmark con degradado cuántico. */
function LogoMark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#8b5cf6" opacity="0.16" />
        {/* orejas de gato */}
        <path d="M8 12 6 4l8 5z" fill="#a78bfa" />
        <path d="M24 12 26 4l-8 5z" fill="#a78bfa" />
        {/* órbita cuántica */}
        <ellipse cx="16" cy="17" rx="12" ry="5" stroke="#22d3ee" strokeWidth="1.6" transform="rotate(-20 16 17)" />
        <circle cx="16" cy="17" r="5.5" fill="#c4b5fd" />
        <circle cx="13.5" cy="16" r="1.3" fill="#2b1b55" />
        <circle cx="18.5" cy="16" r="1.3" fill="#2b1b55" />
      </svg>
      <span className="bg-gradient-to-r from-[var(--color-superposition)] via-[var(--color-entanglement)] to-[var(--color-interference)] bg-clip-text text-[17px] font-bold tracking-tight text-transparent">
        Qura &amp; Friends
      </span>
    </span>
  );
}

const NAV_LINKS = [
  { label: "Cómo se juega", hasMenu: true },
  { label: "Conceptos", hasMenu: true },
  // Único enlace real de la lista: los otros dos son placeholders de un menú desplegable futuro.
  { label: "Aula", hasMenu: false, href: "/aula" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-quantum-border)] bg-[var(--color-quantum-bg)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center">
            <LogoMark />
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) =>
              link.href ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1 text-[13.5px] font-medium text-[var(--color-quantum-muted)] transition-colors hover:text-[var(--color-quantum-text)]"
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={link.label}
                  type="button"
                  className="flex items-center gap-1 text-[13.5px] font-medium text-[var(--color-quantum-muted)] transition-colors hover:text-[var(--color-quantum-text)]"
                >
                  {link.label}
                  {link.hasMenu && <Chevron />}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.a
            href="/lab/bloch-gates"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            className="rounded-full border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] px-4 py-2 text-[13px] font-semibold text-[var(--color-quantum-text)]"
          >
            Laboratorio
          </motion.a>
          <motion.a
            href="/board"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            className="rounded-full bg-[var(--color-superposition)] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_0_20px_-4px_var(--color-superposition)]"
          >
            Jugar
          </motion.a>
        </div>
      </nav>
    </header>
  );
}
