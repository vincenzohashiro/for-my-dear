import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ---- mascot ----

const BEE_COLORS = { k: '#2b2140', y: '#ffd93d', w: '#d6f1ff', p: '#ff8fb3', o: '#ff8c3a' };
const BEE_GRID = [
  '.....ww.ww....',
  '....wwwwwww...',
  '.....wwwww....',
  '..kkkkkkkkkk..',
  '.kyykyykyyyyk.',
  'okyykyykyykyyk',
  '.kyykyykyypyk.',
  '..kkkkkkkkkk..',
  '....k..k..k...',
];

export function PixelBee({ size = 56 }) {
  const cols = BEE_GRID[0].length;
  const rows = BEE_GRID.length;
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={(size / cols) * rows}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {BEE_GRID.flatMap((row, y) =>
        row
          .split('')
          .map((cell, x) =>
            BEE_COLORS[cell] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={BEE_COLORS[cell]} /> : null
          )
      )}
    </svg>
  );
}

const MOODS = {
  idle: { y: [0, -5, 0], rotate: [0, 3, 0], transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
  think: { rotate: [0, -12, -12, 0], transition: { duration: 1.2 } },
  happy: { y: [0, -26, 0, -12, 0], rotate: [0, 360], transition: { duration: 0.9 } },
  sad: { x: [0, -9, 9, -6, 6, 0], rotate: [0, -16, -16, 0], transition: { duration: 0.7 } },
};

// `moodKey` replays the reaction even when the same mood happens twice in a row.
export function BeeMascot({ mood = 'idle', moodKey = 0, line }) {
  return (
    <div className="bee-mascot">
      <motion.div key={`${mood}-${moodKey}`} className="bee-mascot-sprite" animate={MOODS[mood]}>
        <PixelBee />
      </motion.div>
      <AnimatePresence mode="wait">
        {line && (
          <motion.span
            key={`${line}-${moodKey}`}
            className={`bee-bubble bee-bubble-${mood}`}
            initial={{ opacity: 0, scale: 0.6, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {line}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- speaker ----

export function BeeSpeaker({ onSay, label }) {
  const [waves, setWaves] = useState(0);
  return (
    <motion.button
      type="button"
      className="bee-speaker"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        setWaves((n) => n + 1);
        onSay();
      }}
    >
      <span className="bee-speaker-icon" aria-hidden="true">
        &#128266;
        {waves > 0 &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={`${waves}-${i}`}
              className="bee-wave"
              initial={{ opacity: 0.8, scale: 0.4 }}
              animate={{ opacity: 0, scale: 1.8 }}
              transition={{ duration: 0.9, delay: i * 0.18 }}
            />
          ))}
      </span>
      {label}
    </motion.button>
  );
}

// ---- answer reveal ----

export function BeeAnswer({ word, good }) {
  return (
    <p className="bee-answer">
      {word.split('').map((letter, i) => (
        <motion.span
          key={i}
          className={`bee-hex ${good ? 'good' : 'reveal'}`}
          initial={{ rotateY: 90, y: 0 }}
          animate={{ rotateY: 0, y: good ? [0, -10, 0] : 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
        >
          <span>{letter}</span>
        </motion.span>
      ))}
    </p>
  );
}

// ---- tiles + keyboard ----

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const MAX_LETTERS = 18;

// Letters appear as honeycomb tiles; typing works from the on-screen keys or a
// real keyboard. `onSpell(guess)` returns true when the guess was right; on
// false the tiles shake and clear for another go.
export function BeeSpeller({ onSpell, disabled = false, busyLabel }) {
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flashKey, setFlashKey] = useState(null);
  const latest = useRef({});

  const type = (ch) => {
    if (disabled) return;
    setGuess((g) => (g.length < MAX_LETTERS ? g + ch : g));
    setFlashKey(ch);
  };
  const back = () => !disabled && setGuess((g) => g.slice(0, -1));
  const enter = () => {
    if (disabled || !guess) return;
    if (onSpell(guess) === false) {
      setWrong((n) => n + 1);
      setShaking(true);
      setTimeout(() => {
        setGuess('');
        setShaking(false);
      }, 380);
    }
  };

  useEffect(() => {
    latest.current = { type, back, enter };
  });

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-z]$/i.test(e.key)) latest.current.type(e.key.toLowerCase());
      else if (e.key === 'Backspace') latest.current.back();
      else if (e.key === 'Enter') latest.current.enter();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!flashKey) return undefined;
    const timer = setTimeout(() => setFlashKey(null), 140);
    return () => clearTimeout(timer);
  }, [flashKey, guess]);

  return (
    <div className="bee-speller">
      <motion.div
        key={wrong}
        className={`bee-tiles${shaking ? ' was-wrong' : ''}`}
        animate={wrong ? { x: [0, -12, 12, -7, 7, 0] } : undefined}
        transition={{ duration: 0.38 }}
        aria-live="polite"
        aria-label={guess ? `typed ${guess}` : 'nothing typed yet'}
      >
        {guess.split('').map((letter, i) => (
          <motion.span
            key={i}
            className="bee-hex"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          >
            <span>{letter}</span>
          </motion.span>
        ))}
        {!disabled && guess.length < MAX_LETTERS && (
          <span className="bee-hex empty">
            <span />
          </span>
        )}
        {!guess && <span className="bee-tiles-hint">{busyLabel || 'tap the letters'}</span>}
      </motion.div>

      <div className={`bee-keyboard${disabled ? ' disabled' : ''}`}>
        {KEY_ROWS.map((row, r) => (
          <div key={row} className="bee-key-row">
            {r === 2 && (
              <motion.button type="button" className="bee-key wide" whileTap={{ scale: 0.85 }} onClick={back} aria-label="delete">
                &#9003;
              </motion.button>
            )}
            {row.split('').map((ch) => (
              <motion.button
                key={ch}
                type="button"
                className={`bee-key${flashKey === ch ? ' flash' : ''}`}
                whileTap={{ scale: 0.82, y: 2 }}
                onClick={() => type(ch)}
                disabled={disabled}
              >
                {ch}
              </motion.button>
            ))}
            {r === 2 && (
              <motion.button
                type="button"
                className="bee-key wide enter"
                whileTap={{ scale: 0.85 }}
                onClick={enter}
                disabled={disabled || !guess}
              >
                spell
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
