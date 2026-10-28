import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PhotoLightbox({ photos, index, onClose, onNavigate }) {
  const items = photos.map((p) => (typeof p === 'string' ? { url: p, kind: 'image' } : p));
  const current = items[index];

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') onNavigate((index + 1) % items.length);
      else if (event.key === 'ArrowLeft') onNavigate((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length, onClose, onNavigate]);

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

      {items.length > 1 && (
        <button
          type="button"
          className="lightbox-nav prev"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index - 1 + items.length) % items.length);
          }}
          aria-label="Previous"
        >
          &larr;
        </button>
      )}

      {current.kind === 'video' ? (
        <motion.video
          key={current.url}
          src={current.url}
          controls
          autoPlay
          className="lightbox-img lightbox-video"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <motion.img
          key={current.url}
          src={current.url}
          alt={`Photo ${index + 1} of ${items.length}`}
          className="lightbox-img"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
          onClick={(event) => event.stopPropagation()}
        />
      )}

      {items.length > 1 && (
        <button
          type="button"
          className="lightbox-nav next"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index + 1) % items.length);
          }}
          aria-label="Next"
        >
          &rarr;
        </button>
      )}

      {items.length > 1 && (
        <span className="lightbox-counter">
          {index + 1} / {items.length}
        </span>
      )}
    </motion.div>
  );
}
