import { Preset, TreatmentStep } from './types';

// Helper to create steps easily
const createStep = (name: string, minutes: number, enableTimer: boolean, color: string): TreatmentStep => ({
  id: crypto.randomUUID(),
  name,
  duration: minutes * 60,
  enableTimer,
  color,
});

export const STANDARD_TREATMENTS = [
  { name: '핫팩 (Hot Pack)', label: 'HP', duration: 10, color: 'bg-red-500', enableTimer: true },
  { name: 'ICT', label: 'ICT', duration: 10, color: 'bg-blue-500', enableTimer: false },
  { name: '자기장 (Magnetic)', label: 'Mg', duration: 10, color: 'bg-purple-500', enableTimer: false },
  { name: '레이저 (Laser)', label: 'La', duration: 10, color: 'bg-pink-500', enableTimer: true },
  { name: '콜드팩 (Ice)', label: 'Ice', duration: 10, color: 'bg-cyan-500', enableTimer: true },
  { name: '적외선 (IR)', label: 'IR', duration: 10, color: 'bg-red-600', enableTimer: true },
  { name: '마이크로 (MW)', label: 'MW', duration: 5, color: 'bg-yellow-500', enableTimer: true },
  { name: '크라이오 (Cryo)', label: 'Cryo', duration: 2, color: 'bg-sky-400', enableTimer: true },
  { name: '운동치료 (Exercise)', label: 'Ex', duration: 5, color: 'bg-green-500', enableTimer: true },
];

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'preset-basic',
    name: '기본 (Basic)',
    steps: [
      createStep('핫팩 (Hot Pack)', 10, true, 'bg-red-500'),
      createStep('ICT', 10, false, 'bg-blue-500'),
      createStep('자기장 (Magnetic)', 10, false, 'bg-purple-500'),
    ],
  },
  {
    id: 'preset-neck',
    name: '목 치료 (Neck)',
    steps: [
      createStep('핫팩 (Hot Pack)', 10, true, 'bg-red-500'),
      createStep('견인 (Traction)', 15, true, 'bg-orange-500'),
      createStep('ICT', 10, false, 'bg-blue-500'),
    ],
  },
  {
    id: 'preset-simple',
    name: '단순 물리치료',
    steps: [
      createStep('IR (적외선)', 15, true, 'bg-red-600'),
      createStep('TENS', 15, false, 'bg-indigo-500'),
    ],
  },
];

export const TOTAL_BEDS = 11;

export const SUPABASE_INIT_SQL = `
-- [PhysioTrack DB Setup Script v17 - Added Manual Therapy Flag]
-- 1. Create tables
create table if not exists public.beds (
  id bigint primary key,
  status text not null default 'IDLE',
  current_preset_id text,
  custom_preset_json jsonb,
  current_step_index integer not null default 0,
  queue jsonb not null default '[]'::jsonb,
  start_time bigint,
  original_duration integer,
  is_paused boolean not null default false,
  is_injection boolean not null default false,
  is_traction boolean not null default false,
  is_eswt boolean not null default false,
  is_manual boolean not null default false,
  memos jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.presets (
  id text primary key,
  name text not null,
  steps jsonb not null default '[]'::jsonb,
  rank integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Security Configuration & Permissions (CRITICAL FOR DELETE)
alter table public.beds enable row level security;
alter table public.presets enable row level security;

-- Drop existing policies to ensure clean state
drop policy if exists "Allow Public Access" on public.beds;
drop policy if exists "Allow Public Access Presets" on public.presets;
drop policy if exists "Enable all access for all users" on public.presets;

-- Create Permissive Policies (Allow SELECT, INSERT, UPDATE, DELETE)
create policy "Allow Public Access" on public.beds for all using (true) with check (true);
create policy "Allow Public Access Presets" on public.presets for all using (true) with check (true);

-- Explicit Grants (Fixes 'Delete not working' issues by granting strict permissions)
grant all on table public.beds to anon, authenticated, service_role;
grant all on table public.presets to anon, authenticated, service_role;
-- Redundant explicit delete grant for safety
grant delete on table public.presets to anon, authenticated, service_role;

-- 3. Initial Data
-- Beds
insert into public.beds (id, status, queue, memos) 
select i, 'IDLE', '[]'::jsonb, '{}'::jsonb
from generate_series(1, 11) as i
on conflict (id) do update set 
  queue = coalesce(beds.queue, '[]'::jsonb),
  memos = coalesce(beds.memos, '{}'::jsonb);

-- Presets (Insert defaults only if table is empty to prevent overwriting user changes)
insert into public.presets (id, name, steps, rank)
select 'preset-basic', '기본 (Basic)', 
'[{"id": "step-hp-basic", "name": "핫팩 (Hot Pack)", "color": "bg-red-500", "duration": 600, "enableTimer": true}, {"id": "step-ict-basic", "name": "ICT", "color": "bg-blue-500", "duration": 600, "enableTimer": false}, {"id": "step-mg-basic", "name": "자기장 (Magnetic)", "color": "bg-purple-500", "duration": 600, "enableTimer": false}]'::jsonb, 0
where not exists (select 1 from public.presets);

insert into public.presets (id, name, steps, rank)
select 'preset-neck', '목 치료 (Neck)', 
'[{"id": "step-hp-neck", "name": "핫팩 (Hot Pack)", "color": "bg-red-500", "duration": 600, "enableTimer": true}, {"id": "step-tr-neck", "name": "견인 (Traction)", "color": "bg-orange-500", "duration": 900, "enableTimer": true}, {"id": "step-ict-neck", "name": "ICT", "color": "bg-blue-500", "duration": 600, "enableTimer": false}]'::jsonb, 1
where not exists (select 1 from public.presets where id = 'preset-neck');

insert into public.presets (id, name, steps, rank)
select 'preset-simple', '단순 물리치료', 
'[{"id": "step-ir-simple", "name": "적외선 (IR)", "color": "bg-red-600", "duration": 900, "enableTimer": true}, {"id": "step-tens-simple", "name": "TENS", "color": "bg-indigo-500", "duration": 900, "enableTimer": false}]'::jsonb, 2
where not exists (select 1 from public.presets where id = 'preset-simple');

-- 4. Realtime Triggers
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_beds_updated on public.beds;
create trigger on_beds_updated before update on public.beds
for each row execute procedure public.handle_updated_at();

drop trigger if exists on_presets_updated on public.presets;
create trigger on_presets_updated before update on public.presets
for each row execute procedure public.handle_updated_at();

-- Ensure realtime is active
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'beds') then
    alter publication supabase_realtime add table public.beds;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'presets') then
    alter publication supabase_realtime add table public.presets;
  end if;
end $$;
`.trim();