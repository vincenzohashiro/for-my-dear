import { createContext, useContext } from 'react';
import { LETTERS } from '../letters';
import { CHAPTERS } from '../content/storyChapters';
import { PHOTO_GAMES, getMedia } from '../content/photoGames';
import { MINIGAMES } from '../content/minigames';
import { parseLetterDate } from './letterUtils';

const STORE_KEY = 'ftd-whats-new';
// On a device's first visit, things added in the two weeks before still count as new.
const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export const WhatsNewContext = createContext(null);
export const useWhatsNew = () => useContext(WhatsNewContext);

const toTime = (value) => {
  const time = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(time) ? time : null;
};

// Everything on the site that can be "new", as one flat list.
export function collectItems(writtenLetters, reminders = []) {
  const letters = [...LETTERS, ...writtenLetters].map((letter) => ({
    key: `letter:${letter.id}`,
    kind: 'letter',
    step: 'letter',
    id: letter.id,
    title: letter.title,
    time: toTime(letter.addedAt) ?? toTime(parseLetterDate(letter.date)),
  }));
  const chapters = CHAPTERS.filter((c) => !c.comingSoon).map((c) => ({
    key: `chapter:${c.id}`,
    kind: 'chapter',
    step: 'story',
    id: c.id,
    title: `${c.label}: ${c.title}`,
    time: toTime(c.added),
  }));
  const photos = PHOTO_GAMES.flatMap((game) =>
    getMedia(game.id).map((media) => ({
      key: `photo:${media.path}`,
      kind: 'photo',
      step: 'photos',
      id: game.id,
      title: game.title,
      time: null,
    }))
  );
  const games = MINIGAMES.map((g) => ({
    key: `game:${g.id}`,
    kind: 'game',
    step: 'game',
    id: g.id,
    title: g.title,
    time: toTime(g.added),
  }));
  const notes = reminders.map((r) => ({
    key: `reminder:${r.id}`,
    kind: 'reminder',
    step: 'reminders',
    id: r.person,
    title: `${r.person} ${r.kind === 'like' ? 'likes' : 'dislikes'}: ${r.text}`,
    time: toTime(r.created_at),
  }));
  return [...letters, ...chapters, ...photos, ...games, ...notes];
}

// What this device has seen: { firstVisit, seen: [keys], known: { key: firstSeenTime } }.
// `known` dates the things that have no date of their own, like photos.
function readStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (stored && stored.firstVisit) return stored;
  } catch {
    /* unreadable or blocked storage: start fresh */
  }
  return null;
}

export function loadStore() {
  const stored = readStored();
  if (stored) return { firstVisit: stored.firstVisit, seen: stored.seen || [], known: stored.known || {}, fresh: false };
  return { firstVisit: Date.now(), seen: [], known: {}, fresh: true };
}

export function saveStore(store) {
  const stored = readStored();
  const seen = new Set([...(stored?.seen || []), ...store.seen]);
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        firstVisit: stored?.firstVisit || store.firstVisit,
        seen: [...seen],
        known: { ...(stored?.known || {}), ...store.known },
      })
    );
  } catch {
    /* ignore storage failures */
  }
}

// For screens outside the provider (the letter editor): mark something as already seen.
export function rememberSeen(keys) {
  const store = loadStore();
  saveStore({ ...store, seen: [...store.seen, ...keys] });
}

// Undated things count as old on a device's very first visit, and as new
// when they show up on any later visit.
export function itemTime(item, store, sessionStart) {
  return item.time ?? store.known[item.key] ?? (store.fresh ? 0 : sessionStart);
}

export function isNew(item, store, seenSet, sessionStart) {
  if (seenSet.has(item.key)) return false;
  return itemTime(item, store, sessionStart) >= store.firstVisit - NEW_WINDOW_MS;
}
