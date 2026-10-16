import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../../components/PixelHeart';

const AREA_WIDTH = 280;
const AREA_HEIGHT = 340;
const BASKET_WIDTH = 60;
const BASKET_Y = AREA_HEIGHT - 28;
const HEART_SIZE = 18;
const ROUND_SECONDS = 25;
const TICK_MS = 30;
const FALL_SPEED = 2.4;

export default function CatchHeartsGame({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [basketX, setBasketX] = useState(AREA_WIDTH / 2);
  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const spawnTimerRef = useRef(null);
  const basketXRef = useRef(basketX);
  const heartsRef = useRef(hearts);

  basketXRef.current = basketX;
  heartsRef.current = hearts;

  const moveBasketTo = (clientX, areaEl) => {
    const rect = areaEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * AREA_WIDTH;
    setBasketX(Math.max(BASKET_WIDTH / 2, Math.min(AREA_WIDTH - BASKET_WIDTH / 2, x)));
  };

  const handleStart = () => {
    setHearts([]);
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setBasketX(AREA_WIDTH / 2);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const spawn = () => {
      setHearts((prev) => [
        ...prev,
        { id: Math.random(), x: 20 + Math.random() * (AREA_WIDTH - 40), y: -HEART_SIZE },
      ]);
      spawnTimerRef.current = setTimeout(spawn, 500 + Math.random() * 500);
    };
    spawnTimerRef.current = setTimeout(spawn, 400);
    return () => clearTimeout(spawnTimerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    // Reads the current hearts from a ref and dispatches setHearts/setScore
    // as plain top-level calls — nesting setScore inside setHearts's updater
    // let Strict Mode's dev-only double-invocation double-count catches.
    const tick = setInterval(() => {
      const prev = heartsRef.current;
      const next = [];
      let caught = 0;
      prev.forEach((heart) => {
        const newY = heart.y + FALL_SPEED;
        const inCatchZone = newY + HEART_SIZE >= BASKET_Y && newY <= BASKET_Y + 14;
        const withinBasketX = Math.abs(heart.x - basketXRef.current) < BASKET_WIDTH / 2;
        if (inCatchZone && withinBasketX) {
          caught += 1;
          return;
        }
        if (newY > AREA_HEIGHT) return;
        next.push({ ...heart, y: newY });
      });
      setHearts(next);
      if (caught > 0) setScore((s) => s + caught);
    }, TICK_MS);

    return () => clearInterval(tick);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    if (timeLeft <= 0) {
      setPhase('over');
      return undefined;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setBasketX((x) => Math.max(BASKET_WIDTH / 2, x - 18));
      if (e.key === 'ArrowRight') setBasketX((x) => Math.min(AREA_WIDTH - BASKET_WIDTH / 2, x + 18));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase]);

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Catch the Hearts</span>
        <span className="minigame-score">
          {phase === 'playing' ? `${timeLeft}s · ` : ''}Score: {score}
        </span>
      </div>

      <div
        className="catch-area"
        onMouseMove={(e) => phase === 'playing' && moveBasketTo(e.clientX, e.currentTarget)}
        onTouchMove={(e) => {
          if (phase !== 'playing') return;
          e.preventDefault();
          moveBasketTo(e.touches[0].clientX, e.currentTarget);
        }}
      >
        {hearts.map((heart) => (
          <span key={heart.id} className="catch-heart" style={{ left: heart.x, top: heart.y }}>
            <PixelHeart size={HEART_SIZE} color="var(--pink)" />
          </span>
        ))}
        <div className="catch-basket" style={{ left: basketX - BASKET_WIDTH / 2, top: BASKET_Y }} />
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
