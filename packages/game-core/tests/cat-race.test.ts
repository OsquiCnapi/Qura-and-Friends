import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createQuantumEngine, createRng } from "@quantum-party/quantum-engine";
import { catRaceDefinition } from "../src/minigames/cat-race/index.js";
import type { MinigameContext } from "../src/minigame/contract.js";
import type { InputSnapshot, PlayerSlot } from "../src/minigame/types.js";
import { emptyInputSnapshot } from "../src/minigame/types.js";

function makeCtx(seed: number): MinigameContext {
  const players: PlayerSlot[] = [
    { id: "human", slot: 0, name: "Alicia", character: "alicia", isBot: false, controlBinding: "p1" },
    { id: "bot1", slot: 1, name: "Bot Reina 1", character: "conejo", isBot: true },
    { id: "bot2", slot: 2, name: "Bot Reina 2", character: "conejo", isBot: true },
  ];
  return {
    seed,
    difficulty: 1,
    players,
    rng: createRng(seed),
    quantum: createQuantumEngine(seed),
    services: {},
  };
}

/** Simula la partida a paso fijo con un input dado, hasta terminar o timeout. */
function simulate(seed: number, superposeFrom = 0.4): number[] {
  const ctrl = catRaceDefinition.createController(makeCtx(seed));
  ctrl.init();
  ctrl.start();
  const dt = 1 / 60;
  let t = 0;
  while (!ctrl.isFinished() && t < 220) {
    const held: InputSnapshot = {
      ...emptyInputSnapshot(t),
      p1: { axisX: 0, axisY: 0, buttons: { superpose: t > superposeFrom } },
    };
    ctrl.update(dt, held);
    t += dt;
  }
  return ctrl.computeResult().perPlayer.map((p) => p.score);
}

describe("cat-race — plantilla de minijuego", () => {
  it("es determinista por seed (misma entrada ⇒ mismo resultado)", () => {
    assert.deepEqual(simulate(123), simulate(123));
  });

  it("la partida termina dentro del presupuesto de tiempo", () => {
    const ctrl = catRaceDefinition.createController(makeCtx(9));
    ctrl.init();
    ctrl.start();
    const dt = 1 / 60;
    let t = 0;
    while (!ctrl.isFinished() && t < 220) {
      ctrl.update(dt, emptyInputSnapshot(t));
      t += dt;
    }
    assert.equal(ctrl.isFinished(), true);
  });

  it("produce un score por jugador y un proof con el seed", () => {
    const result = catRaceDefinition.createController(makeCtx(5));
    result.init();
    result.start();
    result.update(1 / 60, emptyInputSnapshot(0));
    const r = result.computeResult();
    assert.equal(r.perPlayer.length, 3);
    assert.equal(r.proof.seed, 5);
  });
});
