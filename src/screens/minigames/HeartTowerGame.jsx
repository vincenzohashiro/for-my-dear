import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelHeart from '../../components/PixelHeart';
import { GameScoreboard } from '../../components/Scoreboard';
import { useRecordScore } from '../../lib/scoreboard';
import GameStage from '../../components/GameStage';
import GameHud from '../../components/GameHud';

const AREA_WIDTH = 280;
const AREA_HEIGHT = 360;
const ROW = 22;
const GROUND = 26;
const START_WIDTH = 120;
const BASE_SPEED = 1.7;
const SPEED_STEP = 0.11;
const MAX_SPEED = 6;
const PERFECT_PX = 4;
const COLORS = ['#ff6b9d', '#ffb3c8', '#ffd93d', '#8c5eff', '#4fc3f7', '#3fbf6f', '#ff8c3a'];

const colorFor = (floor) => COLORS[floor % COLORS.length];
const speedFor = (floors) => Math.min(MAX_SPEED, BASE_SPEED + floors * SPEED_STEP);

function freshTower() {
  return [{ x: (AREA_WIDTH - START_WIDTH) / 2, w: START_WIDTH, color: '#2b2140' }];
}

function nextMover(width, floors) {
  const fromLeft = floors % 2 === 0;
  return { x: fromLeft ? -width : AREA_WIDTH, w: width, dir: fromLeft ? 1 : -1 };
}

// Stack sliding blocks as high as you can. Whatever hangs over the edge is
// sliced off, so every sloppy drop makes the tower narrower; perfect drops
// keep the width (and three in a row grow it back a little).
export default function HeartTowerGame({ onBack }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [tower, setTower] = useState(freshTower);
  const [mover, setMover] = useState(() => nextMover(START_WIDTH, 0));
  const [chips, setChips] = useState([]);
  const [perfect, setPerfect] = useState({ key: 0, streak: 0, show: false });
  const moverRef = useRef(mover);
  const rafRef = useRef(null);

  const floors = tower.length - 1;

  useEffect(() => {
    moverRef.current = mover;
  });

  // Slide the current block back and forth.
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const speed = speedFor(floors);
    const step = () => {
      const m = moverRef.current;
      let x = m.x + m.dir * speed;
      let dir = m.dir;
      if (x + m.w > AREA_WIDTH + 30) dir = -1;
      if (x < -30) dir = 1;
      x = Math.max(-m.w, Math.min(AREA_WIDTH, x));
      const next = { ...m, x, dir };
      moverRef.current = next;
      setMover(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, floors]);

  const start = () => {
    setTower(freshTower());
    setMover(nextMover(START_WIDTH, 0));
    setChips([]);
    setPerfect({ key: 0, streak: 0, show: false });
    setPhase('playing');
  };

  const drop = () => {
    if (phase === 'ready') {
      start();
      return;
    }
    if (phase !== 'playing') return;
    const m = moverRef.current;
    const top = tower[tower.length - 1];
    const level = tower.length;
    const left = Math.max(m.x, top.x);
    const right = Math.min(m.x + m.w, top.x + top.w);
    const overlap = right - left;

    if (overlap <= 0) {
      setChips((c) => [...c.slice(-6), { id: Date.now(), x: m.x, w: m.w, level, color: colorFor(level) }]);
      setPhase('over');
      return;
    }

    let placed;
    let streak = perfect.streak;
    if (Math.abs(m.x - top.x) <= PERFECT_PX) {
      streak += 1;
      const grow = streak % 3 === 0 ? 10 : 0;
      const w = Math.min(START_WIDTH, top.w + grow);
      placed = { x: Math.max(0, Math.min(AREA_WIDTH - w, top.x - grow / 2)), w, color: colorFor(level) };
      setPerfect((p) => ({ key: p.key + 1, streak, show: true }));
    } else {
      streak = 0;
      placed = { x: left, w: overlap, color: colorFor(level) };
      const chip = m.x < top.x ? { x: m.x, w: top.x - m.x } : { x: right, w: m.x + m.w - right };
      setChips((c) => [...c.slice(-6), { id: Date.now(), ...chip, level, color: colorFor(level) }]);
      setPerfect((p) => ({ ...p, streak: 0, show: false }));
    }
    setTower((t) => [...t, placed]);
    setMover(nextMover(placed.w, level));
  };

  // Space or Enter drops too.
  const dropRef = useRef(drop);
  useEffect(() => {
    dropRef.current = drop;
  });
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' && e.key !== 'Enter') return;
      e.preventDefault();
      dropRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!perfect.show) return undefined;
    const timer = setTimeout(() => setPerfect((p) => ({ ...p, show: false })), 700);
    return () => clearTimeout(timer);
  }, [perfect.key, perfect.show]);

  const scoreSaved = useRecordScore('stack', phase === 'over', floors);

  // Keep the top of the tower in view as it grows.
  const camera = Math.max(0, (tower.length + 1) * ROW + GROUND - AREA_HEIGHT * 0.62);
  const yFor = (level) => AREA_HEIGHT - GROUND - (level + 1) * ROW + camera;

  return (
    <motion.div
      className="minigame-screen game-theme theme-stack"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Heart Tower</span>
        <span className="minigame-score">Floors: {floors}</span>
      </div>

      <GameHud game="stack" score={floors} done={phase === 'over'} />

      <GameStage>
        <div className="tower-area" onClick={drop}>
          <div className="tower-sun" aria-hidden="true" />
          <div className="tower-ground" style={{ top: AREA_HEIGHT - GROUND + camera }} />

          {tower.map((block, level) => (
            <div
              key={level}
              className={`tower-block${level === 0 ? ' base' : ''}`}
              style={{ left: block.x, top: yFor(level), width: block.w, height: ROW, '--block-color': block.color }}
            >
              {level > 0 && block.w > 26 && <PixelHeart size={10} color="rgba(255,255,255,0.75)" />}
            </div>
          ))}

          {phase === 'playing' && (
            <div
              className="tower-block moving"
              style={{
                left: mover.x,
                top: yFor(tower.length),
                width: mover.w,
                height: ROW,
                '--block-color': colorFor(tower.length),
              }}
            >
              {mover.w > 26 && <PixelHeart size={10} color="rgba(255,255,255,0.75)" />}
            </div>
          )}

          <AnimatePresence>
            {chips.map((chip) => (
              <motion.div
                key={chip.id}
                className="tower-block chip"
                style={{ left: chip.x, top: yFor(chip.level), width: chip.w, height: ROW, '--block-color': chip.color }}
                initial={{ y: 0, rotate: 0, opacity: 1 }}
                animate={{ y: 260, rotate: chip.x < AREA_WIDTH / 2 ? -40 : 40, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeIn' }}
              />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {perfect.show && (
              <motion.span
                key={perfect.key}
                className="tower-perfect"
                style={{ top: yFor(tower.length - 1) - 34 }}
                initial={{ opacity: 0, scale: 0.5, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                PERFECT!{perfect.streak > 1 ? ` x${perfect.streak}` : ''}
              </motion.span>
            )}
          </AnimatePresence>

          {phase === 'ready' && <div className="tower-hint">Tap / Space to drop</div>}
        </div>
      </GameStage>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {phase === 'over' && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">Timber!</span>
          <span className="minigame-overlay-score">
            {floors} floor{floors === 1 ? '' : 's'} tall
          </span>
          <GameScoreboard game="stack" refreshKey={scoreSaved} />
          <button type="button" className="minigame-restart" onClick={start}>
            Build Again
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}
    </motion.div>
  );
}
