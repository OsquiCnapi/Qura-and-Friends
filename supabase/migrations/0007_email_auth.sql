-- Auth real (email + contraseña, verificado) sobre el modelo anónimo existente.
--
-- La identidad anónima (0004) sigue viva para el juego (nadie quiere pedirle contraseña a un chico
-- para jugar). Lo que cambia: el sistema de Aula (crear/administrar/unirse) pasa a exigir una cuenta
-- REAL — email verificado por Supabase Auth (que hashea la contraseña con bcrypt; nunca la tocamos
-- nosotros) — en vez de aceptar cualquier sesión anónima como hacía hasta ahora.
--
-- Supabase expone `is_anonymous` como claim de JWT específicamente para este caso: distinguir, dentro
-- de una policy o función, una sesión anónima de una con credenciales reales. auth.jwt() ->> 'is_anonymous'
-- es 'true'/'false' (string) para cualquier sesión con JWT; usamos coalesce(..., true) para que la
-- ausencia del claim (no debería pasar, pero por si acaso) falle CERRADO, no abierto.

-- ── 1. El rol inicial se elige en el signup, no se adivina ──────────────────────────────────────────
-- `handle_new_user` (0004) creaba el profile con el default de la columna (siempre 'student'). Ahora
-- lee `raw_user_meta_data`, que es exactamente lo que el cliente manda en `options.data` de
-- `supabase.auth.signUp(...)`. Sigue siendo "autodeclarado" (mismo trade-off ya documentado en
-- docs/auth-permissions.md §0: no hay forma de VERIFICAR que alguien sea de verdad docente sin
-- integrarse a un sistema institucional) — lo único que cambia es EN QUÉ MOMENTO se declara: antes al
-- crear la primera aula (`become_teacher`), ahora en el signup. El guard contra escalada
-- (`profiles_guard_role_trigger`, 0004) sigue intacto: nada de esto permite un UPDATE directo de role
-- más adelante, solo afecta el valor inicial en el INSERT.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := new.raw_user_meta_data ->> 'role';
  v_display_name text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
begin
  if v_role is null or v_role not in ('teacher', 'student') then
    v_role := 'student';
  end if;

  insert into public.profiles (id, role, display_name)
  values (new.id, v_role, coalesce(v_display_name, 'Jugador'))
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ── 2. Cerrar Aula a sesiones anónimas, en el servidor (no solo en la UI) ───────────────────────────
-- Sin esto, cualquiera con una sesión anónima (que es CUALQUIERA que abra la app) seguiría pudiendo
-- ser "docente" de mentira o unirse a aulas — la UI puede ocultar el botón, pero eso no es control de
-- acceso. La regla real vive acá.

create or replace function public.become_teacher()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'auth requerida';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, true) then
    raise exception 'necesitas una cuenta con email verificado para ser docente';
  end if;
  perform set_config('app.allow_role_change', 'on', true);
  update public.profiles set role = 'teacher', updated_at = now()
    where id = auth.uid() and role <> 'teacher';
  perform set_config('app.allow_role_change', 'off', true);
end;
$$;

create or replace function public.join_classroom_by_code(p_code text)
returns table (classroom_id uuid, classroom_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom record;
begin
  if auth.uid() is null then
    raise exception 'auth requerida';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, true) then
    raise exception 'necesitas una cuenta con email verificado para unirte a un aula';
  end if;

  select id, name into v_classroom
  from public.classrooms
  where code = upper(trim(p_code));

  if not found then
    raise exception 'código de aula inválido';
  end if;

  insert into public.classroom_members (classroom_id, user_id, role_in_classroom)
  values (v_classroom.id, auth.uid(), 'student')
  on conflict on constraint classroom_members_pkey do nothing;

  return query select v_classroom.id, v_classroom.name;
end;
$$;

drop policy if exists "classrooms_insert_teacher" on public.classrooms;
create policy "classrooms_insert_teacher" on public.classrooms for insert
  with check (
    auth.uid() = host_user_id
    and public.is_teacher(auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, true) = false
  );

-- Limpieza de datos de prueba: cualquier profile anónimo que haya quedado en 'teacher' de pruebas
-- previas a esta migración (por ejemplo, las que corrí por API antes de este cambio) vuelve a 'student'
-- — un usuario anónimo nunca debería poder quedar marcado como docente de acá en adelante.
-- `profiles_guard_role_trigger` (0004) bloquea CUALQUIER UPDATE de `role` sin la puerta abierta,
-- migraciones incluidas (los triggers corren igual sin importar quién dispara la query, a diferencia
-- de RLS) — así que hay que abrirla acá también, igual que hace become_teacher().
select set_config('app.allow_role_change', 'on', true);
update public.profiles p
set role = 'student'
from auth.users u
where p.id = u.id and u.is_anonymous = true and p.role = 'teacher';
select set_config('app.allow_role_change', 'off', true);

-- ── 3. Un alumno puede ver a sus compañeros, no solo su propia fila ──────────────────────────────────
-- `classroom_members_select` (0005) solo dejaba ver: tu propia fila, o todas si sos el docente dueño.
-- Un alumno normal no podía ver a nadie más del aula. Se amplía con `is_classroom_member`, que ya
-- existía desde 0005 para romper la recursión — reutilizarla acá es gratis y mantiene el mismo
-- mecanismo (SECURITY DEFINER, sin volver a disparar RLS) en vez de inventar uno nuevo.
drop policy if exists "classroom_members_select" on public.classroom_members;
create policy "classroom_members_select" on public.classroom_members for select
  using (
    public.is_classroom_host(classroom_id, auth.uid())
    or public.is_classroom_member(classroom_id, auth.uid())
  );
