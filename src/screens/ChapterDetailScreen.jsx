import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';

export default function ChapterDetailScreen({ chapter, onBack }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [fast, setFast] = useState(false);

  const total = chapter.paragraphs.length;
  const isLast = pageIndex === total - 1;

  const goToPage = (index) => {
    setPageIndex(index);
    setRevealed(false);
    setFast(false);
  };

  const handleAdvance = () => {
    if (!revealed) {
      setFast(true);
      return;
    }
    if (isLast) {
      onBack();
      return;
    }
    goToPage(pageIndex + 1);
  };

  const handleBack = (event) => {
    event.stopPropagation();
    if (pageIndex > 0) goToPage(pageIndex - 1);
  };

  return (
    <div className="vn-screen">
      <div className="vn-scene">
        {chapter.image ? (
          <img src={chapter.image} alt={chapter.title} className="vn-scene-img" />
        ) : (
          <div className="vn-scene-placeholder">image coming soon</div>
        )}
        <span className="vn-tag" style={{ '--tag-color': chapter.color }}>
          {chapter.label}
        </span>
        <button type="button" className="vn-exit" onClick={onBack} aria-label="Back to chapters">
          &times;
        </button>
      </div>

      <div className="vn-box" onClick={handleAdvance}>
        <h2 className="vn-title">{chapter.title}</h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={pageIndex}
            className="vn-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <TypewriterText
              text={chapter.paragraphs[pageIndex]}
              speed={fast ? 1 : 20}
              onDone={() => setRevealed(true)}
            />
          </motion.p>
        </AnimatePresence>

        <div className="vn-controls">
          <button
            type="button"
            className="vn-nav-btn"
            onClick={handleBack}
            disabled={pageIndex === 0}
          >
            &larr;
          </button>

          <div className="vn-dots">
            {chapter.paragraphs.map((_, i) => (
              <span key={i} className={`vn-dot${i === pageIndex ? ' active' : ''}`} />
            ))}
          </div>

          <span className="vn-nav-hint">
            {!revealed ? 'tap to skip' : isLast ? 'done ✓' : 'next ▶'}
          </span>
        </div>
      </div>
    </div>
  );
}
