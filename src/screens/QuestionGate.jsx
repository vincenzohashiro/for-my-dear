import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TypewriterText from '../components/TypewriterText';

const VALID_ANSWERS = ['love'];
const CONFETTI_COLORS = ['#ff6b9d', '#ffd93d', '#4cd97b', '#4fc3f7', '#ffffff'];

export default function QuestionGate({ onSuccess }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = answer.trim().toLowerCase();

    if (VALID_ANSWERS.includes(normalized)) {
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
    setAnswer(event.target.value);
    if (error) setError(false);
  };

  return (
    <div key={shakeKey} className={error ? 'pixel-shake' : ''}>
      <h1 className="pixel-heading small">
        <TypewriterText text="What is Dr Hakim's book of ____?" />
      </h1>

      <form onSubmit={handleSubmit} autoComplete="off">
        <label htmlFor="answer-input" className="pixel-label">
          Fill in the blank
        </label>
        <input
          ref={inputRef}
          id="answer-input"
          type="text"
          placeholder="your answer..."
          value={answer}
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
            not quite. try again!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
