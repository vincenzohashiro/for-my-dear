import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelSprite from '../../components/PixelSprite';
import PixelHeart from '../../components/PixelHeart';
import { ALIEN_GRID } from '../../pixelGrids';

const AREA_WIDTH = 280;
const AREA_HEIGHT = 340;
const SHIP_Y = AREA_HEIGHT - 26;
const SHIP_WIDTH = 24;
const SHIP_HEIGHT = 16;
const BULLET_SPEED = 5;
const BULLET_COOLDOWN = 320;
const ROWS = 3;
const COLS = 5;
const ALIEN_SIZE = 20;
const ALIEN_SPACING_X = 36;
const ALIEN_SPACING_Y = 30;
const GRID_LEFT = (AREA_WIDTH - COLS * ALIEN_SPACING_X) / 2;
const GRID_TOP = 24;
const STEP_DOWN = 16;
const BASE_SPEED = 0.5;

function makeAliens() {
  const aliens = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      aliens.push({ id: `${row}-${col}`, row, col });
    }
  }
  return aliens;
}

export default function PixelInvadersGame({ onBack }) {
  const [phase, setPhase] = useState('ready');
  const [shipX, setShipX] = useState(AREA_WIDTH / 2);
  const [bullets, setBullets] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [score, setScore] = useState(0);
  const groupRef = useRef({ x: 0, y: 0, direction: 1 });
  const shipXRef = useRef(shipX);
  const lastShotRef = useRef(0);
  const rafRef = useRef(null);

  shipXRef.current = shipX;

  const handleStart = () => {
    groupRef.current = { x: 0, y: 0, direction: 1 };
    setShipX(AREA_WIDTH / 2);
    setBullets([]);
    setAliens(makeAliens());
    setScore(0);
    setPhase('playing');
  };

  const moveShipTo = (clientX, areaEl) => {
    const rect = areaEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * AREA_WIDTH;
    setShipX(Math.max(SHIP_WIDTH / 2, Math.min(AREA_WIDTH - SHIP_WIDTH / 2, x)));
  };

  const fire = () => {
    if (phase === 'ready') {
      handleStart();
      return;
    }
    if (phase !== 'playing') return;
    const now = Date.now();
    if (now - lastShotRef.current < BULLET_COOLDOWN) return;
    lastShotRef.current = now;
    setBullets((prev) => [...prev, { id: Math.random(), x: shipXRef.current, y: SHIP_Y }]);
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const step = () => {
      const aliveCount = aliens.length;
      const speed = Math.min(BASE_SPEED + (ROWS * COLS - aliveCount) * 0.08, 2.4);
      const group = groupRef.current;
      const gridWidth = (COLS - 1) * ALIEN_SPACING_X + ALIEN_SIZE;

      group.x += group.direction * speed;
      if (group.x + GRID_LEFT + gridWidth > AREA_WIDTH && group.direction === 1) {
        group.direction = -1;
        group.y += STEP_DOWN;
      } else if (GRID_LEFT + group.x < 0 && group.direction === -1) {
        group.direction = 1;
        group.y += STEP_DOWN;
      }

      setBullets((prev) =>
        prev.map((b) => ({ ...b, y: b.y - BULLET_SPEED })).filter((b) => b.y > -10)
      );

      const bottomRow = GRID_TOP + group.y + (ROWS - 1) * ALIEN_SPACING_Y + ALIEN_SIZE;
      if (bottomRow >= SHIP_Y) {
        setPhase('over');
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, aliens.length]);

  // Reads current bullets/aliens from refs and dispatches plain, top-level
  // setState calls — nesting setAliens/setScore inside setBullets's updater
  // let React 18 Strict Mode's dev-only double-invocation double-count hits.
  const bulletsRef = useRef(bullets);
  const aliensRef = useRef(aliens);
  bulletsRef.current = bullets;
  aliensRef.current = aliens;

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const checkInterval = setInterval(() => {
      const group = groupRef.current;
      const currentAliens = aliensRef.current;
      const currentBullets = bulletsRef.current;
      if (currentBullets.length === 0 || currentAliens.length === 0) return;

      const hitAlienIds = new Set();
      const remainingBullets = [];
      let hits = 0;

      currentBullets.forEach((bullet) => {
        const hitAlien = currentAliens.find((a) => {
          if (hitAlienIds.has(a.id)) return false;
          const ax = GRID_LEFT + group.x + a.col * ALIEN_SPACING_X;
          const ay = GRID_TOP + group.y + a.row * ALIEN_SPACING_Y;
          return (
            bullet.x > ax - 6 &&
            bullet.x < ax + ALIEN_SIZE + 6 &&
            bullet.y > ay - 6 &&
            bullet.y < ay + ALIEN_SIZE + 6
          );
        });
        if (hitAlien) {
          hitAlienIds.add(hitAlien.id);
          hits += 1;
        } else {
          remainingBullets.push(bullet);
        }
      });

      if (hitAlienIds.size === 0) return;

      setBullets(remainingBullets);
      const nextAliens = currentAliens.filter((a) => !hitAlienIds.has(a.id));
      setAliens(nextAliens);
      setScore((s) => s + hits * 10);
      if (nextAliens.length === 0) setPhase('won');
    }, 40);

    return () => clearInterval(checkInterval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setShipX((x) => Math.max(SHIP_WIDTH / 2, x - 14));
      if (e.key === 'ArrowRight') setShipX((x) => Math.min(AREA_WIDTH - SHIP_WIDTH / 2, x + 14));
      if (e.code === 'Space') {
        e.preventDefault();
        fire();
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
        <span className="minigame-title">Pixel Invaders</span>
        <span className="minigame-score">Score: {score}</span>
      </div>

      <div
        className="invaders-area"
        onMouseMove={(e) => phase === 'playing' && moveShipTo(e.clientX, e.currentTarget)}
        onTouchMove={(e) => {
          if (phase !== 'playing') return;
          e.preventDefault();
          moveShipTo(e.touches[0].clientX, e.currentTarget);
        }}
        onClick={fire}
      >
        {aliens.map((a) => (
          <div
            key={a.id}
            className="invaders-alien"
            style={{
              left: GRID_LEFT + groupRef.current.x + a.col * ALIEN_SPACING_X,
              top: GRID_TOP + groupRef.current.y + a.row * ALIEN_SPACING_Y,
            }}
          >
            <PixelSprite grid={ALIEN_GRID} size={ALIEN_SIZE} color="var(--green)" />
          </div>
        ))}

        {bullets.map((b) => (
          <div key={b.id} className="invaders-bullet" style={{ left: b.x, top: b.y }} />
        ))}

        <div
          className="invaders-ship"
          style={{ left: shipX - SHIP_WIDTH / 2, top: SHIP_Y, width: SHIP_WIDTH, height: SHIP_HEIGHT }}
        >
          <PixelHeart size={SHIP_WIDTH} color="var(--pink)" />
        </div>

        {phase === 'ready' && <div className="flappy-hint">Move + tap to fire</div>}
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {(phase === 'ready' || phase === 'over' || phase === 'won') && (
        <div className="minigame-overlay">
          {phase === 'over' && (
            <>
              <span className="minigame-overlay-title">Invaded!</span>
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
