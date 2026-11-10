import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelSprite from './PixelSprite';
import { useWhatsNew } from '../lib/whatsNew';
import { CAMERA_GRID, CONTROLLER_GRID, ENVELOPE_GRID, HEART_GRID } from '../pixelGrids';

const BELL_GRID = ['0001000', '0011100', '0111110', '0111110', '0111110', '1111111', '0001000'];

const KINDS = {
  letter: { label: 'New letter', grid: ENVELOPE_GRID, color: 'var(--yellow)' },
  chapter: { label: 'New chapter', grid: HEART_GRID, color: 'var(--pink)' },
  photo: { label: 'New photos', grid: CAMERA_GRID, color: '#4fc3f7' },
  game: { label: 'New game', grid: CONTROLLER_GRID, color: 'var(--purple)' },
};

// Photos come in bunches, so they're listed as one row per game.
function groupForList(items) {
  const rows = [];
  const photoRows = {};
  items.forEach((item) => {
    if (item.kind !== 'photo') {
      rows.push({ ...item, count: 1 });
    } else if (photoRows[item.id]) {
      photoRows[item.id].count += 1;
    } else {
      photoRows[item.id] = { ...item, count: 1 };
      rows.push(photoRows[item.id]);
    }
  });
  return rows;
}

export function NewBadge({ count, className = '' }) {
  if (!count) return null;
  return (
    <motion.span
      className={`new-badge ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
    >
      {count > 1 ? `${count} new` : 'new'}
    </motion.span>
  );
}

export default function WhatsNewBell() {
  const whatsNew = useWhatsNew();
  const [open, setOpen] = useState(false);
  if (!whatsNew) return null;
  const { newItems, openItem, markAllSeen } = whatsNew;
  const rows = groupForList(newItems);

  return (
    <div className="bell-wrap">
      <motion.button
        type="button"
        className={`bell-button${newItems.length ? ' has-new' : ''}`}
        aria-label={newItems.length ? `${newItems.length} new things` : 'Nothing new'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        animate={newItems.length ? { rotate: [0, -14, 12, -8, 6, 0] } : undefined}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3.5 }}
        whileTap={{ scale: 0.9 }}
      >
        <PixelSprite grid={BELL_GRID} size={26} color="#2b2140" />
        {newItems.length > 0 && <span className="bell-count">{newItems.length > 99 ? '99+' : newItems.length}</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bell-panel"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bell-panel-head">
              <span className="bell-panel-title">What&apos;s new</span>
              {rows.length > 0 && (
                <button type="button" className="bell-clear" onClick={markAllSeen}>
                  mark all read
                </button>
              )}
            </div>

            {rows.length === 0 ? (
              <p className="bell-empty">You&apos;re all caught up &hearts;</p>
            ) : (
              <ul className="bell-list">
                {rows.map((row) => {
                  const kind = KINDS[row.kind];
                  return (
                    <li key={row.key}>
                      <button
                        type="button"
                        className="bell-item"
                        style={{ '--kind-color': kind.color }}
                        onClick={() => {
                          setOpen(false);
                          openItem(row);
                        }}
                      >
                        <span className="bell-item-icon">
                          <PixelSprite grid={kind.grid} size={18} color="#2b2140" />
                        </span>
                        <span className="bell-item-text">
                          <span className="bell-item-kind">
                            {row.kind === 'photo' ? `${row.count} new photo${row.count === 1 ? '' : 's'}` : kind.label}
                          </span>
                          <span className="bell-item-title">{row.title}</span>
                        </span>
                        <span className="bell-item-go" aria-hidden="true">
                          &rarr;
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
