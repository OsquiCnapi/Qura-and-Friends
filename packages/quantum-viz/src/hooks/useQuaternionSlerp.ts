/**
 * Hook que interpola suavemente la orientación de un grupo hacia un quaternion objetivo (slerp).
 * Es la primitiva que convierte las figuras ESTÁTICAS de QuTiP (antes/después) en la rotación animada
 * real que el corpus qsilver no tiene: cada compuerta rota el vector de estado sobre su eje.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function useQuaternionSlerp(
  target: THREE.Quaternion,
  speed = 2.5,
): React.RefObject<THREE.Group | null> {
  const ref = useRef<THREE.Group | null>(null);
  useFrame((_, dt) => {
    const group = ref.current;
    if (group) group.quaternion.slerp(target, Math.min(1, dt * speed));
  });
  return ref;
}

/** Quaternion que rota `angle` radianes alrededor de un eje (en coordenadas three, Y-up). */
export function quaternionAroundAxis(
  axis: readonly [number, number, number],
  angle: number,
): THREE.Quaternion {
  const v = new THREE.Vector3(axis[0], axis[1], axis[2]).normalize();
  return new THREE.Quaternion().setFromAxisAngle(v, angle);
}
