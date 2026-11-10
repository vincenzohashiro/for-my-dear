import { supabase } from '../lib/supabaseClient';
import { buildLetterFromFields } from '../lib/letterUtils';

// Letters hidden from the archive without touching their data in Supabase.
// Add an id here to hide a letter; remove it to bring the letter back.
const HIDDEN_LETTER_IDS = [];

// Letters written through the site's editor, oldest first. `addedAt` is when
// the letter was actually saved, used to decide whether it counts as new.
export async function fetchWrittenLetters() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('letters').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data
    .filter((row) => !HIDDEN_LETTER_IDS.includes(row.id))
    .map((row) => ({
      ...buildLetterFromFields({
        id: row.id,
        title: row.title,
        dateDisplay: row.date_display,
        body: row.body,
        closing: row.closing,
        colorSeed: row.id,
        attachments: row.attachments,
      }),
      addedAt: row.created_at,
    }));
}
