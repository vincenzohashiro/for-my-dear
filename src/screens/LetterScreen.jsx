import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import PixelHeart from '../components/PixelHeart';
import { FLAME_GRID, ENVELOPE_GRID } from '../pixelGrids';
import { LETTERS } from '../letters';
import LetterDetailScreen from './LetterDetailScreen';

export default function LetterScreen({ onBack }) {
  const [openLetter, setOpenLetter] = useState(null);

  return (
    <div className="letter-screen">
      <div className="letter-desk" aria-hidden="true" />

      <div className="letter-candle" aria-hidden="true">
        <div className="letter-candle-glow" />
        <PixelSprite grid={FLAME_GRID} size={18} color="#ffb43d" className="letter-flame" />
        <div className="letter-candle-body" />
      </div>

      <AnimatePresence mode="wait">
        {openLetter ? (
          <LetterDetailScreen
            key="detail"
            letter={openLetter}
            onBack={() => setOpenLetter(null)}
          />
        ) : (
          <motion.div
            key="archive"
            className="letter-archive"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PixelHeart size={22} color="#ff8fb3" className="pixel-beat" />
            <h1 className="pixel-heading small">Letters</h1>
            <p className="letter-archive-subtitle">a little note, every month</p>

            <div className="letter-list">
              {LETTERS.map((letter, index) => (
                <motion.button
                  key={letter.id}
                  type="button"
                  className="letter-envelope"
                  style={{ '--tile-color': letter.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.2 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setOpenLetter(letter)}
                >
                  <span className="letter-envelope-icon">
                    <PixelSprite grid={ENVELOPE_GRID} size={26} color="#2b2140" />
                  </span>
                  <span className="letter-envelope-text">
                    <span className="letter-envelope-date">{letter.date}</span>
                    <span className="letter-envelope-title">{letter.title}</span>
                  </span>
                  <span className="letter-envelope-open">Open &rarr;</span>
                </motion.button>
              ))}
            </div>

            <button type="button" className="letter-back" onClick={onBack}>
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
