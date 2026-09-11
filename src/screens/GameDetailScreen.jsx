import { motion } from 'framer-motion';

export default function GameDetailScreen({ game, onBack }) {
  return (
    <motion.div
      className="arcade-detail"
      style={{ '--tile-color': game.color }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="arcade-detail-title">{game.title}</h2>
      <p className="arcade-detail-tagline">{game.tagline}</p>
      <p className="arcade-blink">memories loading...</p>
      <p className="pixel-body">our game night stories go here soon</p>
      <button type="button" className="arcade-exit" onClick={onBack}>
        Back
      </button>
    </motion.div>
  );
}
