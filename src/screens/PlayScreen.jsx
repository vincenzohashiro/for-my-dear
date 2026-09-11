import { motion } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import PixelSprite from '../components/PixelSprite';
import Die from '../components/Die';
import { HEART_GRID, SPADE_GRID } from '../pixelGrids';

const SCATTER = [
  { type: 'die', value: 3, top: '10%', left: '8%', size: 34 },
  { type: 'die', value: 5, top: '72%', left: '86%', size: 30 },
  { type: 'card', suit: 'heart', top: '14%', left: '82%' },
  { type: 'card', suit: 'spade', top: '76%', left: '10%' },
  { type: 'die', value: 1, top: '45%', left: '92%', size: 26 },
  { type: 'card', suit: 'heart', top: '82%', left: '48%' },
  { type: 'die', value: 6, top: '8%', left: '46%', size: 24 },
];

export default function PlayScreen({ onBack }) {
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

      <motion.div
        className="play-board"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 className="pixel-heading small">
          <TypewriterText text="Play a Game" />
        </h1>
        <p className="pixel-body">new minigames coming soon...</p>
        <button type="button" className="play-back" onClick={onBack}>
          Back
        </button>
      </motion.div>
    </div>
  );
}
