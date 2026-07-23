import type { ConceptContent } from "../types.js";

/**
 * Concepto transversal: compuertas como rotaciones y la esfera de Bloch. Fuente: qsilver_docs.
 * Es el contenido del Laboratorio interactivo (<BlochSphere> + <GateAnimation>).
 */
export const blochGates: ConceptContent = {
  id: "bloch-gates",
  concept: "gates",
  title: "Compuertas y la esfera de Bloch",
  learningObjective:
    "Representar un qubit en la esfera de Bloch (θ, φ) y entender las compuertas como rotaciones: X/Y/Z giran π sobre su eje; S y T giran π/2 y π/4 sobre z; H equivale a Ry(π/2)∘Rx(π).",
  narrative:
    "El Sombrerero guarda su magia en una esfera brillante: el estado del qubit es una flecha sobre ella. Cada 'hechizo' (compuerta) hace girar la flecha. Con H, la flecha de |0⟩ (arriba) baja hasta el ecuador (|+⟩): ¡superposición perfecta!",
  keyMath: "|\\psi\\rangle = \\cos\\tfrac{\\theta}{2}|0\\rangle + e^{i\\varphi}\\sin\\tfrac{\\theta}{2}|1\\rangle",
  prerequisites: ["superposition-basics"],
  sources: [
    {
      level: "silver",
      path: "qsilver_docs/bloch-sphere-viz/SKILL.md",
      note: "Parametrización (θ,φ), ejes z=|0/1⟩, x=|±⟩, y=|±i⟩. Figura estática en QuTiP; aquí se anima en R3F.",
    },
    {
      level: "silver",
      path: "qsilver_docs/complex-gates-multiqubit/SKILL.md",
      note: "Compuertas de fase S/T/P y rotaciones Rx/Ry/Rz.",
    },
    {
      level: "silver",
      path: "qsilver_/silver/C08_Operations_On_Bloch_Sphere.ipynb",
      note: "Cada compuerta como eje+ángulo de rotación (fuente de GATE_ROTATIONS en quantum-viz).",
    },
  ],
  difficulty: 3,
};
