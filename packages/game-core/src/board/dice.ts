/** Dado determinista por RNG sembrado. */
import type { Rng } from "@quantum-party/quantum-engine";

export function rollDie(rng: Rng, sides = 6): number {
  return rng.int(sides) + 1;
}
