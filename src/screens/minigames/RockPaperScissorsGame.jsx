import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { recordScore, usePlayer } from '../../lib/scoreboard';

const CHOICES = [
  { id: 'rock', label: 'Rock', emoji: '✊' },
  { id: 'paper', label: 'Paper', emoji: '✋' },
  { id: 'scissors', label: 'Scissors', emoji: '✌' },
];

const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

function judge(playerId, cpuId) {
  if (playerId === cpuId) return 'tie';
  return BEATS[playerId] === cpuId ? 'win' : 'lose';
}

export default function RockPaperScissorsGame({ onBack }) {
  const [tally, setTally] = useState({ win: 0, lose: 0, tie: 0 });
  const [round, setRound] = useState(null);
  // There's no game over here, so the scoreboard tracks the best win streak.
  // A streak is banked when it's broken by a loss, a reset, or leaving.
  const player = usePlayer();
  const [streak, setStreak] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(0);
  const pending = useRef({ streak: 0, player });
  useEffect(() => {
    pending.current = { streak, player };
  });

  const bankStreak = (n) => {
    if (n > 0 && player) recordScore('rps', player, n).then(() => setScoreSaved((k) => k + 1));
  };

  useEffect(
    () => () => {
      const { streak: n, player: who } = pending.current;
      if (n > 0 && who) recordScore('rps', who, n);
    },
    []
  );

  const play = (choiceId) => {
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
    const result = judge(choiceId, cpuChoice);
    setTally((t) => ({ ...t, [result]: t[result] + 1 }));
    setRound({ player: choiceId, cpu: cpuChoice, result });
    if (result === 'win') setStreak((n) => n + 1);
    if (result === 'lose') {
      bankStreak(streak);
      setStreak(0);
    }
  };

  const resetTally = () => {
    bankStreak(streak);
    setStreak(0);
    setTally({ win: 0, lose: 0, tie: 0 });
    setRound(null);
  };

  const resultLabel = {
    win: 'You win!',
    lose: 'You lose!',
    tie: "It's a tie!",
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Rock Paper Scissors</span>
        <span className="minigame-score">
          {tally.win}W {tally.lose}L {tally.tie}T
        </span>
      </div>

      <div className="rps-arena">
        <AnimatePresence mode="wait">
          {round ? (
            <motion.div
              key={`${round.player}-${round.cpu}-${tally.win + tally.lose + tally.tie}`}
              className="rps-round"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rps-faceoff">
                <span className="rps-emoji">{CHOICES.find((c) => c.id === round.player).emoji}</span>
                <span className="rps-vs">vs</span>
                <span className="rps-emoji">{CHOICES.find((c) => c.id === round.cpu).emoji}</span>
              </div>
              <p className={`rps-result rps-result-${round.result}`}>{resultLabel[round.result]}</p>
            </motion.div>
          ) : (
            <p className="pixel-body">Pick one to start</p>
          )}
        </AnimatePresence>
      </div>

      <div className="rps-choices">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="rps-choice"
            onClick={() => play(choice.id)}
          >
            <span className="rps-emoji">{choice.emoji}</span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>

      <p className="rps-streak">win streak: {streak}</p>
      <GameScoreboard game="rps" refreshKey={scoreSaved} />

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
        <button type="button" className="editor-exit-link" onClick={resetTally}>
          Reset Tally
        </button>
      </div>
    </motion.div>
  );
}
