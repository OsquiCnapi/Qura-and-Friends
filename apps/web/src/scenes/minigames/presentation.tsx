"use client";

import type { ComponentType } from "react";
import type { MinigameController } from "@quantum-party/game-core";
import { CatRaceScene } from "./cat-race/CatRaceScene.js";
import { CatRaceHud } from "@/hud/minigames/cat-race/CatRaceHud.js";

export interface SceneProps {
  controllerRef: React.RefObject<MinigameController | null>;
}

export interface MinigamePresentation {
  Scene: ComponentType<SceneProps>;
  Hud: ComponentType;
}

/**
 * Registro de PRESENTACIÓN (escena R3F + HUD) por minijuego. Vive en apps/web porque depende de
 * React/three, a diferencia del registry de definiciones (game-core). Para 20 minijuegos se puede
 * migrar a `React.lazy`/dynamic para code-splitting.
 */
const PRESENTATIONS: Record<string, MinigamePresentation> = {
  "cat-race": { Scene: CatRaceScene, Hud: CatRaceHud },
};

export function getPresentation(minigameId: string): MinigamePresentation | undefined {
  return PRESENTATIONS[minigameId];
}
