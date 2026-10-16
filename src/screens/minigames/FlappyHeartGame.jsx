import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../../components/PixelHeart';

const AREA_WIDTH = 280;
const AREA_HEIGHT = 360;
const HEART_X = 50;
const HEART_SIZE = 22;
const GRAVITY = 0.32;
const FLAP_VELOCITY = -5.2;
const PIPE_WIDTH = 34;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;
const PIPE_SPACING = 190;

function makePipe(x) {
  const gapY = 40 + Math.random() * (AREA_HEIGHT - 80 - PIPE_GAP);
  return { id: Math.random(), x, gapY };
}

export default function FlappyHeartGame({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [heartY, setHeartY] = useState(AREA_HEIGHT / 2);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(null);
  const passedIdsRef = useRef(new Set());

  const resetGame = () => {
    velocityRef.current = 0;
    passedIdsRef.current = new Set();
    setHeartY(AREA_HEIGHT / 2);
    setPipes([makePipe(AREA_WIDTH + 40)]);
    setScore(0);
  };

  const handleStart = () => {
    resetGame();
    setPhase('playing');
  };

  const flap = () => {
    if (phase === 'over') return;
    if (phase === 'ready') {
      resetGame();
      setPhase('playing');
    }
    velocityRef.current = FLAP_VELOCITY;
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const step = () => {
      velocityRef.current += GRAVITY;
      setHeartY((prevY) => prevY + velocityRef.current);

      setPipes((prevPipes) => {
        const moved = prevPipes
          .map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
          .filter((p) => p.x > -PIPE_WIDTH);
        const last = moved[moved.length - 1];
        if (!last || last.x < AREA_WIDTH - PIPE_SPACING) {
          return [...moved, makePipe(AREA_WIDTH)];
        }
        return moved;
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;

    if (heartY < 0) {
      if (velocityRef.current < 0) velocityRef.current = 0;
      setHeartY(0);
      return;
    }

    if (heartY + HEART_SIZE > AREA_HEIGHT) {
      setPhase('over');
      return;
    }

    const heartLeft = HEART_X;
    const heartRight = HEART_X + HEART_SIZE;
    const heartTop = heartY;
    const heartBottom = heartY + HEART_SIZE;

    pipes.forEach((pipe) => {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;
      const overlapsX = heartRight > pipeLeft && heartLeft < pipeRight;
      if (overlapsX) {
        const hitsTop = heartTop < pipe.gapY;
        const hitsBottom = heartBottom > pipe.gapY + PIPE_GAP;
        if (hitsTop || hitsBottom) setPhase('over');
      }

      if (!passedIdsRef.current.has(pipe.id) && pipe.x + PIPE_WIDTH < HEART_X) {
        passedIdsRef.current.add(pipe.id);
        setScore((s) => s + 1);
      }
    });
  }, [heartY, pipes, phase]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Flappy Heart</span>
        <span className="minigame-score">Score: {score}</span>
      </div>

      <div className="flappy-area" onClick={flap}>
        <div className="flappy-heart" style={{ top: heartY, left: HEART_X }}>
          <PixelHeart size={HEART_SIZE} color="var(--pink)" />
        </div>
        {pipes.map((pipe) => (
          <div key={pipe.id}>
            <div
              className="flappy-pipe"
              style={{ left: pipe.x, top: 0, height: pipe.gapY, width: PIPE_WIDTH }}
            />
            <div
              className="flappy-pipe"
              style={{
                left: pipe.x,
                top: pipe.gapY + PIPE_GAP,
                height: AREA_HEIGHT - pipe.gapY - PIPE_GAP,
                width: PIPE_WIDTH,
              }}
            />
          </div>
        ))}
        {phase === 'ready' && <div className="flappy-hint">Tap / Space to flap</div>}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {phase === 'over' && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">Game Over</span>
          <span className="minigame-overlay-score">Score: {score}</span>
          <button type="button" className="minigame-restart" onClick={handleStart}>
            Play Again
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}
    </motion.div>
  );
}
