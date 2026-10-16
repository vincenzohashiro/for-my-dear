import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../../components/PixelHeart';

const GRID = 12;
const TICK_MS = 160;

function randomCell(exclude) {
  let cell;
  do {
    cell = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (exclude.some((c) => c.x === cell.x && c.y === cell.y));
  return cell;
}

function startState() {
  const snake = [
    { x: 5, y: 6 },
    { x: 4, y: 6 },
    { x: 3, y: 6 },
  ];
  return { snake, direction: { x: 1, y: 0 }, food: randomCell(snake) };
}

export default function SnakeGame({ onBack }) {
  const [state, setState] = useState(startState);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const directionRef = useRef(state.direction);
  const pendingDirectionsRef = useRef([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleRestart = () => {
    const fresh = startState();
    setState(fresh);
    directionRef.current = fresh.direction;
    pendingDirectionsRef.current = [];
    setScore(0);
    setOver(false);
  };

  const queueDirection = (dx, dy) => {
    const queue = pendingDirectionsRef.current;
    const last = queue[queue.length - 1] || directionRef.current;
    if (last.x === -dx && last.y === -dy) return;
    if (last.x === dx && last.y === dy) return;
    if (queue.length < 2) queue.push({ x: dx, y: dy });
  };

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      if (map[e.key]) {
        e.preventDefault();
        queueDirection(...map[e.key]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (over) return undefined;

    // Reads current state from a ref and dispatches setState/setScore/setOver
    // as plain top-level calls — nesting them inside setState's updater let
    // Strict Mode's dev-only double-invocation double-count food eaten.
    const tick = setInterval(() => {
      if (pendingDirectionsRef.current.length > 0) {
        directionRef.current = pendingDirectionsRef.current.shift();
      }
      const direction = directionRef.current;
      const prev = stateRef.current;

      const head = prev.snake[0];
      const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

      if (
        nextHead.x < 0 ||
        nextHead.x >= GRID ||
        nextHead.y < 0 ||
        nextHead.y >= GRID ||
        prev.snake.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y)
      ) {
        setOver(true);
        return;
      }

      const ateFood = nextHead.x === prev.food.x && nextHead.y === prev.food.y;
      const nextSnake = [nextHead, ...prev.snake];
      if (!ateFood) nextSnake.pop();

      if (ateFood) {
        setScore((s) => s + 1);
        setState({ ...prev, snake: nextSnake, direction, food: randomCell(nextSnake) });
      } else {
        setState({ ...prev, snake: nextSnake, direction });
      }
    }, TICK_MS);

    return () => clearInterval(tick);
  }, [over]);

  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) queueDirection(dx > 0 ? 1 : -1, 0);
    else queueDirection(0, dy > 0 ? 1 : -1);
  };

  const cells = new Set(state.snake.map((c) => `${c.x},${c.y}`));
  const headKey = `${state.snake[0].x},${state.snake[0].y}`;

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Snake</span>
        <span className="minigame-score">Score: {score}</span>
      </div>

      <div
        className="snake-grid"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID;
          const y = Math.floor(i / GRID);
          const key = `${x},${y}`;
          const isFood = state.food.x === x && state.food.y === y;
          const isSnake = cells.has(key);
          const isHead = headKey === key;
          return (
            <div
              key={key}
              className={`snake-cell${isSnake ? ' snake-body' : ''}${isHead ? ' snake-head' : ''}`}
            >
              {isFood && <PixelHeart size={12} color="var(--pink)" />}
            </div>
          );
        })}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {over && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">Game Over</span>
          <span className="minigame-overlay-score">Score: {score}</span>
          <button type="button" className="minigame-restart" onClick={handleRestart}>
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
