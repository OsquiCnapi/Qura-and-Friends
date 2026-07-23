"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  createFixedStepLoop,
  type MinigameController,
  type MinigameResult,
} from "@quantum-party/game-core";
import { useHudStore } from "@/state/hudStore.js";
import { buildSnapshot } from "@/input/inputManager.js";

/**
 * Corazón del bucle de simulación. Vive DENTRO del <Canvas> y usa `useFrame`, pero desacopla la
 * simulación (paso fijo 60 Hz determinista) del render. Publica el HUD throttled (~12 Hz) para no
 * disparar re-renders a 60 fps.
 */
export function GameLoop({
  controllerRef,
  onFinish,
}: {
  controllerRef: React.RefObject<MinigameController | null>;
  onFinish: (result: MinigameResult) => void;
}) {
  const publish = useHudStore((s) => s.publish);
  const loop = useRef(createFixedStepLoop(60));
  const simTime = useRef(0);
  const hudAccumulator = useRef(0);
  const finished = useRef(false);

  useFrame((_, dt) => {
    const controller = controllerRef.current;
    if (!controller || finished.current) return;

    loop.current.advance(dt, (fixedDt) => {
      simTime.current += fixedDt;
      controller.update(fixedDt, buildSnapshot(simTime.current));
    });

    hudAccumulator.current += dt;
    if (hudAccumulator.current >= 0.08) {
      publish(controller.getHudState());
      hudAccumulator.current = 0;
    }

    if (controller.isFinished()) {
      finished.current = true;
      publish(controller.getHudState());
      onFinish(controller.computeResult());
    }
  });

  return null;
}
