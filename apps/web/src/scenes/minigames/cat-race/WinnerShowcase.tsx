"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RunnerModel } from "./RunnerModel.js";

/** El personaje ganador gira y da brincos de celebración (animación procedural). */
function Celebrating({ slot }: { slot: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const t = s.clock.elapsedTime;
    g.rotation.y = Math.sin(t * 0.9) * 0.5; // vaivén suave (se mantiene de frente y centrado)
    g.position.y = -0.95 + Math.abs(Math.sin(t * 3)) * 0.15; // saltitos de victoria
    g.rotation.z = Math.sin(t * 6) * 0.05; // leve contoneo
  });
  // yaw=0 → mira HACIA la cámara (en la carrera usa Math.PI y corre de espaldas).
  return (
    <group ref={ref} position={[0, -0.95, 0]}>
      <RunnerModel slot={slot} yaw={0} />
    </group>
  );
}

/** Mini-escena 3D del ganador para el overlay de resultados (Canvas propio, fondo transparente). */
export function WinnerShowcase({ slot, color }: { slot: number; color: string }) {
  return (
    <Canvas camera={{ position: [0, 0.25, 3.7], fov: 36 }} dpr={[1, 2]} gl={{ alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} castShadow />
      <pointLight position={[-2.2, 1.2, 2]} intensity={12} distance={9} color={color} />
      <Suspense fallback={null}>
        <Celebrating slot={slot} />
      </Suspense>
    </Canvas>
  );
}
