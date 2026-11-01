-- Shared Vinnie vs Charmy scoreboard for the Play a Game tab.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  game text not null,
  player text not null check (player in ('Vinnie', 'Charmy')),
  score integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_game_idx on public.scores (game);

alter table public.scores enable row level security;

create policy "Anyone can read scores" on public.scores
  for select using (true);

create policy "Anyone can add scores" on public.scores
  for insert with check (true);
