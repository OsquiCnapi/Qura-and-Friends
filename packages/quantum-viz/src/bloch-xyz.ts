/**
 * Conversión estado ↔ ángulos ↔ cartesianas de la esfera de Bloch. Lógica PURA (portable, testeable).
 *
 * Fuente: `qsilver_docs/bloch-sphere-viz` y `qsilver_/silver/quantum.py::state_to_angles`.
 * Parametrización: |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩, con θ∈[0,π] (polar desde +z, |0⟩ arriba)
 * y φ = fase relativa (azimutal). Ejes: +z=|0⟩/|1⟩, +x=|±⟩, +y=|±i⟩.
 */
import type { Complex } from "@quantum-party/quantum-engine";

export interface BlochAngles {
  /** Ángulo polar θ ∈ [0, π]. */
  readonly theta: number;
  /** Ángulo azimutal φ ∈ [0, 2π). */
  readonly phi: number;
}

/** Vector de Bloch en convención de los docs (z hacia arriba). */
export function blochVector({ theta, phi }: BlochAngles): [number, number, number] {
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ];
}

/**
 * Mapea el vector de Bloch (z-up de los docs) a coordenadas de three.js (Y-up): |0⟩ queda en el polo
 * superior. three = (blochX, blochZ, blochY).
 */
export function toThree([x, y, z]: readonly [number, number, number]): [number, number, number] {
  return [x, z, y];
}

/** Convierte un qubit (α|0⟩ + β|1⟩) a ángulos de Bloch, retirando la fase global (inobservable). */
export function stateToAngles(alpha: Complex, beta: Complex): BlochAngles {
  const rAlpha = Math.hypot(alpha.re, alpha.im);
  const theta = 2 * Math.acos(Math.min(1, rAlpha));
  // Fase relativa = arg(β) − arg(α).
  const phaseAlpha = Math.atan2(alpha.im, alpha.re);
  const phaseBeta = Math.atan2(beta.im, beta.re);
  let phi = phaseBeta - phaseAlpha;
  phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return { theta, phi };
}

/** Los seis polos base etiquetados (para dibujar los marcadores azules de la esfera). */
export const BLOCH_POLES: ReadonlyArray<{ label: string; angles: BlochAngles }> = [
  { label: "|0⟩", angles: { theta: 0, phi: 0 } },
  { label: "|1⟩", angles: { theta: Math.PI, phi: 0 } },
  { label: "|+⟩", angles: { theta: Math.PI / 2, phi: 0 } },
  { label: "|−⟩", angles: { theta: Math.PI / 2, phi: Math.PI } },
  { label: "|+i⟩", angles: { theta: Math.PI / 2, phi: Math.PI / 2 } },
  { label: "|−i⟩", angles: { theta: Math.PI / 2, phi: (3 * Math.PI) / 2 } },
];

/** Eje y ángulo de rotación sobre la esfera para cada compuerta (para animar con quaternion). */
export type GateName = "X" | "Y" | "Z" | "H" | "S" | "T";

export interface GateRotation {
  /** Eje unitario en convención de Bloch (z-up). */
  readonly axis: [number, number, number];
  readonly angle: number;
}

const INV_SQRT2 = 1 / Math.SQRT2;

export const GATE_ROTATIONS: Readonly<Record<GateName, GateRotation>> = {
  X: { axis: [1, 0, 0], angle: Math.PI },
  Y: { axis: [0, 1, 0], angle: Math.PI },
  Z: { axis: [0, 0, 1], angle: Math.PI },
  H: { axis: [INV_SQRT2, 0, INV_SQRT2], angle: Math.PI },
  S: { axis: [0, 0, 1], angle: Math.PI / 2 },
  T: { axis: [0, 0, 1], angle: Math.PI / 4 },
};
