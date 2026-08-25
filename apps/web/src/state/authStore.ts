import { create } from "zustand";

export type Role = "student" | "teacher";
export type AuthStatus = "idle" | "loading" | "ready" | "error";

interface AuthState {
  /** `auth.uid()` — coincide con `profiles.id`. Es el único dato que las policies de RLS conocen. */
  userId: string | null;
  /** Espejo de `profiles.role`. Es SOLO para pintar la UI: la autorización real vive en la base de
   *  datos (`classrooms_insert_teacher`, `is_teacher()`, y ahora también el gate anti-anónimos en
   *  `become_teacher`/`join_classroom_by_code`), así que un valor stale acá nunca abre un hueco de
   *  seguridad — en el peor caso el servidor rechaza la escritura y hay que refrescar. */
  role: Role | null;
  displayName: string | null;
  /** null mientras no hay sesión con email (anónima o sin sesión). Viene directo de `session.user.email`
   *  — no se duplica en `profiles`, Supabase Auth ya es la fuente de verdad para esto. */
  email: string | null;
  /** true = sesión anónima de dispositivo (juego). false = cuenta real con email verificado. Refleja el
   *  claim `is_anonymous` del JWT — el mismo dato que usan las policies/RPCs del servidor para decidir
   *  si algo de Aula está permitido, así que la UI y el backend nunca deberían discrepar en esto. */
  isAnonymous: boolean;
  status: AuthStatus;
  error: string | null;
  setSession: (p: {
    userId: string;
    role: Role;
    displayName: string;
    email: string | null;
    isAnonymous: boolean;
  }) => void;
  setStatus: (s: AuthStatus) => void;
  setError: (e: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,
  displayName: null,
  email: null,
  isAnonymous: true,
  status: "idle",
  error: null,
  setSession: ({ userId, role, displayName, email, isAnonymous }) =>
    set({ userId, role, displayName, email, isAnonymous, status: "ready", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
}));
