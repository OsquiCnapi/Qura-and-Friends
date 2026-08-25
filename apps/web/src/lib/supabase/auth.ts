"use client";

import type { Role } from "@quantum-party/schemas";
import { createClient } from "./client.js";

/**
 * Signup real (email + contraseña). `options.data` es lo que el trigger `handle_new_user` (0007) lee
 * como `raw_user_meta_data` para fijar el rol y el nombre inicial — ver supabase/migrations/0007_email_auth.sql.
 * Devuelve `needsConfirmation: true` cuando Supabase no entrega sesión todavía (proyecto configurado con
 * "Confirm email" — que es el caso acá): el usuario existe pero no puede hacer nada hasta clickear el
 * link que le llega por correo.
 */
export async function signUpWithEmail(input: {
  email: string;
  password: string;
  role: Role;
  displayName: string;
}): Promise<{ needsConfirmation: boolean }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { role: input.role, display_name: input.displayName },
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/aula` : undefined,
    },
  });
  if (error) throw new Error(error.message);
  return { needsConfirmation: !data.session };
}

export async function signInWithEmail(input: { email: string; password: string }): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) throw new Error(error.message);
}

/** Cierra la sesión real. `AuthBootstrap` reacciona solo y vuelve a entrar como anónimo (el juego sigue
 *  andando), pero Aula vuelve a mostrar el gate de login. */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
