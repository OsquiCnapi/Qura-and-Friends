"use client";

import { Suspense, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CatRaceRenderState, MinigameController } from "@quantum-party/game-core";
import { RunnerModel } from "./RunnerModel.js";

const RING_INNER = 0.62;
const RING_OUTER = 0.82;
const WHITE = new THREE.Color("#ffffff");
const CRASH_SFX_URL = "/audio_effects/FAH%20Echo%20Sound%20Effect.mp3";

/** Reproduce el efecto de choque (permite solapamiento clonando el elemento de audio). */
function playCrashSfx(base: HTMLAudioElement | null) {
  if (!base) return;
  const s = base.cloneNode() as HTMLAudioElement;
  s.volume = 0.6;
  void s.play().catch(() => {});
}

const SCALE = 0.14; // unidades de pista → unidades de mundo
const LANE_GAP = 2.8;
const STRIPE_SPACING = 3.0; // separación entre franjas del suelo (mundo)
const STRIPE_COUNT = 40; // franjas recicladas → pista "infinita"

const laneX = (lane: number, lanes: number) => (lane - (lanes - 1) / 2) * LANE_GAP;
const zFor = (distance: number, trackLength: number) => (trackLength / 2 - distance) * SCALE;

const playerColor = (slot: number, isBot: boolean) =>
  isBot ? "#a3b0c9" : slot === 0 ? "#38bdf8" : "#fb7185";

/** Amortiguación independiente del framerate (mayor λ = más rápido). */
const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt);

/**
 * "La Carrera del Gato" — endless-runner tipo Subway Surfers. SOLO presentación: lee `getRenderState()`
 * del controller cada frame. La cámara persigue al grupo desde atrás y arriba (ángulo 3D), de modo que
 * las paredes rojas de la Reina se ven venir de frente. La lógica/scoring viven en game-core.
 */
