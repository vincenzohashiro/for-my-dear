import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import { CAMERA_GRID } from '../pixelGrids';
import PhotoLightbox from '../components/PhotoLightbox';
import { getMedia } from '../content/photoGames';
import { useWhatsNew } from '../lib/whatsNew';

export default function GameDetailScreen({ game, onBack }) {
  const media = getMedia(game.id);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { markSeen } = useWhatsNew();

  // Opening a game's gallery counts as seeing all of its photos.
  useEffect(() => {
    markSeen(getMedia(game.id).map((m) => `photo:${m.path}`));
  }, [game.id, markSeen]);

  return (
    <motion.div
      className="photo-booth"
      style={{ '--tile-color': game.color }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="arcade-detail-title">{game.title}</h2>
      <p className="arcade-detail-tagline">{game.tagline}</p>

      <div className="photo-board">
        {media.length === 0 ? (
          <div className="photo-empty">
            <PixelSprite grid={CAMERA_GRID} size={40} color="var(--tile-color)" />
            <p>no memories added yet</p>
          </div>
        ) : (
          <div className="photo-gallery">
            {media.map((item, i) => (
              <motion.button
                key={item.url}
                type="button"
                className="photo-thumb"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setLightboxIndex(i)}
              >
                {item.kind === 'video' ? (
                  <>
                    <video src={item.url} muted preload="metadata" />
                    <span className="photo-thumb-play" aria-hidden="true">
                      &#9654;
                    </span>
                  </>
                ) : (
                  <img src={item.url} alt={`${game.title} memory ${i + 1}`} loading="lazy" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <button type="button" className="arcade-exit" onClick={onBack}>
        Back
      </button>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={media}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
