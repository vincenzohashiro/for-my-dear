import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import { CAMERA_GRID } from '../pixelGrids';
import PhotoLightbox from '../components/PhotoLightbox';

// Drop image or video files into src/assets/photos/<game-id>/ and they show
// up here automatically — no code changes needed.
const mediaModules = import.meta.glob(
  '../assets/photos/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP,mp4,mov,webm,MP4,MOV,WEBM}',
  { eager: true, import: 'default' }
);

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];

function getMedia(gameId) {
  return Object.entries(mediaModules)
    .filter(([path]) => path.includes(`/photos/${gameId}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const ext = path.split('.').pop().toLowerCase();
      return { url, kind: VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image' };
    });
}

export default function GameDetailScreen({ game, onBack }) {
  const media = getMedia(game.id);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
