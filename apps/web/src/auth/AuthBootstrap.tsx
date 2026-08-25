"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client.js";
import { useAuthStore, type Role } from "@/state/authStore.js";

/**
 * Monta la identidad al arrancar la app. El juego sigue sin pantalla de login — sigue usando identidad
 * **anónima por dispositivo** (`supabase.auth.signInAnonymously`) para que un chico pueda jugar sin
 * fricción. Lo que cambió (ver docs/auth-permissions.md) es que Aula ahora exige una cuenta real: este
 * componente no decide eso, solo mantiene `useAuthStore` sincronizado con lo que sea que haya en el
 * cliente de Supabase — sesión anónima, o una cuenta real después de un login/signup en `/aula`.
 *
 * Sin componente. Se monta una vez en el layout raíz.
 */
export function AuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setStatus = useAuthStore((s) => s.setStatus);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadProfile(userId: string, isAnonymous: boolean, email: string | null) {
      // El trigger `handle_new_user` (0004/0007) ya creó esta fila en la misma transacción del alta en
      // auth.users, así que no hay carrera entre "usuario creado" y "profile disponible".
      const { data, error } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", userId)
        .single();
      if (cancelled) return;
      if (error || !data) {
        setError(error?.message ?? "no se pudo cargar el perfil");
        return;
      }
      setSession({ userId, role: data.role as Role, displayName: data.display_name, email, isAnonymous });
    }

    async function ensureAnonymousSession() {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (cancelled) return;
      if (error || !data.user) {
        setError(error?.message ?? "no se pudo iniciar sesión anónima");
        return;
      }
      await loadProfile(data.user.id, true, null);
    }

    async function bootstrap() {
      setStatus("loading");
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        await ensureAnonymousSession();
        return;
      }
      await loadProfile(user.id, user.is_anonymous ?? true, user.email ?? null);
    }

    void bootstrap();

    // Cubre tres casos: (1) el token se renueva solo, (2) un login/signup real en /aula reemplaza la
    // sesión anónima por una con email, (3) un signOut() explícito deja al cliente sin sesión — en ese
    // caso volvemos a entrar como anónimo de inmediato para que el resto de la app (el juego) no se
    // quede sin identidad.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void loadProfile(session.user.id, session.user.is_anonymous ?? false, session.user.email ?? null);
      } else {
        void ensureAnonymousSession();
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
