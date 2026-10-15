import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import PixelSprite from '../../components/PixelSprite';
import {
  HEART_GRID,
  STAR_GRID,
  MOON_GRID,
  CAMERA_GRID,
  ENVELOPE_GRID,
  CONTROLLER_GRID,
  PAW_GRID,
  SKULL_GRID,
} from '../../pixelGrids';

const ICONS = [
  { grid: HEART_GRID, color: 'var(--pink)' },
  { grid: STAR_GRID, color: 'var(--yellow)' },
  { grid: MOON_GRID, color: '#fff3c4' },
  { grid: CAMERA_GRID, color: 'var(--sky)' },
  { grid: ENVELOPE_GRID, color: 'var(--purple)' },
  { grid: CONTROLLER_GRID, color: 'var(--teal)' },
  { grid: PAW_GRID, color: 'var(--green)' },
  { grid: SKULL_GRID, color: 'var(--red)' },
];

function shuffledDeck() {
  const deck = ICONS.flatMap((icon, iconIndex) => [
    { key: `${iconIndex}-a`, iconIndex },
    { key: `${iconIndex}-b`, iconIndex },
  ]);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function MemoryMatchGame({ onBack }) {
  const [deck, setDeck] = useState(shuffledDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const won = matched.length === deck.length;

  const handleFlip = (index) => {
    if (locked || flipped.includes(index) || matched.includes(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = nextFlipped;
      if (deck[a].iconIndex === deck[b].iconIndex) {
        setTimeout(() => {
          setMatched((prev) => [...prev, a, b]);
          setFlipped([]);
          setLocked(false);
        }, 400);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  const handleRestart = () => {
    setDeck(shuffledDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Memory Match</span>
        <span className="minigame-score">Moves: {moves}</span>
      </div>

      <div className="memory-grid">
        {deck.map((card, index) => {
          const isFaceUp = flipped.includes(index) || matched.includes(index);
          const icon = ICONS[card.iconIndex];
          return (
            <button
              key={card.key}
              type="button"
              className={`memory-card${isFaceUp ? ' face-up' : ''}`}
              onClick={() => handleFlip(index)}
            >
              {isFaceUp ? (
                <PixelSprite grid={icon.grid} size={20} color={icon.color} />
              ) : (
                <PixelSprite grid={HEART_GRID} size={14} color="rgba(43,33,64,0.25)" />
              )}
            </button>
          );
        })}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {won && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">You found them all!</span>
          <span className="minigame-overlay-score">in {moves} moves</span>
          <button type="button" className="minigame-restart" onClick={handleRestart}>
            Play Again
          </button>
        </div>
      )}
    </motion.div>
  );
}
