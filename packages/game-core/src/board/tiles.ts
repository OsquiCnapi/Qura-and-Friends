/**
 * Casillas del tablero. Cada zona corresponde a una categoría cuántica; el orden de las casillas marca
 * la progresión de dificultad (fácil → difícil), como en el mapa del plan.
 */
import type { QuantumCategory } from "../minigame/types.js";

export type TileKind =
  | "start"
  | "minigame" // lanza un minijuego de la categoría de la zona
  | "concept" // abre el laboratorio del concepto (esfera de Bloch, etc.)
  | "bonus" // suma coherencia/monedas
  | "penalty" // trampa de la Reina
  | "star"; // meta / estrella cuántica

export interface Tile {
  readonly index: number;
  readonly kind: TileKind;
  readonly zone: QuantumCategory;
  /** Para casillas de minijuego/concepto: pista de qué contenido lanzar (el host elige la instancia). */
  readonly hint?: { readonly category?: QuantumCategory; readonly conceptId?: string };
}

/** Genera un tablero lineal con 4 zonas en orden de dificultad creciente. */
export function generateBoard(perZone = 6): Tile[] {
  const zones: QuantumCategory[] = ["superposition", "entanglement", "interference", "annealing"];
  const tiles: Tile[] = [{ index: 0, kind: "start", zone: "superposition" }];
  let index = 1;
  for (const zone of zones) {
    for (let i = 0; i < perZone; i++) {
      const kind: TileKind =
        i === perZone - 1 ? "star" : i % 3 === 1 ? "bonus" : i % 5 === 3 ? "penalty" : "minigame";
      tiles.push({ index, kind, zone, hint: { category: zone } });
      index++;
    }
  }
  return tiles;
}
