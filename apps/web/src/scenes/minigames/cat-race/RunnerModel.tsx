"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

/**
 * Modelos .glb de los personajes (en `public/persons`). Se mapean por slot:
 *  0 → gatuna (el Gato — protagonista de "La Carrera del Gato")
 *  1 → tartígrada (Conejo Blanco)
 *  2 → cobra-abeja (Naipe / bot)
 */
export const RUNNER_MODEL_URLS = [
  "/persons/gatuna_2k_1.glb",
  "/persons/tartigrada_2k_2.glb",
  "/persons/cobraaveja_2k_3.glb",
] as const;

RUNNER_MODEL_URLS.forEach((u) => useGLTF.preload(u));

const TARGET_HEIGHT = 1.7; // altura objetivo del personaje en unidades de mundo

/**
 * Carga un .glb, lo clona (soporta mallas con esqueleto), lo normaliza a una altura fija y lo apoya
 * sobre el suelo (pies en y=0), centrado en X/Z. Girado para "mirar hacia adelante" (-Z, dirección de
 * carrera). Si algún modelo aparece de espaldas, ajustar `yaw`.
 *
 * `ghost`: réplica translúcida y teñida (representa la superposición ocupando otro carril). Clona los
 * materiales para no alterar el modelo "real" (que comparte geometría/materiales por referencia).
 */
export function RunnerModel({
  slot,
  yaw = Math.PI,
  ghost = false,
  tint,
}: {
  slot: number;
  yaw?: number;
  ghost?: boolean;
  tint?: string;
}) {
  const url = RUNNER_MODEL_URLS[slot % RUNNER_MODEL_URLS.length]!;
  const { scene } = useGLTF(url);

  const object = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Object3D;
    clone.updateMatrixWorld(true);

    // 1) Escalar a una altura consistente.
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const s = TARGET_HEIGHT / (size.y || 1);
    clone.scale.setScalar(s);

    // 2) Reapoyar: pies en el suelo y centrado en planta.
    clone.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(clone);
    clone.position.y -= box2.min.y;
    clone.position.x -= (box2.min.x + box2.max.x) / 2;
    clone.position.z -= (box2.min.z + box2.max.z) / 2;

    // 3) Sombras + (si es fantasma) materiales translúcidos teñidos.
    const tintColor = tint ? new THREE.Color(tint) : null;
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = !ghost;
      mesh.receiveShadow = !ghost;
      if (!ghost) return;

      const wasArray = Array.isArray(mesh.material);
      const mats = (wasArray ? mesh.material : [mesh.material]) as THREE.Material[];
      const cloned = mats.map((m) => {
        const c = m.clone();
        c.transparent = true;
        c.opacity = 0.3;
        c.depthWrite = false;
        const std = c as THREE.MeshStandardMaterial;
        if (tintColor && "emissive" in std) {
          std.emissive = tintColor.clone();
          std.emissiveIntensity = 0.5;
        }
        return c;
      });
      mesh.material = wasArray ? cloned : cloned[0]!;
    });

    return clone;
  }, [scene, ghost, tint]);

  return (
    <group rotation={[0, yaw, 0]}>
      <primitive object={object} />
    </group>
  );
}
