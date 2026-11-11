import { supabase } from './supabaseClient';

export const CATEGORIES = [
  { id: 'food', label: 'Food' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'games', label: 'Games' },
  { id: 'music', label: 'Music' },
  { id: 'shows', label: 'Shows' },
  { id: 'places', label: 'Places' },
  { id: 'gifts', label: 'Gifts' },
  { id: 'other', label: 'Other' },
];

export const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label || 'Other';

const TABLE = 'reminders';
const LOCAL_KEY = 'ftd-reminders';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}

function writeLocal(rows) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    /* ignore storage failures */
  }
}

// Reminders live in Supabase so both phones see the same profiles. Until the
// table exists (or when offline) they fall back to this device only.
export async function fetchReminders() {
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: true });
    if (!error) return { rows: data, shared: true };
  }
  return { rows: readLocal(), shared: false };
}

export async function addReminder({ person, kind, category, text }) {
  const fields = { person, kind, category, text: text.trim().slice(0, 120) };
  if (supabase) {
    const { data, error } = await supabase.from(TABLE).insert(fields).select('*').single();
    if (!error) return data;
  }
  const row = { ...fields, id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, created_at: new Date().toISOString() };
  writeLocal([...readLocal(), row]);
  return row;
}

export async function removeReminder(id) {
  if (String(id).startsWith('local-')) {
    writeLocal(readLocal().filter((r) => r.id !== id));
    return true;
  }
  if (!supabase) return false;
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return !error;
}
