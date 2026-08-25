"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Panel, Button } from "@quantum-party/ui";
import { useAuthStore } from "@/state/authStore.js";
import { signOut } from "@/lib/supabase/auth.js";
import {
  createClassroom,
  fetchClassroomRoster,
  fetchMyClassrooms,
  fetchProgressForUsers,
  type ClassroomMemberRow,
  type ClassroomRow,
  type ProgressRow,
} from "@/lib/supabase/classrooms.js";

/** "Administrar aulas": crear aulas y ver, para cada una, el roster de alumnos con su progreso. Un
 *  docente nunca ve el formulario de "unirme por código" — eso es exclusivo del rol alumno. */
export function TeacherDashboard() {
  const t = useTranslations("aula");
  const { displayName, email } = useAuthStore();

  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roster, setRoster] = useState<ClassroomMemberRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);

  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      setClassrooms(await fetchMyClassrooms());
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const r = await fetchClassroomRoster(selectedId);
      setRoster(r);
      setProgress(await fetchProgressForUsers(r.map((m) => m.user_id)));
    })().catch((e) => setFeedback(String(e)));
  }, [selectedId]);

  async function handleCreate() {
    setBusy(true);
    setFeedback(null);
    try {
      const created = await createClassroom(newName.trim() || "Mi aula");
      setNewName("");
      await reload();
      setSelectedId(created.id);
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setBusy(false);
    }
  }

  const selected = classrooms.find((c) => c.id === selectedId) ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("teacherSection")}</h1>
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
        <div className="mb-4 flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("classroomNamePlaceholder")}
            className="flex-1 rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-transparent px-3 py-2 text-sm"
          />
          <Button onClick={handleCreate} disabled={busy}>
            {t("createClassroom")}
          </Button>
        </div>

        {loading && <p className="text-sm text-[var(--color-quantum-muted)]">{t("loading")}</p>}

        <ul className="space-y-2">
          {classrooms.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                className="flex w-full items-center justify-between rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-quantum-surface-2)]"
              >
                <span>{c.name}</span>
                <span className="font-mono tracking-widest text-[var(--color-superposition)]">{c.code}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <div className="mt-4 border-t border-[var(--color-quantum-border)] pt-4">
            <h3 className="mb-2 text-sm font-semibold">{t("roster", { name: selected.name })}</h3>
            {roster.length === 0 && (
              <p className="text-sm text-[var(--color-quantum-muted)]">{t("noStudentsYet", { code: selected.code })}</p>
            )}
            <ul className="space-y-1">
              {roster
                .filter((m) => m.role_in_classroom === "student")
                .map((m) => {
                  const memberProgress = progress.filter((p) => p.user_id === m.user_id);
                  const stars = memberProgress.reduce((sum, p) => sum + p.stars, 0);
                  return (
                    <li key={m.user_id} className="flex items-center justify-between text-sm">
                      <span>{m.profiles?.display_name ?? "?"}</span>
                      <span className="text-[var(--color-quantum-muted)]">{t("starsCount", { count: stars })}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </Panel>
    </main>
  );
}
