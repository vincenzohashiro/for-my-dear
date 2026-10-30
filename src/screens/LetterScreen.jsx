import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from '../components/PixelSprite';
import PixelHeart from '../components/PixelHeart';
import { FLAME_GRID, ENVELOPE_GRID } from '../pixelGrids';
import { LETTERS } from '../letters';
import { supabase } from '../lib/supabaseClient';
import { buildLetterFromFields, getAuthorFromBlocks, sortLettersByDate } from '../lib/letterUtils';
import LetterDetailScreen from './LetterDetailScreen';

// Letters hidden from the archive without touching their data in Supabase.
// Remove an id here to bring that letter back.
const HIDDEN_LETTER_IDS = ['0648b183-7ec0-46d7-b927-0a45316d0aa1']; // "Assurances"

export default function LetterScreen({ onBack }) {
  const [openLetter, setOpenLetter] = useState(null);
  const [writtenLetters, setWrittenLetters] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase
      .from('letters')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setWrittenLetters(
          data
            .filter((row) => !HIDDEN_LETTER_IDS.includes(row.id))
            .map((row) =>
              buildLetterFromFields({
                id: row.id,
                title: row.title,
                dateDisplay: row.date_display,
                body: row.body,
                closing: row.closing,
                colorSeed: row.id,
                attachments: row.attachments,
              })
            )
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const allLetters = sortLettersByDate([...LETTERS, ...writtenLetters]);

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

            <div className="letter-list">
              {allLetters.map((letter, index) => {
                const author = getAuthorFromBlocks(letter.blocks);
                const showDivider = index > 0 && allLetters[index - 1].date === letter.date;
                return (
                  <div key={letter.id} className="letter-list-item">
                    {showDivider && (
                      <div className="letter-divider" aria-hidden="true">
                        <PixelHeart size={14} color="#ff6b9d" />
                      </div>
                    )}
                    <motion.button
                      type="button"
                      className="letter-envelope"
                      style={{ '--tile-color': letter.color }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.2 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setOpenLetter(letter)}
                    >
                      <span className="letter-envelope-icon">
                        <PixelSprite grid={ENVELOPE_GRID} size={26} color="#2b2140" />
                      </span>
                      <span className="letter-envelope-text">
                        <span className="letter-envelope-meta">
                          <span className="letter-envelope-date">{letter.date}</span>
                          {author && (
                            <span className={`letter-envelope-author author-${author.toLowerCase()}`}>
                              {author}
                            </span>
                          )}
                        </span>
                        <span className="letter-envelope-title">{letter.title}</span>
                      </span>
                      <span className="letter-envelope-open">Open &rarr;</span>
                    </motion.button>
                  </div>
                );
              })}
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
