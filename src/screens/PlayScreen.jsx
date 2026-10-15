import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import PixelSprite from '../components/PixelSprite';
import Die from '../components/Die';
import { HEART_GRID, SPADE_GRID } from '../pixelGrids';
import MemoryMatchGame from './minigames/MemoryMatchGame';
import FlappyHeartGame from './minigames/FlappyHeartGame';
import WhackAHeartGame from './minigames/WhackAHeartGame';
import MergeHeartsGame from './minigames/MergeHeartsGame';

const SCATTER = [
  { type: 'die', value: 3, top: '10%', left: '8%', size: 34 },
  { type: 'die', value: 5, top: '72%', left: '86%', size: 30 },
  { type: 'card', suit: 'heart', top: '14%', left: '82%' },
  { type: 'card', suit: 'spade', top: '76%', left: '10%' },
  { type: 'die', value: 1, top: '45%', left: '92%', size: 26 },
  { type: 'card', suit: 'heart', top: '82%', left: '48%' },
  { type: 'die', value: 6, top: '8%', left: '46%', size: 24 },
];

const GAMES = [
  { id: 'memory', title: 'Memory Match', tagline: 'Find the pairs', color: 'var(--pink)' },
  { id: 'flappy', title: 'Flappy Heart', tagline: 'Tap to fly', color: 'var(--blue)' },
  { id: 'whack', title: 'Whack-a-Heart', tagline: 'Quick clicks', color: 'var(--yellow)' },
  { id: 'merge', title: 'Merge Hearts', tagline: 'Slide & combine', color: 'var(--purple)' },
];

const GAME_COMPONENTS = {
  memory: MemoryMatchGame,
  flappy: FlappyHeartGame,
  whack: WhackAHeartGame,
  merge: MergeHeartsGame,
};

export default function PlayScreen({ onBack }) {
  const [activeGame, setActiveGame] = useState(null);

  const ActiveGameComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

  return (
    <div className="play-screen">
      <div className="play-felt" aria-hidden="true" />

      <div className="play-scatter" aria-hidden="true">
        {SCATTER.map((piece, i) =>
          piece.type === 'die' ? (
            <Die
              key={i}
              value={piece.value}
              size={piece.size}
              className="play-piece"
              style={{ top: piece.top, left: piece.left }}
            />
          ) : (
            <div
              key={i}
              className="play-card play-piece"
              style={{ top: piece.top, left: piece.left }}
            >
              <PixelSprite
                grid={piece.suit === 'heart' ? HEART_GRID : SPADE_GRID}
                size={16}
                color={piece.suit === 'heart' ? '#e6394f' : '#1a1a2e'}
              />
            </div>
          )
        )}
      </div>

      <AnimatePresence mode="wait">
        {ActiveGameComponent ? (
          <ActiveGameComponent key={activeGame} onBack={() => setActiveGame(null)} />
        ) : (
          <motion.div
            key="select"
            className="play-board play-board-select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h1 className="pixel-heading small">
              <TypewriterText text="Play a Game" />
            </h1>
            <p className="pixel-body play-subtitle">quick minigames, just for fun</p>

            <div className="play-game-grid">
              {GAMES.map((game, index) => (
                <motion.button
                  key={game.id}
                  type="button"
                  className="play-game-tile"
                  style={{ '--tile-color': game.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.2 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveGame(game.id)}
                >
                  <PixelSprite grid={HEART_GRID} size={22} color="var(--tile-color)" />
                  <span className="play-game-tile-title">{game.title}</span>
                  <span className="play-game-tile-tagline">{game.tagline}</span>
                </motion.button>
              ))}
            </div>

            <button type="button" className="play-back" onClick={onBack}>
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
