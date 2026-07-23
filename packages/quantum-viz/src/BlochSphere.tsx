/**
 * <BlochSphere> — esfera de Bloch interactiva en React Three Fiber.
 *
 * Reimplementa en web la figura de QuTiP de `qsilver_docs/bloch-sphere-viz` (que es estática y en
 * matplotlib). Ejes: +z=|0⟩/|1⟩ (arriba/abajo), +x=|±⟩, +y=|±i⟩. Dibuja la esfera wireframe, los 3 ejes
 * etiquetados, los 6 polos base (azul) y el vector de estado (rojo).
 */
import { Fragment } from "react";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { BLOCH_POLES, blochVector, toThree, type BlochAngles } from "./bloch-xyz.js";

const UP = new THREE.Vector3(0, 1, 0);

export interface BlochSphereProps {
  /** Estado a representar (por defecto |0⟩). */
  angles?: BlochAngles;
  radius?: number;
  showPoles?: boolean;
  showLabels?: boolean;
  /** Oculta el vector de estado estático (usado por <GateAnimation>, que dibuja el suyo animado). */
  showState?: boolean;
  stateColor?: string;
}

/** Flecha (cilindro + cono) orientada de +Y hacia `dir`. */
function StateArrow({ dir, color, radius }: { dir: THREE.Vector3; color: string; radius: number }) {
  const length = radius * 0.98;
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
  return (
    <group quaternion={q}>
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

function Axis({
  from,
  to,
  label,
  radius,
  showLabels,
}: {
  from: [number, number, number];
  to: [number, number, number];
  label: string;
  radius: number;
  showLabels: boolean;
}) {
  return (
    <Fragment>
      <Line points={[from, to]} color="#5b6472" lineWidth={1} />
      {showLabels && (
        <Text position={to.map((v) => v * 1.12) as [number, number, number]} fontSize={0.12 * radius} color="#9aa4b2">
          {label}
        </Text>
      )}
    </Fragment>
  );
}

export function BlochSphere({
  angles = { theta: 0, phi: 0 },
  radius = 1,
  showPoles = true,
  showLabels = true,
  showState = true,
  stateColor = "#ff4d6d",
}: BlochSphereProps) {
  const dir = new THREE.Vector3(...toThree(blochVector(angles)));

  return (
    <group>
      {/* Esfera wireframe translúcida */}
      <mesh>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Ejes etiquetados */}
      <Axis from={[0, -radius, 0]} to={[0, radius, 0]} label="|0⟩" radius={radius} showLabels={showLabels} />
      <Axis from={[-radius, 0, 0]} to={[radius, 0, 0]} label="|+⟩" radius={radius} showLabels={showLabels} />
      <Axis from={[0, 0, -radius]} to={[0, 0, radius]} label="|+i⟩" radius={radius} showLabels={showLabels} />

      {/* Polos base */}
      {showPoles &&
        BLOCH_POLES.map((pole) => {
          const p = toThree(blochVector(pole.angles));
          return (
            <mesh key={pole.label} position={[p[0] * radius, p[1] * radius, p[2] * radius]}>
              <sphereGeometry args={[0.03 * radius, 12, 12]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
          );
        })}

      {/* Vector de estado */}
      {showState && <StateArrow dir={dir} color={stateColor} radius={radius} />}
    </group>
  );
}
