"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Panel, Button } from "@quantum-party/ui";
import { ClassroomCodeSchema } from "@quantum-party/schemas";
import { useAuthStore } from "@/state/authStore.js";
import { signOut } from "@/lib/supabase/auth.js";
import {
  fetchClassroomRoster,
  fetchMyClassrooms,
  joinClassroomByCode,
  type ClassroomMemberRow,
  type ClassroomRow,
} from "@/lib/supabase/classrooms.js";

/** Vista alumno: SIN formulario de crear aula (un alumno no puede — lo bloquea también la base de
 *  datos, esto solo evita mostrar un botón que el servidor rechazaría). Unirse por código y ver a los
 *  compañeros de las aulas a las que ya pertenece. */
export function StudentDashboard() {
  const t = useTranslations("aula");
  const { displayName, email } = useAuthStore();

  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roster, setRoster] = useState<ClassroomMemberRow[]>([]);

  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function reload() {
    try {
      setClassrooms(await fetchMyClassrooms());
    } catch (e) {
      setFeedback(String(e));
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    fetchClassroomRoster(selectedId)
      .then(setRoster)
      .catch((e) => setFeedback(String(e)));
  }, [selectedId]);

  async function handleJoin() {
    const parsed = ClassroomCodeSchema.safeParse(joinCode);
    if (!parsed.success) {
      setFeedback(parsed.error.issues[0]?.message ?? "código inválido");
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const joined = await joinClassroomByCode(parsed.data);
      setJoinCode("");
      await reload();
      setSelectedId(joined.classroomId); // "inmediatamente verá el aula asignada y sus compañeros"
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setBusy(false);
    }
  }

  const selected = classrooms.find((c) => c.id === selectedId) ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("studentSection")}</h1>
          <p className="text-sm text-[var(--color-quantum-muted)]">{displayName} · {email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => void signOut()}>
          {t("signOut")}
        </Button>
      </div>

      {feedback && (
        <p className="rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] px-4 py-2 text-sm">
          {feedback}
        </p>
      )}

      <Panel>
        <p className="mb-4 text-sm text-[var(--color-quantum-muted)]">{t("studentHint")}</p>
        <div className="mb-4 flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t("codePlaceholder")}
            className="flex-1 rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-transparent px-3 py-2 font-mono text-sm tracking-widest"
          />
          <Button onClick={handleJoin} disabled={busy || joinCode.trim().length === 0}>
            {t("joinClassroom")}
          </Button>
        </div>

        {classrooms.length > 0 && (
          <ul className="space-y-2">
            {classrooms.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  className="flex w-full items-center justify-between rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-quantum-surface-2)]"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="mt-4 border-t border-[var(--color-quantum-border)] pt-4">
            <h3 className="mb-2 text-sm font-semibold">{t("classmates", { name: selected.name })}</h3>
            <ul className="space-y-1">
              {roster.map((m) => (
                <li key={m.user_id} className="text-sm">
                  {m.profiles?.display_name ?? "?"}
                  {m.role_in_classroom === "teacher" && (
                    <span className="ml-1 text-xs text-[var(--color-quantum-muted)]">({t("teacherLabel")})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
    </main>
  );
}
