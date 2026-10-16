import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../../components/PixelHeart';

const HOLE_COUNT = 9;
const ROUND_SECONDS = 20;

export default function WhackAHeartGame({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [activeHole, setActiveHole] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const spawnTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const spawn = () => {
      setActiveHole(Math.floor(Math.random() * HOLE_COUNT));
      const visibleFor = 500 + Math.random() * 400;
      hideTimeoutRef.current = setTimeout(() => {
        setActiveHole(null);
        spawnTimeoutRef.current = setTimeout(spawn, 250 + Math.random() * 350);
      }, visibleFor);
    };

    spawnTimeoutRef.current = setTimeout(spawn, 400);

    return () => {
      clearTimeout(spawnTimeoutRef.current);
      clearTimeout(hideTimeoutRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (timeLeft <= 0) {
      setPhase('over');
      setActiveHole(null);
      return undefined;
    }
    const tick = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(tick);
  }, [phase, timeLeft]);

  const handleStart = () => {
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setActiveHole(null);
    setPhase('playing');
  };

  const handleWhack = (index) => {
    if (phase !== 'playing' || index !== activeHole) return;
    setScore((s) => s + 1);
    setActiveHole(null);
    clearTimeout(hideTimeoutRef.current);
    spawnTimeoutRef.current = setTimeout(() => {
      setActiveHole(Math.floor(Math.random() * HOLE_COUNT));
    }, 200 + Math.random() * 300);
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Whack-a-Heart</span>
        <span className="minigame-score">
          {phase === 'playing' ? `${timeLeft}s · ` : ''}Score: {score}
        </span>
      </div>

      <div className="whack-grid">
        {Array.from({ length: HOLE_COUNT }).map((_, index) => (
          <button
            key={index}
            type="button"
            className="whack-hole"
            onClick={() => handleWhack(index)}
          >
            {activeHole === index && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="whack-heart"
              >
                <PixelHeart size={26} color="var(--pink)" />
              </motion.span>
            )}
          </button>
        ))}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {phase !== 'playing' && (
        <div className="minigame-overlay">
          {phase === 'over' && (
            <>
              <span className="minigame-overlay-title">Time's up!</span>
              <span className="minigame-overlay-score">Score: {score}</span>
            </>
          )}
          <button type="button" className="minigame-restart" onClick={handleStart}>
            {phase === 'over' ? 'Play Again' : 'Start'}
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}
    </motion.div>
  );
}