export function CatRaceScene({
  controllerRef,
}: {
  controllerRef: React.RefObject<MinigameController | null>;
}) {
  const runnerRefs = useRef<Array<THREE.Group | null>>([]);
  const chargeRingRefs = useRef<Array<THREE.Mesh | null>>([]);
  const chargeShown = useRef<number[]>([]); // última fracción pintada por corredor (evita regenerar cada frame)
  const auraRefs = useRef<Array<THREE.Group | null>>([]);
  const ghostRefs = useRef<Array<Array<THREE.Group | null>>>([]); // [runner][0..1] réplicas de superposición
  const wallRefs = useRef<Array<THREE.Group | null>>([]);
  const stripeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const crashSfx = useRef<HTMLAudioElement | null>(null);
  const prevWallHits = useRef<number[]>([]);

  useEffect(() => {
    crashSfx.current = new Audio(CRASH_SFX_URL);
    crashSfx.current.preload = "auto";
    return () => {
      crashSfx.current = null;
    };
  }, []);
  const camLook = useRef(new THREE.Vector3(0, 1, -8));
  const initial = controllerRef.current?.getRenderState() as CatRaceRenderState | undefined;
  const { camera } = useThree();

  useFrame((state, dt) => {
    const controller = controllerRef.current;
    if (!controller) return;
    const rs = controller.getRenderState() as CatRaceRenderState;
    const t = state.clock.elapsedTime;
    const clamped = Math.min(dt, 1 / 30);

    let frontZ = Infinity; // más avanzado (z menor)
    let backZ = -Infinity; // menos avanzado (z mayor)
    let sumX = 0;

    rs.runners.forEach((r, i) => {
      // Efecto de sonido al chocar con un muro (cualquier corredor).
      const prevHits = prevWallHits.current[i] ?? r.wallHits;
      if (r.wallHits > prevHits) playCrashSfx(crashSfx.current);
      prevWallHits.current[i] = r.wallHits;

      const group = runnerRefs.current[i];
      if (!group) return;

      const targetX = laneX(r.lane, rs.lanes);
      const worldZ = zFor(r.distance, rs.trackLength);

      // Cambio de carril suave + inclinación al girar (lean) tipo runner.
      const prevX = group.position.x;
      group.position.x = damp(prevX, targetX, 12, clamped); // desplazamiento al carril más suave
      const vx = targetX - group.position.x;
      group.rotation.z = damp(group.rotation.z, THREE.MathUtils.clamp(-vx * 0.9, -0.4, 0.4), 12, clamped);
      group.rotation.y = damp(group.rotation.y, THREE.MathUtils.clamp(-vx * 0.6, -0.3, 0.3), 10, clamped);
      group.position.z = worldZ;

      // Altura: salto/flote en superposición, apoyo en carrera, hundido al aturdirse.
      const running = !r.finished && r.stunnedFor <= 0;
      const bob = running && !r.superposed ? Math.abs(Math.sin(t * 12 + r.slot)) * 0.12 : 0;
      const targetY = r.superposed ? 0.9 : r.stunnedFor > 0 ? 0.0 : bob;
      group.position.y = damp(group.position.y, targetY, 14, clamped);

      // Escala: crece al superponerse (ocupa "todos los carriles"), squash al chocar.
      const targetScale = r.superposed ? 1.12 : r.stunnedFor > 0 ? 0.82 : 1;
      const sc = damp(group.scale.x, targetScale, 12, clamped);
      group.scale.setScalar(sc);

      // Anillo del suelo: se LLENA con el color del personaje según la carga del escudo.
      const ring = chargeRingRefs.current[i];
      if (ring) {
        const charge = r.charge;
        // Regenera el arco solo cuando cambia lo suficiente (evita crear geometría cada frame).
        if (Math.abs((chargeShown.current[i] ?? -1) - charge) > 0.02) {
          chargeShown.current[i] = charge;
          ring.geometry.dispose();
          ring.geometry = new THREE.RingGeometry(
            RING_INNER,
            RING_OUTER,
            48,
            1,
            Math.PI / 2, // empieza arriba
            -charge * Math.PI * 2, // sentido horario
          );
        }
        const mat = ring.material as THREE.MeshBasicMaterial;
        // Color del jugador; brilla (hacia blanco) al usar el escudo; tenue si está agotado.
        mat.color.set(playerColor(r.slot, r.isBot));
        if (r.superposed) mat.color.lerp(WHITE, 0.5);
        mat.opacity = r.exhausted ? 0.4 : 0.95;
      }

      // Réplicas de superposición: el jugador aparece en los OTROS carriles a la vez.
      const aura = auraRefs.current[i];
      if (aura) aura.visible = r.superposed;
      const ghosts = ghostRefs.current[i] ?? [];
      const others: number[] = [];
      for (let l = 0; l < rs.lanes; l++) if (l !== r.lane) others.push(l);
      ghosts.forEach((g, k) => {
        if (!g) return;
        const lane = others[k];
        if (r.superposed && lane !== undefined) {
          g.visible = true;
          g.position.x = (lane - r.lane) * LANE_GAP; // carril vecino (offset local)
        } else {
          g.visible = false;
        }
      });

      frontZ = Math.min(frontZ, worldZ);
      backZ = Math.max(backZ, worldZ);
      sumX += targetX;
    });

    // Pulso de las paredes rojas (peligro que se acerca).
    wallRefs.current.forEach((w, i) => {
      if (!w) return;
      const pulse = 1 + Math.sin(t * 4 + i) * 0.06;
      w.scale.y = pulse;
    });

    // ── Cámara persecutoria en ángulo 3/4 (Subway Surfers) ──────────────────────
    // Desplazada a la izquierda y mirando hacia la derecha-adelante → se ve mejor el 3D:
    // los carriles y muros se alejan en diagonal.
    if (Number.isFinite(frontZ)) {
      const centerX = (sumX / Math.max(1, rs.runners.length)) * 0.4;
      const SIDE = 4.0; // desplazamiento lateral (ángulo 3D, sin perder carriles)
      // Separación entre el 1º (frontZ) y el último (backZ). Al crecer, la cámara sube y
      // retrocede para que SIEMPRE se vea al que va adelante.
      const spread = THREE.MathUtils.clamp(backZ - frontZ, 0, 26);
      const centerZ = (frontZ + backZ) / 2;
      const camTarget = new THREE.Vector3(
        centerX - SIDE,
        6.6 + spread * 0.55, // más alto → vista más superior
        backZ + 6.0 + spread * 0.35, // más atrás → cabe todo el pelotón
      );
      camera.position.x = damp(camera.position.x, camTarget.x, 4, clamped);
      camera.position.y = damp(camera.position.y, camTarget.y, 4, clamped);
      camera.position.z = damp(camera.position.z, camTarget.z, 6, clamped);

      camLook.current.x = damp(camLook.current.x, centerX + 1.5, 4, clamped);
      camLook.current.y = damp(camLook.current.y, 0.6, 4, clamped);
      camLook.current.z = damp(camLook.current.z, centerZ - 2, 6, clamped); // mira al centro del pelotón
      camera.lookAt(camLook.current);

      // ── Suelo desplazándose hacia atrás: franjas ancladas a múltiplos del mundo,
      //    recicladas alrededor de la cámara → ilusión de pista infinita. ──────────
      const camZ = camera.position.z;
      const nearestK = Math.round(camZ / STRIPE_SPACING);
      stripeRefs.current.forEach((s, i) => {
        if (!s) return;
        s.position.z = (nearestK - i) * STRIPE_SPACING;
      });
    }
  });

  if (!initial) return null;

  const trackW = initial.lanes * LANE_GAP;
  const trackLen = initial.trackLength * SCALE;

  return (
    <group>
      {/* Suelo base (muy largo — la cámara nunca ve el borde) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[trackW + 1.2, trackLen + 200]} />
        <meshStandardMaterial color="#161d33" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Franjas transversales recicladas → el suelo "corre" hacia atrás (posición fijada en useFrame) */}
      {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
        <mesh
          key={`stripe-${i}`}
          ref={(el) => { stripeRefs.current[i] = el; }}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, 0]}
        >
          <planeGeometry args={[trackW, 0.35]} />
          <meshBasicMaterial color={i % 2 === 0 ? "#20294a" : "#1a2138"} />
        </mesh>
      ))}

      {/* Barandas laterales (dan profundidad y encierran los carriles) */}
      {[-1, 1].map((side) => (
        <mesh
          key={`rail-${side}`}
          position={[side * (trackW / 2 + 0.35), 0.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.35, 1, trackLen + 8]} />
          <meshStandardMaterial color="#2a3350" emissive="#5b21b6" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Líneas divisorias de carril */}
      {Array.from({ length: initial.lanes + 1 }).map((_, i) => (
        <mesh
          key={`lane-${i}`}
          position={[(i - initial.lanes / 2) * LANE_GAP, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.08, trackLen]} />
          <meshBasicMaterial color="#3a4468" />
        </mesh>
      ))}

      {/* Paredes rojas de la Reina — vienen de frente hacia el jugador */}
      {initial.obstacles.map((o, i) => (
        <group
          key={`wall-${i}`}
          ref={(el) => { wallRefs.current[i] = el; }}
          position={[laneX(o.lane, initial.lanes), 0, zFor(o.distance, initial.trackLength)]}
        >
          {/* Muro principal */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[LANE_GAP * 0.82, 1.7, 0.35]} />
            <meshStandardMaterial
              color="#b91c1c"
              emissive="#ef4444"
              emissiveIntensity={0.9}
              roughness={0.4}
            />
          </mesh>
          {/* Remate superior brillante */}
          <mesh position={[0, 1.78, 0]}>
            <boxGeometry args={[LANE_GAP * 0.9, 0.18, 0.5]} />
            <meshStandardMaterial color="#fca5a5" emissive="#f87171" emissiveIntensity={1.4} />
          </mesh>
        </group>
      ))}

      {/* Meta */}
      <mesh
        position={[0, 0.03, zFor(initial.trackLength, initial.trackLength)]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[trackW, 1.2]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>

      {/* Corredores (.glb) */}
      {initial.runners.map((r, i) => {
        const color = playerColor(r.slot, r.isBot);
        return (
          <group key={`runner-${r.slot}`} ref={(el) => { runnerRefs.current[i] = el; }}>
            {/* Pista del anillo (fondo tenue, círculo completo) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
              <ringGeometry args={[RING_INNER, RING_OUTER, 48]} />
              <meshBasicMaterial color="#0b1020" transparent opacity={0.55} />
            </mesh>

            {/* Anillo-temporizador del escudo (arco = carga; se rellena en useFrame) */}
            <mesh
              ref={(el) => { chargeRingRefs.current[i] = el; }}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.03, 0]}
            >
              <ringGeometry args={[RING_INNER, RING_OUTER, 48, 1, Math.PI / 2, -Math.PI * 2]} />
              <meshBasicMaterial color={color} transparent opacity={0.95} />
            </mesh>

            {/* Aura de superposición (visibilidad conmutada en useFrame) */}
            <group ref={(el) => { auraRefs.current[i] = el; }} visible={false}>
              <mesh position={[0, 0.95, 0]}>
                <sphereGeometry args={[1.05, 20, 20]} />
                <meshBasicMaterial color={color} transparent opacity={0.22} />
              </mesh>
            </group>

            {/* Modelo real */}
            <Suspense fallback={null}>
              <RunnerModel slot={r.slot} />
            </Suspense>

            {/* Réplicas fantasma (una por carril vecino) — se muestran solo en superposición */}
            {[0, 1].map((k) => (
              <group
                key={`ghost-${k}`}
                ref={(el) => {
                  (ghostRefs.current[i] ??= [])[k] = el;
                }}
                visible={false}
              >
                <Suspense fallback={null}>
                  <RunnerModel slot={r.slot} ghost tint={color} />
                </Suspense>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}
