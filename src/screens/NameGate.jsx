import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TypewriterText from '../components/TypewriterText';

const VALID_NAMES = ['charmy', 'charmy07', 'charmya07', 'charmelita', 'charm'];
const CONFETTI_COLORS = ['#ff6b9d', '#ffd93d', '#4cd97b', '#4fc3f7', '#ffffff'];

export default function NameGate({ onSuccess }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = name.trim().toLowerCase();

    if (VALID_NAMES.includes(normalized)) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: CONFETTI_COLORS,
        shapes: ['square'],
        scalar: 1.4,
        gravity: 0.9,
        ticks: 200,
      });
      onSuccess();
    } else {
      setError(true);
      setShakeKey((key) => key + 1);
      inputRef.current?.focus();
    }
  };

  const handleChange = (event) => {
    setName(event.target.value);
    if (error) setError(false);
  };

  return (
    <div key={shakeKey} className={error ? 'pixel-shake' : ''}>
      <h1 className="pixel-heading">
        <TypewriterText text="Are you my dear?" />
      </h1>

      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="name-input" className="pixel-label">
          Enter your name
        </label>
        <input
          ref={inputRef}
          id="name-input"
          type="text"
          placeholder="your name..."
          value={name}
          onChange={handleChange}
          className="pixel-input"
          required
        />
        <button type="submit" className="pixel-button">
          Enter
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            className="pixel-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            that doesn't sound like my dear. try again!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
