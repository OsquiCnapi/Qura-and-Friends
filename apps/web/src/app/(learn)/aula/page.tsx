"use client";

import { useTranslations } from "next-intl";
import { Panel } from "@quantum-party/ui";
import { useAuthStore } from "@/state/authStore.js";
import { AuthGate } from "./AuthGate.js";
import { TeacherDashboard } from "./TeacherDashboard.js";
import { StudentDashboard } from "./StudentDashboard.js";

/**
 * Orquestador de /aula: no dibuja nada por sí mismo, decide cuál de las tres vistas mostrar según el
 * estado real de auth. La decisión "¿quién puede crear/administrar/unirse?" siempre se vuelve a
 * verificar en el servidor (RLS + los gates de 0007) — esto solo evita mostrarle a alguien un formulario
 * que la base de datos igual le va a rechazar.
 */
export default function AulaPage() {
  const t = useTranslations("aula");
  const { status: authStatus, error: authError, isAnonymous, role } = useAuthStore();

  if (authStatus === "error") {
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6">
        <Panel className="text-center">
          <p className="mb-1 font-semibold text-red-400">No se pudo iniciar sesión</p>
          <p className="text-sm text-[var(--color-quantum-muted)]">{authError}</p>
        </Panel>
      </main>
    );
  }

  if (authStatus !== "ready") {
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6">
        <Panel className="text-center">
          <p className="text-[var(--color-quantum-muted)]">{t("comingSoon")}</p>
        </Panel>
      </main>
    );
  }

  if (isAnonymous) return <AuthGate />;
  if (role === "teacher") return <TeacherDashboard />;
  return <StudentDashboard />;
}
