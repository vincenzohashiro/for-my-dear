import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const PADS = [
  { id: 0, color: 'var(--pink)' },
  { id: 1, color: 'var(--blue)' },
  { id: 2, color: 'var(--yellow)' },
  { id: 3, color: 'var(--purple)' },
];

export default function ColorMemoryGame({ onBack }) {
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | showing | input | over
  const [activePad, setActivePad] = useState(null);
  const [inputIndex, setInputIndex] = useState(0);
  const timeoutsRef = useRef([]);

  const clearTimers = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const playSequence = (seq) => {
    clearTimers();
    setPhase('showing');
    setActivePad(null);
    seq.forEach((padId, i) => {
      const onAt = i * 650 + 300;
      const offAt = onAt + 400;
      timeoutsRef.current.push(setTimeout(() => setActivePad(padId), onAt));
      timeoutsRef.current.push(setTimeout(() => setActivePad(null), offAt));
    });
    timeoutsRef.current.push(
      setTimeout(() => {
        setPhase('input');
        setInputIndex(0);
      }, seq.length * 650 + 300)
    );
  };

  const handleStart = () => {
    const first = [Math.floor(Math.random() * PADS.length)];
    setSequence(first);
    playSequence(first);
  };

  const handlePadClick = (padId) => {
    if (phase !== 'input') return;
    if (padId === sequence[inputIndex]) {
      setActivePad(padId);
      setTimeout(() => setActivePad(null), 200);
      if (inputIndex + 1 === sequence.length) {
        const next = [...sequence, Math.floor(Math.random() * PADS.length)];
        setTimeout(() => {
          setSequence(next);
          playSequence(next);
        }, 500);
      } else {
        setInputIndex((i) => i + 1);
      }
    } else {
      clearTimers();
      setPhase('over');
      setActivePad(null);
    }
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Color Memory</span>
        <span className="minigame-score">Round: {Math.max(sequence.length - 1, 0)}</span>
      </div>

      <div className="memory-pad-grid">
        {PADS.map((pad) => (
          <button
            key={pad.id}
            type="button"
            className={`memory-pad${activePad === pad.id ? ' active' : ''}`}
            style={{ '--pad-color': pad.color }}
            onClick={() => handlePadClick(pad.id)}
            disabled={phase !== 'input'}
          />
        ))}
      </div>

      <p className="pixel-body memory-pad-hint">
        {phase === 'idle' && 'Watch, then repeat the pattern'}
        {phase === 'showing' && 'Watch closely...'}
        {phase === 'input' && 'Your turn!'}
      </p>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {phase === 'idle' && (
        <div className="minigame-overlay">
          <button type="button" className="minigame-restart" onClick={handleStart}>
            Start
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}

      {phase === 'over' && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">Oops!</span>
          <span className="minigame-overlay-score">Reached round {sequence.length - 1}</span>
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
