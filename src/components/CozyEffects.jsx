import { useMemo } from 'react';
import { motion } from 'framer-motion';
import PixelSprite from './PixelSprite';
import { STAR_GRID } from '../pixelGrids';

const PETAL_COUNT = 8;
const PETAL_COLORS = ['#ffb3c6', '#ffe3ec', '#ff8fab'];
const SPARKLE_COUNT = 10;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function CozyEffects() {
  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        size: randomBetween(6, 10),
        duration: randomBetween(9, 16),
        delay: randomBetween(0, 10),
        xDrift: randomBetween(-30, 30),
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      })),
    []
  );

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
        id: i,
        left: randomBetween(5, 95),
        top: randomBetween(75, 84),
        delay: randomBetween(0, 4),
        duration: randomBetween(1.6, 3),
      })),
    []
  );

  return (
    <div className="cozy-effects" aria-hidden="true">
      {petals.map((petal) => (
        <motion.div
          key={`petal-${petal.id}`}
          className="cozy-petal"
          style={{ left: `${petal.left}%` }}
          initial={{ y: '-10vh', opacity: 0 }}
          animate={{ y: '110vh', x: [0, petal.xDrift, 0], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <PixelSprite grid={STAR_GRID} size={petal.size} color={petal.color} />
        </motion.div>
      ))}

      {sparkles.map((sparkle) => (
        <span
          key={`sparkle-${sparkle.id}`}
          className="cozy-water-sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        />
      ))}

      <div className="cozy-shooting-star" />
    </div>
  );
}
