"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Panel, Button } from "@quantum-party/ui";
import { SignInSchema, SignUpSchema, type Role } from "@quantum-party/schemas";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/auth.js";

/**
 * Puerta de acceso a Aula: sin cuenta real (incluye sesión anónima de juego) no hay dashboard, solo
 * este formulario. La verificación de que la cuenta es real vive en el servidor (RLS + el gate
 * anti-anónimos de 0007) — esto es solo la UI para llegar a tener una.
 */
export function AuthGate() {
  const t = useTranslations("aula.auth");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const parsed = SignUpSchema.safeParse({ email, password, role, displayName });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "datos inválidos");
          return;
        }
        const { needsConfirmation } = await signUpWithEmail(parsed.data);
        if (needsConfirmation) {
          setConfirmSent(true);
        }
        // Si no hace falta confirmar (autoconfirm), Supabase ya entregó sesión — AuthBootstrap la toma
        // sola vía onAuthStateChange y este componente desaparece cuando el padre re-renderiza.
      } else {
        const parsed = SignInSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "datos inválidos");
          return;
        }
        await signInWithEmail(parsed.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (confirmSent) {
    return (
      <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
        <Panel className="text-center">
          <p className="mb-1 font-semibold">{t("confirmTitle")}</p>
          <p className="text-sm text-[var(--color-quantum-muted)]">{t("confirmBody", { email })}</p>
        </Panel>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <Panel className="w-full">
        <div className="mb-4 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={mode === "login" ? "font-semibold text-[var(--color-quantum-text)]" : "text-[var(--color-quantum-muted)]"}
          >
            {t("loginTab")}
          </button>
          <span className="text-[var(--color-quantum-muted)]">/</span>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={mode === "signup" ? "font-semibold text-[var(--color-quantum-text)]" : "text-[var(--color-quantum-muted)]"}
          >
            {t("signupTab")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-transparent px-3 py-2 text-sm"
          />

          {mode === "signup" && (
            <>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-[var(--radius-quantum)] border border-[var(--color-quantum-border)] bg-transparent px-3 py-2 text-sm"
              />
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={role === "student"} onChange={() => setRole("student")} />
                  {t("roleStudent")}
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" checked={role === "teacher"} onChange={() => setRole("teacher")} />
                  {t("roleTeacher")}
                </label>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {mode === "signup" ? t("signupSubmit") : t("loginSubmit")}
          </Button>
        </form>
      </Panel>
    </main>
  );
}
