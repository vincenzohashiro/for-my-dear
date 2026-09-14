import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import { CAMERA_GRID } from '../pixelGrids';
import PhotoLightbox from '../components/PhotoLightbox';

// Drop image files into src/assets/photos/<game-id>/ and they show up here
// automatically — no code changes needed.
const photoModules = import.meta.glob(
  '../assets/photos/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
);

function getPhotos(gameId) {
  return Object.entries(photoModules)
    .filter(([path]) => path.includes(`/photos/${gameId}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);
}

export default function GameDetailScreen({ game, onBack }) {
  const photos = getPhotos(game.id);
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
        {photos.length === 0 ? (
          <div className="photo-empty">
            <PixelSprite grid={CAMERA_GRID} size={40} color="var(--tile-color)" />
            <p>no memories added yet</p>
          </div>
        ) : (
          <div className="photo-gallery">
            {photos.map((src, i) => (
              <motion.button
                key={src}
                type="button"
                className="photo-thumb"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={src} alt={`${game.title} memory ${i + 1}`} loading="lazy" />
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
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
