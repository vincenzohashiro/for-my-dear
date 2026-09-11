import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameWorldBackdrop from '../components/GameWorldBackdrop';
import PixelSprite from '../components/PixelSprite';
import TypewriterText from '../components/TypewriterText';
import { HEART_GRID, CAMERA_GRID, ENVELOPE_GRID, CONTROLLER_GRID, STAR_GRID } from '../pixelGrids';

const MENU_ITEMS = [
  { id: 'story', label: 'Our Story', grid: HEART_GRID, color: 'var(--pink)' },
  { id: 'photos', label: 'Photos', grid: CAMERA_GRID, color: 'var(--sky)' },
  { id: 'letter', label: 'Letter', grid: ENVELOPE_GRID, color: 'var(--yellow)' },
  { id: 'game', label: 'Play a Game', grid: CONTROLLER_GRID, color: 'var(--purple)' },
];

export default function MenuScreen({ onSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((i) => (i + 1) % MENU_ITEMS.length);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((i) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(MENU_ITEMS[selectedIndex].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect]);

  return (
    <div className="menu-world">
      <GameWorldBackdrop />

      <h1 className="menu-title">
        <TypewriterText text="Choose your path" />
      </h1>

      <div className="menu-row">
        {MENU_ITEMS.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <motion.button
              key={item.id}
              type="button"
              className={`menu-node${isSelected ? ' selected' : ''}`}
              style={{ '--i': index, '--node-color': item.color }}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => onSelect(item.id)}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.25 }}
            >
              <span className="menu-node-icon">
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      className="menu-node-spark"
                      initial={{ opacity: 0, y: 0, scale: 0.6 }}
                      animate={{ opacity: 1, y: -14, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PixelSprite grid={STAR_GRID} size={14} color="#fff6d0" />
                    </motion.span>
                  )}
                </AnimatePresence>
                <PixelSprite grid={item.grid} size={74} color="#2b2140" />
              </span>
              <span className="menu-node-sign">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
