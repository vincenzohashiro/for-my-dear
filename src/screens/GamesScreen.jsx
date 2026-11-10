import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameDetailScreen from './GameDetailScreen';
import BootSequence from './BootSequence';
import { PHOTO_GAMES } from '../content/photoGames';
import { useWhatsNew } from '../lib/whatsNew';
import { NewBadge } from '../components/WhatsNewBell';

export default function GamesScreen({ onBack }) {
  const { pendingId, clearPending, countFor } = useWhatsNew();
  // Opened straight from the notification bell.
  const [selectedGame, setSelectedGame] = useState(() => PHOTO_GAMES.find((g) => g.id === pendingId('photo')) || null);
  const [booting, setBooting] = useState(() => Boolean(pendingId('photo')));

  useEffect(() => {
    clearPending();
  }, [clearPending]);

  return (
    <div className="arcade-screen fullscreen">
      <div className="arcade-inner">
        <div className="arcade-lights" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="arcade-light" style={{ '--i': i }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {booting ? (
            <BootSequence key="boot" game={selectedGame} onComplete={() => setBooting(false)} />
          ) : selectedGame ? (
            <GameDetailScreen
              key="detail"
              game={selectedGame}
              onBack={() => setSelectedGame(null)}
            />
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="arcade-marquee">Select Game</h2>

              <div className="arcade-grid">
                {PHOTO_GAMES.map((game, index) => (
                  <motion.button
                    key={game.id}
                    type="button"
                    className="arcade-tile"
                    style={{ '--tile-color': game.color, '--tile-soft': game.soft, '--i': index }}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.06, duration: 0.2 }}
                    whileHover={{ scale: 1.08, y: -6 }}
                    whileTap={{ scale: 0.92, y: 0 }}
                    onClick={() => {
                      setSelectedGame(game);
                      setBooting(true);
                    }}
                  >
                    <span className="arcade-tile-title">{game.title}</span>
                    <span className="arcade-tile-tagline">{game.tagline}</span>
                    <NewBadge count={countFor('photos', game.id)} className="corner" />
                  </motion.button>
                ))}
              </div>

              <p className="arcade-blink">choose your game</p>

              <button type="button" className="arcade-exit" onClick={onBack}>
                Exit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
