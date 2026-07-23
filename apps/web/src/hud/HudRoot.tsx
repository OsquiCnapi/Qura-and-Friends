"use client";

import { getPresentation } from "@/scenes/minigames/presentation.js";

/** Overlay HTML sobre el <Canvas>. Resuelve el HUD del minijuego activo desde el registry. */
export function HudRoot({ minigameId }: { minigameId: string }) {
  const presentation = getPresentation(minigameId);
  if (!presentation) return null;
  const Hud = presentation.Hud;
  return (
    <div className="pointer-events-none absolute inset-0">
      <Hud />
    </div>
  );
}
