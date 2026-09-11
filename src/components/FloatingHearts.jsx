import { useMemo } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from './PixelHeart';

const HEART_COUNT = 14;
const PIXEL_COLORS = ['#ff6b9d', '#ffd93d', '#ff9edb', '#ffffff'];
const SIZES = [14, 21, 28, 35];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: HEART_COUNT }, (_, i) => ({
        id: i,
        left: randomBetween(0, 100),
        size: SIZES[Math.floor(Math.random() * SIZES.length)],
        duration: randomBetween(10, 18),
        delay: randomBetween(0, 10),
        color: PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)],
      })),
    []
  );

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="floating-heart"
          style={{ left: `${heart.left}%` }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <PixelHeart size={heart.size} color={heart.color} />
        </motion.div>
      ))}
    </div>
  );
}
