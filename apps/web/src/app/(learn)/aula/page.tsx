import { useTranslations } from "next-intl";
import { Panel } from "@quantum-party/ui";

/**
 * Dashboard docente EN TIEMPO REAL — STUB.
 * La ruta y las tablas (`classrooms` + presence, `progress` con replication) ya están preparadas para
 * Supabase Realtime. La UI del panel (progreso en vivo por alumno) se implementa en una fase posterior.
 */
export default function AulaPage() {
  const t = useTranslations("aula");
  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-6">
      <Panel className="text-center">
        <h1 className="mb-2 text-2xl font-semibold">{t("title")}</h1>
        <p className="text-[var(--color-quantum-muted)]">{t("comingSoon")}</p>
      </Panel>
    </main>
  );
}
