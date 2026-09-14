import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') onNavigate((index + 1) % photos.length);
      else if (event.key === 'ArrowLeft') onNavigate((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, photos.length, onClose, onNavigate]);

  return (
    <motion.div
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav prev"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index - 1 + photos.length) % photos.length);
          }}
          aria-label="Previous photo"
        >
          &larr;
        </button>
      )}

      <motion.img
        key={photos[index]}
        src={photos[index]}
        alt={`Photo ${index + 1} of ${photos.length}`}
        className="lightbox-img"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        onClick={(event) => event.stopPropagation()}
      />

      {photos.length > 1 && (
        <button
          type="button"
          className="lightbox-nav next"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index + 1) % photos.length);
          }}
          aria-label="Next photo"
        >
          &rarr;
        </button>
      )}

      {photos.length > 1 && (
        <span className="lightbox-counter">
          {index + 1} / {photos.length}
        </span>
      )}
    </motion.div>
  );
}
