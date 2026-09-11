import { useMemo } from 'react';
import { motion } from 'framer-motion';
import PixelSprite from './PixelSprite';
import { STAR_GRID } from '../pixelGrids';

const FIREFLY_COUNT = 9;
const COLORS = ['#ffe37b', '#c8ff9e', '#fff6d0'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Fireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: FIREFLY_COUNT }, (_, i) => ({
        id: i,
        left: randomBetween(4, 96),
        top: randomBetween(35, 85),
        size: randomBetween(6, 11),
        duration: randomBetween(4, 8),
        delay: randomBetween(0, 5),
        xDrift: randomBetween(-20, 20),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })),
    []
  );

  return (
    <div className="fireflies" aria-hidden="true">
      {flies.map((fly) => (
        <motion.div
          key={fly.id}
          className="firefly"
          style={{ left: `${fly.left}%`, top: `${fly.top}%`, '--glow': fly.color }}
          animate={{
            y: [0, -14, 0, 10, 0],
            x: [0, fly.xDrift, 0],
            opacity: [0.2, 1, 0.6, 1, 0.2],
          }}
          transition={{ duration: fly.duration, delay: fly.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PixelSprite grid={STAR_GRID} size={fly.size} color={fly.color} />
        </motion.div>
      ))}
    </div>
  );
}
