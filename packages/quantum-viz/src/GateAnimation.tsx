/**
 * <GateAnimation> — anima la aplicación de una compuerta como una ROTACIÓN del vector de estado sobre
 * la esfera de Bloch (lo que las figuras estáticas de qsilver no muestran).
 *
 * Fuente de las rotaciones: `qsilver_/silver/C08_Operations_On_Bloch_Sphere.ipynb`
 * (X/Y/Z = π sobre su eje; S = π/2, T = π/4 sobre z; H = Ry(π/2)∘Rx(π), aquí como una rotación de π
 * sobre el eje (x+z)/√2).
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BlochSphere } from "./BlochSphere.js";
import {
  GATE_ROTATIONS,
  blochVector,
  toThree,
  type BlochAngles,
  type GateName,
} from "./bloch-xyz.js";

const UP = new THREE.Vector3(0, 1, 0);

export interface GateAnimationProps {
  /** Estado inicial (por defecto |0⟩). Ej.: aplicar H a |0⟩ lleva la flecha a |+⟩. */
  initial?: BlochAngles;
  gate?: GateName;
  radius?: number;
  /** Duración de la rotación en segundos. */
  durationSec?: number;
  /** Repetir en bucle (ida) para uso en el laboratorio. */
  loop?: boolean;
  stateColor?: string;
}

function AnimatedArrow({
  initial,
  gate,
  radius,
  durationSec,
  loop,
  color,
}: Required<Omit<GateAnimationProps, "stateColor">> & { color: string }) {
  const ref = useRef<THREE.Group | null>(null);
  const progress = useRef(0);

  const initialDir = new THREE.Vector3(...toThree(blochVector(initial)));
  const rot = GATE_ROTATIONS[gate];
  const axisThree = new THREE.Vector3(...toThree(rot.axis)).normalize();
  const length = radius * 0.98;

  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    progress.current = Math.min(1, progress.current + dt / durationSec);
    if (loop && progress.current >= 1) progress.current = 0;

    const q = new THREE.Quaternion().setFromAxisAngle(axisThree, rot.angle * progress.current);
    const dir = initialDir.clone().applyQuaternion(q).normalize();
    group.quaternion.setFromUnitVectors(UP, dir);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, length * 0.45, 0]}>
        <cylinderGeometry args={[0.02 * radius, 0.02 * radius, length * 0.9, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, length * 0.95, 0]}>
        <coneGeometry args={[0.06 * radius, 0.14 * radius, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function GateAnimation({
  initial = { theta: 0, phi: 0 },
  gate = "H",
  radius = 1,
  durationSec = 1.4,
  loop = true,
  stateColor = "#ff4d6d",
}: GateAnimationProps) {
  return (
    <group>
      <BlochSphere angles={initial} radius={radius} showState={false} />
      <AnimatedArrow
        initial={initial}
        gate={gate}
        radius={radius}
        durationSec={durationSec}
        loop={loop}
        color={stateColor}
      />
    </group>
  );
}
