import { motion } from 'framer-motion';
import FloatingHearts from '../components/FloatingHearts';
import PixelHeart from '../components/PixelHeart';
import TypewriterText from '../components/TypewriterText';

export default function WaitScreen() {
  return (
    <div className="page">
      <div className="page-stars" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="page-star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 60}%`,
              '--d': `${2 + (i % 5)}s`,
              '--delay': `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <FloatingHearts />

      <motion.main
        className="pixel-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pixel-panel-badge">
          <PixelHeart size={30} color="var(--pink)" />
        </div>

        <h1 className="pixel-heading small">
          <TypewriterText text="Wait, mein schatz..." />
        </h1>

        <p className="pixel-body wait-body">It&apos;s not finished yet.</p>
        <p className="pixel-body wait-body">
          Love you <span aria-hidden="true">&hearts;</span>
        </p>
      </motion.main>
    </div>
  );
}
