import { motion } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import PixelSprite from '../components/PixelSprite';
import PixelHeart from '../components/PixelHeart';
import { FLAME_GRID } from '../pixelGrids';

export default function LetterScreen({ onBack }) {
  return (
    <div className="letter-screen">
      <div className="letter-desk" aria-hidden="true" />

      <div className="letter-candle" aria-hidden="true">
        <div className="letter-candle-glow" />
        <PixelSprite grid={FLAME_GRID} size={18} color="#ffb43d" className="letter-flame" />
        <div className="letter-candle-body" />
      </div>

      <motion.div
        className="letter-scroll"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="letter-rod" />
        <div className="letter-paper">
          <h1 className="pixel-heading small">
            <TypewriterText text="Letter" />
          </h1>
          <p className="pixel-body">a letter is being written...</p>
          <div className="letter-seal">
            <PixelHeart size={20} color="#ffe9e0" />
          </div>
          <button type="button" className="letter-back" onClick={onBack}>
            Back
          </button>
        </div>
        <div className="letter-rod" />
      </motion.div>
    </div>
  );
}
