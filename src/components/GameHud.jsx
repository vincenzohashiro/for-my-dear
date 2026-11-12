import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import PixelSprite from './PixelSprite';
import { HEART_GRID } from '../pixelGrids';
import { PLAYERS, gameMeta, summarize, usePlayer, useScores } from '../lib/scoreboard';

const MILESTONES = [5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 500, 1000];
const CHEERS = ['Nice!', 'Sweet!', 'On fire!', 'Look at you!', 'Unstoppable!', 'Wow!'];

function celebrate() {
  confetti({
    particleCount: 80,
    spread: 80,
    origin: { y: 0.45 },
    colors: ['#ff6b9d', '#ffd93d', '#4fc3f7', '#3fbf6f', '#ffffff'],
    shapes: ['square'],
    scalar: 1,
  });
}

// The strip under each game's title: who's playing, their best, little
// cheers at score milestones, and a NEW BEST burst when a record falls.
export default function GameHud({ game, score, done, unit }) {
  const player = usePlayer();
  const meta = gameMeta(game);
  const { rows, loading } = useScores(0);
  const summary = summarize(rows, game);
  const mine = summary.players.find((p) => p.id === player);
  const best = mine?.value ?? null;
  const lower = Boolean(meta?.lower);

  const [toast, setToast] = useState(null);
  const [newBest, setNewBest] = useState(false);
  const lastScore = useRef(score);
  const celebrated = useRef(false);

  // Cheer when the score passes a milestone (not for fewest-moves games).
  useEffect(() => {
    const prev = lastScore.current;
    lastScore.current = score;
    if (lower || done || score <= prev) return undefined;
    const hit = MILESTONES.find((m) => prev < m && score >= m);
    if (!hit) return undefined;
    const t = setTimeout(() => setToast({ id: hit, text: `${CHEERS[MILESTONES.indexOf(hit) % CHEERS.length]} ${hit} ${unit || meta?.unit || 'pts'}` }), 0);
    return () => clearTimeout(t);
  }, [score, done, lower, unit, meta]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(t);
  }, [toast]);

  // A new personal record when the run ends.
  useEffect(() => {
    if (!done) {
      celebrated.current = false;
      const t = setTimeout(() => setNewBest(false), 0);
      return () => clearTimeout(t);
    }
    if (celebrated.current || loading || score <= 0) return undefined;
    const beat = best == null || (lower ? score < best : score > best);
    if (!beat) return undefined;
    celebrated.current = true;
    celebrate();
    const t = setTimeout(() => setNewBest(true), 0);
    return () => clearTimeout(t);
  }, [done, score, best, lower, loading]);

  const color = PLAYERS.find((p) => p.id === player)?.color;

  return (
    <div className="game-hud">
      {player && (
        <span className="game-hud-player" style={{ '--player-color': color }}>
          <PixelSprite grid={HEART_GRID} size={12} color="var(--player-color)" />
          {player}
        </span>
      )}
      <span className="game-hud-best">
        best <strong>{best ?? '-'}</strong>
        {summary.leader && summary.leader === player && (
          <span className="game-hud-crown" title="You lead">
            &#9813;
          </span>
        )}
      </span>

      <AnimatePresence>
        {toast && (
          <motion.span
            key={toast.id}
            className="game-hud-toast"
            initial={{ opacity: 0, y: 8, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {toast.text}
          </motion.span>
        )}
        {newBest && (
          <motion.span
            key="new-best"
            className="game-hud-newbest"
            initial={{ opacity: 0, scale: 0.4, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: [-8, 4, 0] }}
            exit={{ opacity: 0 }}
          >
            NEW BEST!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
