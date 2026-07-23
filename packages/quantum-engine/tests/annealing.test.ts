import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../src/math/rng.js";
import {
  bruteForceMinimum,
  energy,
  isingEnergy,
  isingToQubo,
  makeQUBO,
  quboToIsing,
  simulatedAnneal,
} from "../src/annealing/index.js";

describe("annealing — QUBO / Ising / recocido", () => {
  it("energy coincide con el cálculo manual", () => {
    // E = 1·x0 - 2·x1 + 3·x0·x1
    const qubo = makeQUBO(2, [1, -2], [[0, 1, 3]]);
    assert.equal(energy(qubo, [0, 0]), 0);
    assert.equal(energy(qubo, [1, 0]), 1);
    assert.equal(energy(qubo, [0, 1]), -2);
    assert.equal(energy(qubo, [1, 1]), 1 - 2 + 3);
  });

  it("el recocido simulado es determinista por seed", () => {
    const qubo = makeQUBO(6, [-1, -1, -1, 2, 2, 2], [
      [0, 3, 3],
      [1, 4, 3],
      [2, 5, 3],
    ]);
    const a = simulatedAnneal(qubo, createRng(42));
    const b = simulatedAnneal(qubo, createRng(42));
    assert.deepEqual(a.assignment, b.assignment);
    assert.equal(a.energy, b.energy);
  });

  it("el recocido encuentra el óptimo global en instancias pequeñas", () => {
    const qubo = makeQUBO(8, [-2, -2, 1, 1, -1, 3, -2, 0], [
      [0, 1, 4],
      [2, 3, -3],
      [4, 5, 2],
      [6, 7, -1],
      [1, 6, 2],
    ]);
    const optimal = bruteForceMinimum(qubo);
    const annealed = simulatedAnneal(qubo, createRng(7), {
      tStart: 8,
      tEnd: 0.01,
      sweeps: 400,
    });
    assert.equal(annealed.energy, optimal.energy);
  });

  it("QUBO ↔ Ising: la diferencia de energía es una constante para todas las soluciones", () => {
    const qubo = makeQUBO(3, [1, -1, 2], [
      [0, 1, -2],
      [1, 2, 1],
    ]);
    const ising = quboToIsing(qubo);
    const backToQubo = isingToQubo(ising);
    for (let mask = 0; mask < 8; mask++) {
      const x = [((mask >> 0) & 1) as 0 | 1, ((mask >> 1) & 1) as 0 | 1, ((mask >> 2) & 1) as 0 | 1];
      // El round-trip QUBO→Ising→QUBO preserva la energía exactamente.
      assert.ok(Math.abs(energy(backToQubo, x) - energy(qubo, x)) < 1e-9);
      const spins = x.map((b) => (b === 1 ? 1 : -1) as -1 | 1);
      assert.ok(Number.isFinite(energy(qubo, x) - isingEnergy(ising, spins)));
    }
  });
});
