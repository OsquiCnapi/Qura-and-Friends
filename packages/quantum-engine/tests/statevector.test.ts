import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fc from "fast-check";
import { abs2 } from "../src/math/complex.js";
import { H, X, ry } from "../src/gates.js";
import {
  applyCNOT,
  applyGate1,
  norm2,
  probOne,
  zeroState,
} from "../src/statevector.js";
import { bellState } from "../src/entanglement.js";

/** Igualdad aproximada para punto flotante (sustituye a expect().toBeCloseTo). */
const close = (a: number, b: number, eps = 1e-9) =>
  assert.ok(Math.abs(a - b) < eps, `esperado ${a} ≈ ${b}`);

describe("statevector — invariantes cuánticas", () => {
  it("H|0⟩ produce superposición equiprobable (|+⟩)", () => {
    const s = applyGate1(zeroState(1), 0, H);
    close(abs2(s.amplitudes[0]!), 0.5);
    close(abs2(s.amplitudes[1]!), 0.5);
  });

  it("H·H = I (interferencia destructiva del signo, sin análogo clásico)", () => {
    const s = applyGate1(applyGate1(zeroState(1), 0, H), 0, H);
    close(abs2(s.amplitudes[0]!), 1);
    close(abs2(s.amplitudes[1]!), 0);
  });

  it("X voltea |0⟩ → |1⟩", () => {
    const s = applyGate1(zeroState(1), 0, X);
    close(probOne(s, 0), 1);
  });

  it("el estado de Bell Φ+ solo tiene amplitud en |00⟩ y |11⟩", () => {
    const s = bellState("phi+");
    close(abs2(s.amplitudes[0]!), 0.5); // 00
    close(abs2(s.amplitudes[1]!), 0); // 01
    close(abs2(s.amplitudes[2]!), 0); // 10
    close(abs2(s.amplitudes[3]!), 0.5); // 11
  });

  it("normalización ‖ψ‖² = 1 se conserva bajo compuertas arbitrarias (property-based)", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: Math.PI, noNaN: true }), (theta) => {
        let s = applyGate1(zeroState(2), 0, ry(theta));
        s = applyGate1(s, 1, H);
        s = applyCNOT(s, 1, 0);
        return Math.abs(norm2(s) - 1) < 1e-9;
      }),
    );
  });
});
