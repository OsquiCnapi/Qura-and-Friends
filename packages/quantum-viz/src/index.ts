/**
 * @quantum-party/quantum-viz
 *
 * Componentes de visualización cuántica en React Three Fiber. Consumidos por apps/web (laboratorio,
 * HUDs, escenas). La conversión de estado a coordenadas es pura y testeable (bloch-xyz).
 */
export { BlochSphere, type BlochSphereProps } from "./BlochSphere.js";
export { GateAnimation, type GateAnimationProps } from "./GateAnimation.js";
export {
  useQuaternionSlerp,
  quaternionAroundAxis,
} from "./hooks/useQuaternionSlerp.js";
export {
  blochVector,
  stateToAngles,
  toThree,
  BLOCH_POLES,
  GATE_ROTATIONS,
  type BlochAngles,
  type GateName,
  type GateRotation,
} from "./bloch-xyz.js";
