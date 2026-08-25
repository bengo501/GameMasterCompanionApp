-- =====================================================================
-- OpenMaster-NarratorHelper — Row Level Security (RLS)
-- Rode este script no Supabase: SQL Editor > New query > Run.
-- Rode DEPOIS de aplicar as migrations (npm run db:migrate).
--
-- Por que isto é necessário:
-- O Supabase expõe uma API pública (PostgREST) usando a anon key, que fica
-- embutida no bundle do front. Sem RLS, qualquer um com essa chave poderia
-- ler/gravar todas as linhas. As políticas abaixo restringem cada usuário
-- aos próprios dados. (A app usa conexão direta via Drizzle e também filtra
-- por owner_id no código — isto aqui é a defesa da API pública.)
-- =====================================================================

alter table campaign enable row level security;

drop policy if exists "campaign_select_own" on campaign;
create policy "campaign_select_own" on campaign
  for select to authenticated
  using (auth.uid() = owner_id);

drop policy if exists "campaign_insert_own" on campaign;
create policy "campaign_insert_own" on campaign
  for insert to authenticated
  with check (auth.uid() = owner_id);

drop policy if exists "campaign_update_own" on campaign;
create policy "campaign_update_own" on campaign
  for update to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "campaign_delete_own" on campaign;
create policy "campaign_delete_own" on campaign
  for delete to authenticated
  using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- actor (M2)
-- ---------------------------------------------------------------------------
alter table actor enable row level security;

drop policy if exists "actor_select_own" on actor;
create policy "actor_select_own" on actor
  for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "actor_insert_own" on actor;
create policy "actor_insert_own" on actor
  for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "actor_update_own" on actor;
create policy "actor_update_own" on actor
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "actor_delete_own" on actor;
create policy "actor_delete_own" on actor
  for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- location (M2)
-- ---------------------------------------------------------------------------
alter table location enable row level security;

drop policy if exists "location_select_own" on location;
create policy "location_select_own" on location
  for select to authenticated using (auth.uid() = owner_id);

drop policy if exists "location_insert_own" on location;
create policy "location_insert_own" on location
  for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "location_update_own" on location;
create policy "location_update_own" on location
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "location_delete_own" on location;
create policy "location_delete_own" on location
  for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- session, scene, note (M3)
-- ---------------------------------------------------------------------------
alter table session enable row level security;

drop policy if exists "session_select_own" on session;
create policy "session_select_own" on session
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "session_insert_own" on session;
create policy "session_insert_own" on session
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "session_update_own" on session;
create policy "session_update_own" on session
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "session_delete_own" on session;
create policy "session_delete_own" on session
  for delete to authenticated using (auth.uid() = owner_id);

alter table scene enable row level security;

drop policy if exists "scene_select_own" on scene;
create policy "scene_select_own" on scene
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "scene_insert_own" on scene;
create policy "scene_insert_own" on scene
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "scene_update_own" on scene;
create policy "scene_update_own" on scene
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "scene_delete_own" on scene;
create policy "scene_delete_own" on scene
  for delete to authenticated using (auth.uid() = owner_id);

alter table note enable row level security;

drop policy if exists "note_select_own" on note;
create policy "note_select_own" on note
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "note_insert_own" on note;
create policy "note_insert_own" on note
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "note_update_own" on note;
create policy "note_update_own" on note
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "note_delete_own" on note;
create policy "note_delete_own" on note
  for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- dice_roll (M4)
-- ---------------------------------------------------------------------------
alter table dice_roll enable row level security;

drop policy if exists "dice_roll_select_own" on dice_roll;
create policy "dice_roll_select_own" on dice_roll
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "dice_roll_insert_own" on dice_roll;
create policy "dice_roll_insert_own" on dice_roll
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "dice_roll_delete_own" on dice_roll;
create policy "dice_roll_delete_own" on dice_roll
  for delete to authenticated using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- encounter, combatant (M5)
-- ---------------------------------------------------------------------------
alter table encounter enable row level security;

drop policy if exists "encounter_select_own" on encounter;
create policy "encounter_select_own" on encounter
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "encounter_insert_own" on encounter;
create policy "encounter_insert_own" on encounter
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "encounter_update_own" on encounter;
create policy "encounter_update_own" on encounter
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "encounter_delete_own" on encounter;
create policy "encounter_delete_own" on encounter
  for delete to authenticated using (auth.uid() = owner_id);

alter table combatant enable row level security;

drop policy if exists "combatant_select_own" on combatant;
create policy "combatant_select_own" on combatant
  for select to authenticated using (auth.uid() = owner_id);
drop policy if exists "combatant_insert_own" on combatant;
create policy "combatant_insert_own" on combatant
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "combatant_update_own" on combatant;
create policy "combatant_update_own" on combatant
  for update to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "combatant_delete_own" on combatant;
create policy "combatant_delete_own" on combatant
  for delete to authenticated using (auth.uid() = owner_id);
