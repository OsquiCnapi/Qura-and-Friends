"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Panel, Button } from "@quantum-party/ui";
import { ClassroomCodeSchema } from "@quantum-party/schemas";
import { useAuthStore } from "@/state/authStore.js";
import {
  createClassroom,
  fetchClassroomRoster,
  fetchMyClassrooms,
  fetchProgressForUsers,
  joinClassroomByCode,
  type ClassroomMemberRow,
  type ClassroomRow,
  type ProgressRow,
} from "@/lib/supabase/classrooms.js";

/**
 * Aula: dashboard docente + flujo de alumno para unirse por código.
 *
 * Toda la autorización real vive en Postgres (RLS + RBAC, ver supabase/migrations/0004_rbac.sql); este
 * componente solo decide QUÉ MOSTRAR según `role`. Si alguien manipula el estado del cliente para
 * "verse" como docente sin serlo, las queries de todas formas vuelven vacías o el INSERT/RPC lo
 * rechaza el servidor — la UI es conveniencia, no el control de acceso.
 */
export default function AulaPage() {
  const t = useTranslations("aula");
  const { userId, role, status: authStatus, error: authError } = useAuthStore();

  const [classrooms, setClassrooms] = useState<ClassroomRow[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roster, setRoster] = useState<ClassroomMemberRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);

  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function reloadClassrooms() {
    setLoadingClassrooms(true);
    try {
      setClassrooms(await fetchMyClassrooms());
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setLoadingClassrooms(false);
    }
  }

  useEffect(() => {
    if (authStatus === "ready") void reloadClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

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
      await reloadClassrooms();
      setSelectedId(created.id);
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    // Validación de UX (mensaje inmediato); la autoridad de verdad es el RPC en Postgres.
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
      setFeedback(t("joinedFeedback", { name: joined.name }));
      await reloadClassrooms();
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setBusy(false);
    }
  }

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

  const taught = classrooms.filter((c) => c.host_user_id === userId);
  const joined = classrooms.filter((c) => c.host_user_id !== userId);
  const selected = taught.find((c) => c.id === selectedId) ?? null;

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {feedback && (
        <p className="rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-[var(--color-quantum-surface)] px-4 py-2 text-sm">
          {feedback}
        </p>
      )}

      {/* ── Docente ─────────────────────────────────────────────────────────── */}
      <Panel>
        <h2 className="mb-1 text-lg font-semibold">{t("teacherSection")}</h2>
        <p className="mb-4 text-sm text-[var(--color-quantum-muted)]">
          {role === "teacher" ? t("teacherHint") : t("becomeTeacherHint")}
        </p>
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

        {loadingClassrooms && <p className="text-sm text-[var(--color-quantum-muted)]">{t("loading")}</p>}

        <ul className="space-y-2">
          {taught.map((c) => (
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
              {roster.map((m) => {
                const memberProgress = progress.filter((p) => p.user_id === m.user_id);
                const stars = memberProgress.reduce((sum, p) => sum + p.stars, 0);
                return (
                  <li key={m.user_id} className="flex items-center justify-between text-sm">
                    <span>
                      {m.profiles?.display_name ?? "?"}
                      {m.role_in_classroom === "teacher" && (
                        <span className="ml-1 text-xs text-[var(--color-quantum-muted)]">({t("you")})</span>
                      )}
                    </span>
                    <span className="text-[var(--color-quantum-muted)]">
                      {t("starsCount", { count: stars })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Panel>

      {/* ── Alumno ──────────────────────────────────────────────────────────── */}
      <Panel>
        <h2 className="mb-1 text-lg font-semibold">{t("studentSection")}</h2>
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
        {joined.length > 0 && (
          <ul className="space-y-1 text-sm">
            {joined.map((c) => (
              <li key={c.id}>{c.name}</li>
            ))}
          </ul>
        )}
      </Panel>
    </main>
  );
}
