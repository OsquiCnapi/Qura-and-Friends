import type { ConceptContent } from "../types.js";

/**
 * Concepto de superposición (nivel básico). Fuente: qbronze_docs.
 * Adaptación: el qubit real es una "flecha en el reloj" (círculo unidad 2D); medir la colapsa a |0⟩ o
 * |1⟩ con probabilidad = amplitud². Es el concepto de "La Carrera del Gato".
 */
export const superpositionBasics: ConceptContent = {
  id: "superposition-basics",
  concept: "superposition",
  title: "Superposición y medición",
  learningObjective:
    "Entender que un qubit puede estar en superposición de |0⟩ y |1⟩, y que medir lo colapsa a un valor definido con probabilidad igual al cuadrado de la amplitud (regla de Born).",
  narrative:
    "El Gato de Cheshire puede estar en varios sitios a la vez… hasta que la Reina lo MIRA. Mientras nadie mide, Jaime ocupa los tres carriles en superposición y atraviesa los obstáculos. Pero cada instante en superposición gasta su Coherencia; si se agota, el sistema lo 'mide' y colapsa de golpe a un solo carril — ¡ojalá no haya un obstáculo ahí!",
  keyMath: "|\\psi\\rangle = \\cos\\theta\\,|0\\rangle + \\sin\\theta\\,|1\\rangle,\\quad P(0)=\\cos^2\\theta",
  prerequisites: [],
  sources: [
    {
      level: "bronze",
      path: "qbronze_docs/real-qubit-geometry/SKILL.md",
      note: "Qubit real como flecha en el círculo unidad; probabilidad = amplitud²; el signo es invisible a la medición.",
    },
    {
      level: "bronze",
      path: "qbronze_docs/quantum-operators/SKILL.md",
      note: "H|0⟩ = |+⟩ crea superposición equiprobable.",
    },
    {
      level: "bronze",
      path: "qbronze_docs/qubit-tomography/SKILL.md",
      note: "Estimar el ángulo θ desde estadística de mediciones (minijuego Espejismos del Bosque).",
    },
  ],
  difficulty: 1,
};
