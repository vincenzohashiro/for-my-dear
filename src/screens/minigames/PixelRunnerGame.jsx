import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelSprite from '../../components/PixelSprite';
import PixelHeart from '../../components/PixelHeart';
import { CACTUS_GRID } from '../../pixelGrids';

const AREA_WIDTH = 300;
const AREA_HEIGHT = 170;
const GROUND_Y = AREA_HEIGHT - 24;
const RUNNER_X = 36;
const RUNNER_SIZE = 26;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -9.5;
const OBSTACLE_WIDTH = 16;
const OBSTACLE_HEIGHT = 26;
const BASE_SPEED = 2.6;
const MAX_SPEED = 5.5;

export default function PixelRunnerGame({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [runnerY, setRunnerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const runnerYRef = useRef(0);
  const [score, setScore] = useState(0);
  const velocityRef = useRef(0);
  const isJumpingRef = useRef(false);
  const rafRef = useRef(null);
  const nextSpawnRef = useRef(0);
  const distanceRef = useRef(0);
  const passedIdsRef = useRef(new Set());
  const obstaclesRef = useRef([]);
  obstaclesRef.current = obstacles;

  const resetGame = () => {
    velocityRef.current = 0;
    isJumpingRef.current = false;
    distanceRef.current = 0;
    passedIdsRef.current = new Set();
    nextSpawnRef.current = 60;
    runnerYRef.current = 0;
    setRunnerY(0);
    setObstacles([]);
    setScore(0);
  };

  const handleStart = () => {
    resetGame();
    setPhase('playing');
  };

  const jump = () => {
    if (phase === 'over') return;
    if (phase === 'ready') {
      resetGame();
      setPhase('playing');
      return;
    }
    if (!isJumpingRef.current) {
      velocityRef.current = JUMP_VELOCITY;
      isJumpingRef.current = true;
    }
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    // Every mutation (refs + the actual setState calls) happens directly in
    // this plain function body, never inside a setState updater — Strict
    // Mode's dev-only double-invocation of updaters was silently discarding
    // ref-mutating side effects (like the obstacle spawn timer) made inside
    // one, which is why obstacles never appeared.
    const step = () => {
      distanceRef.current += 1;
      const speed = Math.min(BASE_SPEED + distanceRef.current * 0.0025, MAX_SPEED);

      velocityRef.current += GRAVITY;
      const nextY = runnerYRef.current + velocityRef.current;
      if (nextY >= 0) {
        isJumpingRef.current = false;
        velocityRef.current = 0;
        runnerYRef.current = 0;
      } else {
        runnerYRef.current = nextY;
      }
      setRunnerY(runnerYRef.current);

      nextSpawnRef.current -= 1;
      let nextObstacles = obstaclesRef.current
        .map((o) => ({ ...o, x: o.x - speed }))
        .filter((o) => o.x > -OBSTACLE_WIDTH);
      if (nextSpawnRef.current <= 0) {
        nextObstacles = [...nextObstacles, { id: Math.random(), x: AREA_WIDTH }];
        nextSpawnRef.current = 70 + Math.random() * 50;
      }
      setObstacles(nextObstacles);

      setScore(Math.floor(distanceRef.current / 10));

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;

    const runnerTop = GROUND_Y - RUNNER_SIZE + runnerY;
    const runnerBottom = GROUND_Y + runnerY;
    const runnerLeft = RUNNER_X;
    const runnerRight = RUNNER_X + RUNNER_SIZE;

    obstacles.forEach((o) => {
      const obstacleLeft = o.x;
      const obstacleRight = o.x + OBSTACLE_WIDTH;
      const obstacleTop = GROUND_Y - OBSTACLE_HEIGHT;
      const overlapsX = runnerRight > obstacleLeft + 4 && runnerLeft < obstacleRight - 4;
      const overlapsY = runnerBottom > obstacleTop + 4;
      if (overlapsX && overlapsY) setPhase('over');

      if (!passedIdsRef.current.has(o.id) && o.x + OBSTACLE_WIDTH < RUNNER_X) {
        passedIdsRef.current.add(o.id);
      }
    });
  }, [obstacles, runnerY, phase]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
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
        <span className="minigame-title">Pixel Runner</span>
        <span className="minigame-score">Score: {score}</span>
      </div>

      <div className="runner-area" onClick={jump}>
        <div className="runner-ground" style={{ top: GROUND_Y }} />
        <div
          className="runner-character"
          style={{ left: RUNNER_X, top: GROUND_Y - RUNNER_SIZE + runnerY }}
        >
          <PixelHeart size={RUNNER_SIZE} color="var(--pink-dark)" />
        </div>
        {obstacles.map((o) => (
          <div
            key={o.id}
            className="runner-obstacle"
            style={{ left: o.x, top: GROUND_Y - OBSTACLE_HEIGHT }}
          >
            <PixelSprite grid={CACTUS_GRID} size={OBSTACLE_WIDTH} color="var(--green)" />
          </div>
        ))}
        {phase === 'ready' && <div className="flappy-hint">Tap / Space to jump</div>}
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
