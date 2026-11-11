-- Likes and dislikes on Vinnie's and Charmy's Reminders profiles.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('Vinnie', 'Charmy')),
  kind text not null check (kind in ('like', 'dislike')),
  category text not null default 'other',
  text text not null check (char_length(text) between 1 and 120),
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "Anyone can read reminders" on public.reminders
  for select using (true);

create policy "Anyone can add reminders" on public.reminders
  for insert with check (true);

create policy "Anyone can remove reminders" on public.reminders
  for delete using (true);
