-- One-time setup for the shared scoreboard and Reminders.
-- Supabase dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- Safe to run more than once.

-- Scoreboard
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  game text not null,
  player text not null check (player in ('Vinnie', 'Charmy')),
  score integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_game_idx on public.scores (game);

alter table public.scores enable row level security;

drop policy if exists "Anyone can read scores" on public.scores;
create policy "Anyone can read scores" on public.scores
  for select using (true);

drop policy if exists "Anyone can add scores" on public.scores;
create policy "Anyone can add scores" on public.scores
  for insert with check (true);

-- Reminders
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('Vinnie', 'Charmy')),
  kind text not null check (kind in ('like', 'dislike')),
  category text not null default 'other',
  text text not null check (char_length(text) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

drop policy if exists "Anyone can read reminders" on public.reminders;
create policy "Anyone can read reminders" on public.reminders
  for select using (true);

drop policy if exists "Anyone can add reminders" on public.reminders;
create policy "Anyone can add reminders" on public.reminders
  for insert with check (true);

drop policy if exists "Anyone can remove reminders" on public.reminders;
create policy "Anyone can remove reminders" on public.reminders
  for delete using (true);
