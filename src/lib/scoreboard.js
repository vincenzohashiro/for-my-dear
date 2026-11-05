import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from './supabaseClient';

export const PLAYERS = [
  { id: 'Vinnie', color: 'var(--blue)' },
  { id: 'Charmy', color: 'var(--pink)' },
];

// Every scored game. `lower` = fewer is better, `total` = wins add up instead of keeping a best.
export const SCORE_GAMES = [
  { id: 'memory', title: 'Memory Match', unit: 'moves', lower: true },
  { id: 'flappy', title: 'Flappy Heart', unit: 'pts' },
  { id: 'whack', title: 'Whack-a-Heart', unit: 'pts' },
  { id: 'merge', title: 'Merge Hearts', unit: 'pts' },
  { id: 'snake', title: 'Snake', unit: 'pts' },
  { id: 'rps', title: 'Rock Paper Scissors', unit: 'win streak' },
  { id: 'colors', title: 'Color Memory', unit: 'rounds' },
  { id: 'catch', title: 'Catch the Hearts', unit: 'pts' },
  { id: 'flap', title: 'Pixel Flap', unit: 'pts' },
  { id: 'runner', title: 'Pixel Runner', unit: 'pts' },
  { id: 'breaker', title: 'Brick Breaker', unit: 'pts' },
  { id: 'invaders', title: 'Pixel Invaders', unit: 'pts' },
  { id: 'chess', title: 'Chess', unit: 'wins', total: true },
  { id: 'bee-easy', title: 'Spelling Bee · Easy', unit: 'words' },
  { id: 'bee-medium', title: 'Spelling Bee · Medium', unit: 'words' },
  { id: 'bee-hard', title: 'Spelling Bee · Hard', unit: 'words' },
  { id: 'rps-live', title: 'Live · Rock Paper Scissors', unit: 'matches won', total: true },
  { id: 'bee-race', title: 'Live · Spelling Bee Race', unit: 'races won', total: true },
  { id: 'race', title: 'Live · Score Race', unit: 'races won', total: true },
];

export const gameMeta = (id) => SCORE_GAMES.find((g) => g.id === id);

const LOCAL_KEY = 'ftd-scores';
const TABLE = 'scores';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
}

// Scores live in Supabase so both phones share one board. Until the table
// exists (or if the network is down) they fall back to this device only.
export async function recordScore(game, player, score) {
  const row = { game, player, score, created_at: new Date().toISOString() };
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...readLocal(), row].slice(-500)));
  } catch {
    /* ignore storage failures */
  }
  if (supabase) {
    const { error } = await supabase.from(TABLE).insert({ game, player, score });
    if (error) console.warn('Score not synced:', error.message);
  }
}

export async function fetchScores() {
  if (supabase) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('game, player, score, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (!error) return { rows: data, shared: true };
  }
  return { rows: readLocal(), shared: false };
}

// Per-player standing for one game, plus the top runs overall.
export function summarize(rows, gameId) {
  const meta = gameMeta(gameId);
  const gameRows = rows.filter((r) => r.game === gameId);
  const better = (a, b) => (meta.lower ? a < b : a > b);

  const players = PLAYERS.map(({ id }) => {
    const mine = gameRows.filter((r) => r.player === id);
    let value = null;
    if (mine.length) {
      value = meta.total
        ? mine.reduce((sum, r) => sum + r.score, 0)
        : mine.reduce((best, r) => (better(r.score, best) ? r.score : best), mine[0].score);
    }
    return { id, value, plays: mine.length };
  });

  const [a, b] = players;
  let leader = null;
  if (a.value != null && (b.value == null || better(a.value, b.value))) leader = a.id;
  else if (b.value != null && (a.value == null || better(b.value, a.value))) leader = b.id;

  const top = meta.total
    ? []
    : [...gameRows].sort((x, y) => (meta.lower ? x.score - y.score : y.score - x.score)).slice(0, 5);

  return { meta, players, leader, top };
}

// Shows this device's scores straight away, then swaps in the shared board once it loads.
export function useScores(refreshKey) {
  const [state, setState] = useState(() => ({ rows: readLocal(), shared: false, loading: true }));
  useEffect(() => {
    let live = true;
    fetchScores().then((res) => live && setState({ ...res, loading: false }));
    return () => {
      live = false;
    };
  }, [refreshKey]);
  return state;
}

export const PlayerContext = createContext(null);
export const usePlayer = () => useContext(PlayerContext);

// Set by a live score race so every game reports its running score without
// needing race-specific code of its own.
export const RaceContext = createContext(null);

// Records one score each time `done` flips to true. Returns a key that changes
// once the save lands, so scoreboards can refetch.
export function useRecordScore(game, done, score) {
  const player = usePlayer();
  const race = useContext(RaceContext);
  const recorded = useRef(false);
  const [savedKey, setSavedKey] = useState(0);

  useEffect(() => {
    race?.report(score, done);
  }, [race, score, done]);

  useEffect(() => {
    if (!done) {
      recorded.current = false;
      return;
    }
    if (recorded.current || !player) return;
    recorded.current = true;
    // A zero run isn't worth a spot on the board (fewest-moves games never score 0).
    if (score <= 0) return;
    recordScore(game, player, score).then(() => setSavedKey((k) => k + 1));
  }, [done, game, player, score]);

  return savedKey;
}
