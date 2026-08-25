-- Fix: "infinite recursion detected in policy for relation classrooms" (0004_rbac.sql).
--
-- `classrooms_select_member` (en classrooms) hace EXISTS contra classroom_members. Para evaluar ESA
-- subconsulta, Postgres tiene que aplicarle a `classroom_members` sus propias policies — y
-- `classroom_members_select` hace EXISTS de vuelta contra `classrooms`, que otra vez necesita evaluar
-- `classrooms_select_member`... Dos tablas cuyas policies de SELECT se consultan mutuamente entran en
-- un ciclo que Postgres detecta y aborta.
--
-- Arreglo: mover cada subconsulta a una función SECURITY DEFINER. Al ser su dueño (`postgres`) también
-- dueño de la tabla que lee adentro, esa lectura interna NO vuelve a pasar por RLS (los dueños de tabla
-- están exentos de sus propias policies salvo FORCE ROW LEVEL SECURITY) — se corta el ciclo ahí. Es el
-- mismo mecanismo que ya usan `join_classroom_by_code` y `classrooms_add_host_membership` en 0004, solo
-- que ahora también hace falta para lecturas, no solo para escrituras mediadas.

create or replace function public.is_classroom_host(p_classroom_id uuid, p_uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.classrooms c
    where c.id = p_classroom_id and c.host_user_id = p_uid
  );
$$;

create or replace function public.is_classroom_member(p_classroom_id uuid, p_uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.classroom_members m
    where m.classroom_id = p_classroom_id and m.user_id = p_uid
  );
$$;

drop policy if exists "classrooms_select_member" on public.classrooms;
create policy "classrooms_select_member" on public.classrooms for select
  using (auth.uid() = host_user_id or public.is_classroom_member(id, auth.uid()));

drop policy if exists "classroom_members_select" on public.classroom_members;
create policy "classroom_members_select" on public.classroom_members for select
  using (auth.uid() = user_id or public.is_classroom_host(classroom_id, auth.uid()));
