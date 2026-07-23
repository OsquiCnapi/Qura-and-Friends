import type { Transition, Variants } from "motion/react";

/** Springs con nombre — un solo vocabulario de movimiento en toda la landing. */
export const springs: Record<"snappy" | "gentle" | "bouncy", Transition> = {
  snappy: { type: "spring", stiffness: 420, damping: 30 },
  gentle: { type: "spring", stiffness: 170, damping: 24 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 170, damping: 24 },
  },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
