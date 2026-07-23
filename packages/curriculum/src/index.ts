/**
 * @quantum-party/curriculum
 *
 * Contenido pedagógico trazable a qbronze_docs/qsilver_docs. Este entregable incluye los conceptos del
 * minijuego plantilla y del laboratorio (esfera de Bloch); los demás se añaden en fases siguientes.
 */
import type { ConceptContent } from "./types.js";
import { superpositionBasics } from "./concepts/superposition-basics.js";
import { blochGates } from "./concepts/bloch-gates.js";

export * from "./types.js";
export * from "./minigame-map.js";
export { superpositionBasics, blochGates };

const CONCEPTS: readonly ConceptContent[] = [superpositionBasics, blochGates];

export function getConcept(id: string): ConceptContent | undefined {
  return CONCEPTS.find((c) => c.id === id);
}

export function listConcepts(): readonly ConceptContent[] {
  return CONCEPTS;
}
