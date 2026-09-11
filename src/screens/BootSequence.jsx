import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LINES = ['initializing...', 'loading cartridge...', 'ready'];

export default function BootSequence({ game, onComplete }) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= LINES.length) {
      const timeout = setTimeout(onComplete, 500);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setLineIndex((i) => i + 1), 450);
    return () => clearTimeout(timeout);
  }, [lineIndex, onComplete]);

  return (
    <motion.div
      className="boot-screen"
      style={{ '--tile-color': game.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="boot-lines">
        {LINES.slice(0, lineIndex).map((line, i) => (
          <p key={i} className="boot-line">
            {line}
          </p>
        ))}
      </div>

      <p className="boot-title">{game.title}</p>

      <div className="boot-bar">
        <div className="boot-bar-fill" />
      </div>

      <p className="boot-blink">please wait</p>
    </motion.div>
  );
}
