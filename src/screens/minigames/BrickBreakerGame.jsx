import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AREA_WIDTH = 280;
const AREA_HEIGHT = 320;
const PADDLE_WIDTH = 56;
const PADDLE_HEIGHT = 10;
const PADDLE_Y = AREA_HEIGHT - 18;
const BALL_RADIUS = 5;
const ROWS = 4;
const COLS = 6;
const BRICK_WIDTH = 40;
const BRICK_HEIGHT = 14;
const BRICK_GAP = 4;
const BRICK_TOP = 28;
const ROW_COLORS = ['var(--red)', 'var(--yellow)', 'var(--green)', 'var(--blue)'];
const START_LIVES = 3;

function makeBricks() {
  const bricks = [];
  const totalWidth = COLS * BRICK_WIDTH + (COLS - 1) * BRICK_GAP;
  const startX = (AREA_WIDTH - totalWidth) / 2;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      bricks.push({
        id: `${row}-${col}`,
        x: startX + col * (BRICK_WIDTH + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP),
        color: ROW_COLORS[row % ROW_COLORS.length],
      });
    }
  }
  return bricks;
}

export default function BrickBreakerGame({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | over | won
  const [paddleX, setPaddleX] = useState(AREA_WIDTH / 2);
  const [ball, setBall] = useState({ x: AREA_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS, vx: 0, vy: 0 });
  const [bricks, setBricks] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [launched, setLaunched] = useState(false);
  const rafRef = useRef(null);
  const paddleXRef = useRef(paddleX);
  paddleXRef.current = paddleX;

  const resetBall = (px) => ({ x: px, y: PADDLE_Y - BALL_RADIUS - 1, vx: 0, vy: 0 });

  const handleStart = () => {
    const px = AREA_WIDTH / 2;
    setPaddleX(px);
    setBall(resetBall(px));
    setBricks(makeBricks());
    setScore(0);
    setLives(START_LIVES);
    setLaunched(false);
    setPhase('playing');
  };

  const launch = () => {
    if (phase === 'ready') {
      handleStart();
      return;
    }
    if (phase !== 'playing' || launched) return;
    setLaunched(true);
    setBall((b) => ({ ...b, vx: 2.1 * (Math.random() < 0.5 ? -1 : 1), vy: -3.4 }));
  };

  const movePaddleTo = (clientX, areaEl) => {
    const rect = areaEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * AREA_WIDTH;
    const clamped = Math.max(PADDLE_WIDTH / 2, Math.min(AREA_WIDTH - PADDLE_WIDTH / 2, x));
    setPaddleX(clamped);
    if (!launched) setBall((b) => ({ ...b, x: clamped }));
  };

  // Pure physics only: position + wall/paddle bounce. No brick, score, or
  // life side effects here — nesting those inside this updater caused React
  // 18 Strict Mode's dev-only double-invocation to double-count hits.
  useEffect(() => {
    if (phase !== 'playing' || !launched) return undefined;

    const step = () => {
      setBall((prev) => {
        let { x, y, vx, vy } = prev;
        x += vx;
        y += vy;

        if (x - BALL_RADIUS < 0) {
          x = BALL_RADIUS;
          vx = Math.abs(vx);
        } else if (x + BALL_RADIUS > AREA_WIDTH) {
          x = AREA_WIDTH - BALL_RADIUS;
          vx = -Math.abs(vx);
        }
        if (y - BALL_RADIUS < 0) {
          y = BALL_RADIUS;
          vy = Math.abs(vy);
        }

        const paddleLeft = paddleXRef.current - PADDLE_WIDTH / 2;
        const paddleRight = paddleXRef.current + PADDLE_WIDTH / 2;
        if (
          vy > 0 &&
          y + BALL_RADIUS >= PADDLE_Y &&
          y + BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT + 6 &&
          x >= paddleLeft - BALL_RADIUS &&
          x <= paddleRight + BALL_RADIUS
        ) {
          const hitOffset = (x - paddleXRef.current) / (PADDLE_WIDTH / 2);
          vx = hitOffset * 3.2;
          vy = -Math.abs(vy);
          y = PADDLE_Y - BALL_RADIUS;
        }

        return { x, y, vx, vy };
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, launched]);

  // Brick/life/score bookkeeping lives in its own effect, driven by the ball
  // position committed above — same pattern as the Flappy games' collision
  // checks, which keeps every state update a plain top-level call.
  useEffect(() => {
    if (phase !== 'playing' || !launched) return;

    const hitIndex = bricks.findIndex(
      (brick) =>
        ball.x + BALL_RADIUS > brick.x &&
        ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
        ball.y + BALL_RADIUS > brick.y &&
        ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
    );
    if (hitIndex !== -1) {
      setBall((b) => ({ ...b, vy: -b.vy }));
      setScore((s) => s + 10);
      const next = bricks.filter((_, i) => i !== hitIndex);
      setBricks(next);
      if (next.length === 0) setPhase('won');
      return;
    }

    if (ball.y - BALL_RADIUS > AREA_HEIGHT) {
      const remaining = lives - 1;
      setLives(remaining);
      if (remaining <= 0) {
        setPhase('over');
      } else {
        setLaunched(false);
        setBall(resetBall(paddleXRef.current));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ball, phase, launched]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setPaddleX((x) => Math.max(PADDLE_WIDTH / 2, x - 18));
      if (e.key === 'ArrowRight') setPaddleX((x) => Math.min(AREA_WIDTH - PADDLE_WIDTH / 2, x + 18));
      if (e.code === 'Space') {
        e.preventDefault();
        launch();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, launched]);

  useEffect(() => {
    if (!launched) setBall((b) => ({ ...b, x: paddleX }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paddleX]);

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Brick Breaker</span>
        <span className="minigame-score">
          {'♥'.repeat(Math.max(lives, 0))} &middot; {score}
        </span>
      </div>

      <div
        className="breaker-area"
        onMouseMove={(e) => phase === 'playing' && movePaddleTo(e.clientX, e.currentTarget)}
        onTouchMove={(e) => {
          if (phase !== 'playing') return;
          e.preventDefault();
          movePaddleTo(e.touches[0].clientX, e.currentTarget);
        }}
        onClick={launch}
      >
        {bricks.map((brick) => (
          <div
            key={brick.id}
            className="breaker-brick"
            style={{ left: brick.x, top: brick.y, width: BRICK_WIDTH, height: BRICK_HEIGHT, background: brick.color }}
          />
        ))}
        <div
          className="breaker-paddle"
          style={{ left: paddleX - PADDLE_WIDTH / 2, top: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT }}
        />
        <div
          className="breaker-ball"
          style={{ left: ball.x - BALL_RADIUS, top: ball.y - BALL_RADIUS, width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 }}
        />
        {phase === 'playing' && !launched && <div className="flappy-hint">Tap to launch</div>}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {(phase === 'ready' || phase === 'over' || phase === 'won') && (
        <div className="minigame-overlay">
          {phase === 'over' && (
            <>
              <span className="minigame-overlay-title">Game Over</span>
              <span className="minigame-overlay-score">Score: {score}</span>
            </>
          )}
          {phase === 'won' && (
            <>
              <span className="minigame-overlay-title">Cleared!</span>
              <span className="minigame-overlay-score">Score: {score}</span>
            </>
          )}
          <button type="button" className="minigame-restart" onClick={handleStart}>
            {phase === 'ready' ? 'Start' : 'Play Again'}
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}
    </motion.div>
  );
}
