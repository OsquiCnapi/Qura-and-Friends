"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BlochMath } from "@/learn/BlochMath.js";
import { GateAnimation, type GateName } from "@quantum-party/quantum-viz";
import { Button, Panel } from "@quantum-party/ui";
import type { ConceptContent } from "@quantum-party/curriculum";
import { useTranslations } from "next-intl";

const GATES: GateName[] = ["H", "X", "Y", "Z", "S", "T"];

/** Laboratorio interactivo: esfera de Bloch + la compuerta elegida animada como rotación. */
export function LabView({ concept }: { concept: ConceptContent | undefined }) {
  const t = useTranslations("lab");
  const [gate, setGate] = useState<GateName>("H");

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_24rem]">
      <div className="relative h-[60vh] lg:h-screen">
        <Canvas camera={{ position: [2.2, 1.6, 2.2], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 4, 2]} intensity={1} />
          {/* key={gate} reinicia la animación al cambiar de compuerta */}
          <GateAnimation key={gate} gate={gate} initial={{ theta: 0, phi: 0 }} radius={1.2} loop />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <aside className="flex flex-col gap-4 border-l border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] p-6">
        <h1 className="text-2xl font-semibold">{concept?.title ?? t("title")}</h1>

        <Panel>
          <p className="text-sm leading-relaxed text-[var(--color-quantum-text)]">
            {concept?.narrative ?? t("explain")}
          </p>
          {concept?.keyMath && (
            <div className="mt-3">
              <BlochMath math={concept.keyMath} />
            </div>
          )}
        </Panel>

        <div>
          <p className="mb-2 text-sm text-[var(--color-quantum-muted)]">{t("chooseGate")}</p>
          <div className="flex flex-wrap gap-2">
            {GATES.map((g) => (
              <Button
                key={g}
                size="sm"
                variant={g === gate ? "primary" : "outline"}
                onClick={() => setGate(g)}
              >
                {g}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-quantum-muted)]">
            {t("gateApplied")}: <strong>{gate}</strong>
          </p>
        </div>

        {concept && (
          <p className="mt-auto text-xs text-[var(--color-quantum-muted)]">
            Fuente: {concept.sources.map((s) => s.path).join(" · ")}
          </p>
        )}
      </aside>
    </main>
  );
}
