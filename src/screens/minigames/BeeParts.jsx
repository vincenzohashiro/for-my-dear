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

// Your spelling next to the real one: red letters were extra or wrong,
// highlighted ones in the answer are the letters you missed.
export function BeeCompare({ compare }) {
  return (
    <div className="bee-compare">
      <span className="bee-compare-label">you spelled</span>
      <p className="bee-answer small">
        {compare.guess.map((c, i) => (
          <span key={i} className={`bee-hex ${c.ok ? 'reveal' : 'bad'}`}>
            <span>{c.letter}</span>
          </span>
        ))}
      </p>
      <span className="bee-compare-label">correct spelling</span>
      <p className="bee-answer small">
        {compare.word.map((c, i) => (
          <span key={i} className={`bee-hex ${c.ok ? 'reveal' : 'missed'}`}>
            <span>{c.letter}</span>
          </span>
        ))}
      </p>
    </div>
  );
}

// ---- countdown ----

// A draining honey bar. `onExpire` fires once when time runs out; changing
// `resetKey` starts a fresh countdown, and `running={false}` freezes it.
export function BeeTimer({ seconds, running, resetKey, onExpire }) {
  const [left, setLeft] = useState(seconds);
  const expireRef = useRef(onExpire);
  const leftRef = useRef(left);
  useEffect(() => {
    expireRef.current = onExpire;
    leftRef.current = left;
  });

  useEffect(() => {
    leftRef.current = seconds;
    setLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return undefined;
    // Pausing and resuming picks up from whatever time was left.
    const end = Date.now() + leftRef.current * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, (end - Date.now()) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        expireRef.current?.();
      }
    }, 100);
    return () => clearInterval(timer);
  }, [running, resetKey]);

  const pct = Math.max(0, Math.min(100, (left / seconds) * 100));
  const low = left <= 5;
  return (
    <div className={`bee-timer${low ? ' low' : ''}`} role="timer" aria-label={`${Math.ceil(left)} seconds left`}>
      <div className="bee-timer-track">
        <div className="bee-timer-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bee-timer-num">{Math.ceil(left)}s</span>
    </div>
  );
}

// ---- tiles + keyboard ----

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const MAX_LETTERS = 18;

// Letters appear as honeycomb tiles; typing works from the on-screen keys or a
// real keyboard. `onSpell(guess)` returns true when the guess was right; on
// false the tiles shake and clear for another go.
// `length` lays out one empty hexagon per letter of the word; `maxLength` caps
// typing (a little longer when an alternate spelling is accepted).
export function BeeSpeller({ onSpell, onChange, length, maxLength = length, disabled = false, busyLabel }) {
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [flashKey, setFlashKey] = useState(null);
  const latest = useRef({});

  const type = (ch) => {
    if (disabled) return;
    setGuess((g) => (g.length < (maxLength || MAX_LETTERS) ? g + ch : g));
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

  // Lets the live race show the other player how far along you are.
  useEffect(() => {
    onChange?.(guess);
  }, [guess, onChange]);

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

  const slots = Math.max(length || 0, guess.length);

  return (
    <div className="bee-speller">
      <motion.div
        key={wrong}
        className={`bee-tiles${shaking ? ' was-wrong' : ''}`}
        animate={wrong ? { x: [0, -12, 12, -7, 7, 0] } : undefined}
        transition={{ duration: 0.38 }}
        style={{ '--count': slots }}
        aria-live="polite"
        aria-label={guess ? `typed ${guess}, ${length} letters` : `${length} letters, nothing typed yet`}
      >
        {Array.from({ length: slots }, (_, i) => {
          const letter = guess[i];
          return letter ? (
            <motion.span
              key={`l${i}`}
              className="bee-hex"
              initial={{ scale: 0.4, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <span>{letter}</span>
            </motion.span>
          ) : (
            <span key={`e${i}`} className={`bee-hex empty${i === guess.length && !disabled ? ' cursor' : ''}`}>
              <span />
            </span>
          );
        })}
      </motion.div>
      <p className="bee-tiles-hint">{busyLabel || (guess ? 'press spell when ready' : 'tap the letters or type')}</p>

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
