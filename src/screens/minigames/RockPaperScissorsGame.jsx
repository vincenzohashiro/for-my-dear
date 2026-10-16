import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const play = (choiceId) => {
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
    const result = judge(choiceId, cpuChoice);
    setTally((t) => ({ ...t, [result]: t[result] + 1 }));
    setRound({ player: choiceId, cpu: cpuChoice, result });
  };

  const resetTally = () => {
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
