import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLAYERS, SCORE_GAMES, summarize, useScores, usePlayer } from '../lib/scoreboard';

const playerColor = (id) => PLAYERS.find((p) => p.id === id)?.color;

function StandingRow({ summary }) {
  const { meta, players, leader } = summary;
  return (
    <div className="scoreboard-standing">
      {players.map((p) => (
        <div
          key={p.id}
          className={`scoreboard-player${leader === p.id ? ' leading' : ''}`}
          style={{ '--player-color': playerColor(p.id) }}
        >
          <span className="scoreboard-name">
            {leader === p.id && (
              <span className="scoreboard-crown" aria-label="leading">
                &#9813;
              </span>
            )}
            {p.id}
          </span>
          <span className="scoreboard-value">{p.value ?? '-'}</span>
          <span className="scoreboard-unit">{meta.total ? meta.unit : `best ${meta.unit}`}</span>
        </div>
      ))}
    </div>
  );
}

// Compact Vinnie-vs-Charmy board, sized to sit inside a game-over overlay.
export function GameScoreboard({ game, refreshKey = 0 }) {
  const { rows, shared, loading } = useScores(refreshKey);
  return (
    <div className="scoreboard scoreboard-compact">
      <StandingRow summary={summarize(rows, game)} />
      {!loading && !shared && <p className="scoreboard-device-note">saved on this device only</p>}
    </div>
  );
}

export function ScoreboardHub({ onBack }) {
  const player = usePlayer();
  const { rows, shared, loading } = useScores(0);
  const [open, setOpen] = useState(null);

  return (
    <motion.div
      className="minigame-screen scoreboard-hub"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Scoreboard</span>
        <span className="minigame-score">{player}</span>
      </div>

      <ScoreTally rows={rows} />
      <div className="scoreboard-list">
        {SCORE_GAMES.map((g) => {
          const summary = summarize(rows, g.id);
          const isOpen = open === g.id;
          return (
            <div key={g.id} className="scoreboard-game">
              <button
                type="button"
                className="scoreboard-game-head"
                onClick={() => setOpen(isOpen ? null : g.id)}
                aria-expanded={isOpen}
              >
                <span className="scoreboard-game-title">{g.title}</span>
                <span className="scoreboard-game-mini">
                  {summary.players.map((p) => (
                    <span
                      key={p.id}
                      className={summary.leader === p.id ? 'leading' : ''}
                      style={{ '--player-color': playerColor(p.id) }}
                    >
                      {p.value ?? '-'}
                    </span>
                  ))}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="scoreboard-game-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <StandingRow summary={summary} />
                    {summary.top.length > 0 && (
                      <ol className="scoreboard-top">
                        {summary.top.map((r, i) => (
                          <li key={i} style={{ '--player-color': playerColor(r.player) }}>
                            <span>{r.player}</span>
                            <span>
                              {r.score} {g.unit}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {summary.players.every((p) => p.value == null) && (
                      <p className="scoreboard-empty">no scores yet</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {!loading && !shared && <p className="scoreboard-note">scores are only saved on this device for now</p>}

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
      </div>
    </motion.div>
  );
}

// "Who's ahead overall": one point per game you're leading.
function ScoreTally({ rows }) {
  const leads = Object.fromEntries(PLAYERS.map((p) => [p.id, 0]));
  SCORE_GAMES.forEach((g) => {
    const { leader } = summarize(rows, g.id);
    if (leader) leads[leader] += 1;
  });
  const side = (p) => (
    <span className="scoreboard-tally-side" style={{ '--player-color': p.color }}>
      <span className="scoreboard-tally-name">{p.id}</span>
      <span className="scoreboard-tally-num">{leads[p.id]}</span>
    </span>
  );
  return (
    <div className="scoreboard-tally">
      {side(PLAYERS[0])}
      <span className="scoreboard-tally-vs">games led</span>
      {side(PLAYERS[1])}
    </div>
  );
}
