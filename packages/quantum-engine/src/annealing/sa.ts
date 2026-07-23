/**
 * Recocido simulado (Simulated Annealing) — solver QUBO determinista del lado cliente.
 *
 * Emula el "calentar/enfriar" de OpenJij que ve el jugador: a alta temperatura el estado salta
 * caóticamente (acepta subidas de energía), y al enfriar cae en un mínimo. Al ser determinista por
 * seed, el resultado del cliente es reproducible y el servidor puede revalidar la energía final.
 */
import type { Rng } from "../math/rng.js";
import { type Assignment, type QUBO, deltaEnergyOnFlip, energy } from "./qubo.js";

export interface AnnealSchedule {
  /** Temperatura inicial (alta = más exploración). */
  readonly tStart: number;
  /** Temperatura final (baja = explotación). */
  readonly tEnd: number;
  /** Número de barridos (cada barrido intenta voltear cada bit una vez). */
  readonly sweeps: number;
}

export const defaultSchedule: AnnealSchedule = { tStart: 5, tEnd: 0.05, sweeps: 200 };

export interface AnnealResult {
  readonly assignment: Assignment;
  readonly energy: number;
  /** Trayectoria de energía por barrido — alimenta la animación del paisaje de energía. */
  readonly trajectory: number[];
  readonly seed: number;
}

/** Temperatura geométrica en el barrido `k` de `sweeps`. */
function temperatureAt(schedule: AnnealSchedule, k: number): number {
  const { tStart, tEnd, sweeps } = schedule;
  if (sweeps <= 1) return tEnd;
  const ratio = tEnd / tStart;
  return tStart * Math.pow(ratio, k / (sweeps - 1));
}

/** Resuelve (aproximadamente) un QUBO por recocido simulado. */
export function simulatedAnneal(
  qubo: QUBO,
  rng: Rng,
  schedule: AnnealSchedule = defaultSchedule,
  initial?: Assignment,
): AnnealResult {
  const x: Array<0 | 1> = initial
    ? [...initial]
    : Array.from({ length: qubo.n }, () => (rng.bool() ? 1 : 0));

  let currentEnergy = energy(qubo, x);
  let best: Array<0 | 1> = [...x];
  let bestEnergy = currentEnergy;
  const trajectory: number[] = [];

  for (let sweep = 0; sweep < schedule.sweeps; sweep++) {
    const temp = temperatureAt(schedule, sweep);
    for (let k = 0; k < qubo.n; k++) {
      const delta = deltaEnergyOnFlip(qubo, x, k);
      // Criterio de Metropolis: acepta mejoras siempre; empeoramientos con prob e^{-ΔE/T}.
      if (delta <= 0 || rng.next() < Math.exp(-delta / temp)) {
        x[k] = (x[k] === 1 ? 0 : 1) as 0 | 1;
        currentEnergy += delta;
        if (currentEnergy < bestEnergy) {
          bestEnergy = currentEnergy;
          best = [...x];
        }
      }
    }
    trajectory.push(currentEnergy);
  }

  return { assignment: best, energy: bestEnergy, trajectory, seed: rng.seed };
}

/** Búsqueda exhaustiva del óptimo (solo para n pequeños; usada en tests y niveles fáciles). */
export function bruteForceMinimum(qubo: QUBO): AnnealResult {
  if (qubo.n > 20) throw new Error("bruteForceMinimum: n demasiado grande");
  let best: Array<0 | 1> = new Array<0 | 1>(qubo.n).fill(0);
  let bestEnergy = Infinity;
  for (let mask = 0; mask < 1 << qubo.n; mask++) {
    const x = Array.from({ length: qubo.n }, (_, i) => ((mask >> i) & 1) as 0 | 1);
    const e = energy(qubo, x);
    if (e < bestEnergy) {
      bestEnergy = e;
      best = x;
    }
  }
  return { assignment: best, energy: bestEnergy, trajectory: [bestEnergy], seed: -1 };
}
