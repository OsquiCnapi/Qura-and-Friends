"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { fadeUp, springs, staggerContainer } from "@/lib/motion.js";
import { HeroIllustrationLeft, HeroIllustrationRight } from "./illustrations.js";

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5c.75 4.3 2.3 5.85 6.6 6.6-4.3.75-5.85 2.3-6.6 6.6-.75-4.3-2.3-5.85-6.6-6.6 4.3-.75 5.85-2.3 6.6-6.6z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations();
  return (
    <section className="relative overflow-hidden">
      {/* resplandor cuántico de fondo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 22%, rgba(139,92,246,0.22), transparent 70%)," +
            "radial-gradient(45% 40% at 82% 65%, rgba(34,211,238,0.16), transparent 70%)," +
            "radial-gradient(45% 40% at 16% 60%, rgba(245,158,11,0.12), transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-6 pb-24 pt-16 lg:grid-cols-[1fr_minmax(380px,460px)_1fr] lg:gap-2">
        <HeroIllustrationLeft />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-md text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-balance bg-gradient-to-r from-[var(--color-superposition)] via-[var(--color-entanglement)] to-[var(--color-interference)] bg-clip-text text-[46px] font-bold leading-[1.02] tracking-tight text-transparent sm:text-[58px]"
          >
            {t("landing.brand")}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-sm text-[14.5px] leading-relaxed text-[var(--color-quantum-muted)]"
          >
            {t("landing.description")}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.a
              href="/board"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              className="flex items-center gap-2 rounded-full bg-[var(--color-superposition)] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_0_24px_-4px_var(--color-superposition)]"
            >
              <SparkleIcon />
              {t("landing.startLocal")}
            </motion.a>
            <motion.a
              href="/lab/bloch-gates"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              className="flex items-center gap-2 rounded-full border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] px-5 py-2.5 text-[13px] font-semibold text-[var(--color-quantum-text)]"
            >
              <FlaskIcon />
              {t("landing.openLab")}
            </motion.a>
          </motion.div>
        </motion.div>

        <HeroIllustrationRight />
      </div>
    </section>
  );
}
