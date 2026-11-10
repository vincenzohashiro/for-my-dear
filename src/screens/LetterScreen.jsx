import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import PixelHeart from '../components/PixelHeart';
import { FLAME_GRID, ENVELOPE_GRID } from '../pixelGrids';
import { LETTERS } from '../letters';
import { getAuthorFromBlocks, parseLetterDate, sortLettersByDate } from '../lib/letterUtils';
import { useWhatsNew } from '../lib/whatsNew';
import { NewBadge } from '../components/WhatsNewBell';
import LetterDetailScreen from './LetterDetailScreen';

// Buckets already-sorted letters into "October 2026"-style months, in order.
function groupByMonth(letters) {
  const groups = [];
  letters.forEach((letter) => {
    const time = parseLetterDate(letter.date);
    const label = Number.isFinite(time)
      ? new Date(time).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Undated';
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.letters.push(letter);
    else groups.push({ label, letters: [letter] });
  });
  return groups;
}

export default function LetterScreen({ onBack }) {
  const { writtenLetters, pendingId, clearPending, markSeen, isNewKey } = useWhatsNew();
  const allLetters = sortLettersByDate([...LETTERS, ...writtenLetters]);
  const months = groupByMonth(allLetters);
  // Opened straight from the notification bell.
  const [openLetter, setOpenLetter] = useState(() => allLetters.find((l) => l.id === pendingId('letter')) || null);

  useEffect(() => {
    clearPending();
  }, [clearPending]);

  useEffect(() => {
    if (openLetter) markSeen([`letter:${openLetter.id}`]);
  }, [openLetter, markSeen]);

  return (
    <div className="letter-screen">
      <div className="letter-desk" aria-hidden="true" />

      <div className="letter-candle" aria-hidden="true">
        <div className="letter-candle-glow" />
        <PixelSprite grid={FLAME_GRID} size={18} color="#ffb43d" className="letter-flame" />
        <div className="letter-candle-body" />
      </div>

      <AnimatePresence mode="wait">
        {openLetter ? (
          <LetterDetailScreen
            key="detail"
            letter={openLetter}
            onBack={() => setOpenLetter(null)}
          />
        ) : (
          <motion.div
            key="archive"
            className="letter-archive"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PixelHeart size={22} color="#ff8fb3" className="pixel-beat" />
            <h1 className="pixel-heading small">Letters</h1>
            <p className="letter-archive-subtitle">a little note, every month</p>

            <div className="letter-months">
              {months.map((month, monthIndex) => (
                <section key={month.label} className="letter-month">
                  <h2 className="letter-month-title">{month.label}</h2>
                  <div className="letter-grid">
                    {month.letters.map((letter, index) => {
                      const author = getAuthorFromBlocks(letter.blocks);
                      return (
                        <motion.button
                          key={letter.id}
                          type="button"
                          className="letter-envelope"
                          style={{ '--tile-color': letter.color }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (monthIndex * 3 + index) * 0.06, duration: 0.2 }}
                          whileHover={{ scale: 1.03, y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setOpenLetter(letter)}
                        >
                          <NewBadge count={isNewKey(`letter:${letter.id}`) ? 1 : 0} className="corner" />
                          <span className="letter-envelope-top">
                            <span className="letter-envelope-icon">
                              <PixelSprite grid={ENVELOPE_GRID} size={22} color="#2b2140" />
                            </span>
                            {author && (
                              <span className={`letter-envelope-author author-${author.toLowerCase()}`}>
                                {author}
                              </span>
                            )}
                          </span>
                          <span className="letter-envelope-date">{letter.date}</span>
                          <span className="letter-envelope-title">{letter.title}</span>
                          <span className="letter-envelope-open">Open &rarr;</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <button
              type="button"
              className="pixel-button letter-write-button"
              onClick={() => {
                window.location.hash = 'write';
              }}
            >
              Write a Letter
            </button>

            <button type="button" className="letter-back" onClick={onBack}>
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
