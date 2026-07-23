"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";

/** Contenedor común del render 3D (cámara, luces, entorno). El HUD se dibuja en HTML por fuera. */
export function GameCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 5, 16], fov: 60 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b1020"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 14, 8]} intensity={1.3} castShadow />
      <directionalLight position={[-6, 6, -6]} intensity={0.4} />
      <Suspense fallback={null}>
        <Environment preset="night" />
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
