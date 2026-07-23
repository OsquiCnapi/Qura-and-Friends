"use client";

import { motion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/motion.js";
import {
  EasyCard,
  FastCard,
  FunCard,
  PowerfulCard,
  SecureCard,
} from "./cards.js";

export function FeatureSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-28 pt-10">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="text-balance text-center text-[26px] font-semibold tracking-tight text-[var(--color-quantum-text)] sm:text-[28px]"
      >
        Explora Qura and Friends de una forma totalmente nueva.
      </motion.h2>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-12 grid gap-5 md:grid-cols-3"
      >
        {/* col 1: card alta (2 filas) — igual al diseño */}
        <EasyCard />
        <SecureCard />
        <FastCard />
        <PowerfulCard />
        <FunCard />
      </motion.div>
    </section>
  );
}
