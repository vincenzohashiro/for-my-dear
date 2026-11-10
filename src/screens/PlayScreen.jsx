import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypewriterText from '../components/TypewriterText';
import PixelSprite from '../components/PixelSprite';
import Die from '../components/Die';
import { HEART_GRID, SPADE_GRID } from '../pixelGrids';
import MemoryMatchGame from './minigames/MemoryMatchGame';
import FlappyHeartGame from './minigames/FlappyHeartGame';
import WhackAHeartGame from './minigames/WhackAHeartGame';
import MergeHeartsGame from './minigames/MergeHeartsGame';
import SnakeGame from './minigames/SnakeGame';
import RockPaperScissorsGame from './minigames/RockPaperScissorsGame';
import ColorMemoryGame from './minigames/ColorMemoryGame';
import CatchHeartsGame from './minigames/CatchHeartsGame';
import PixelFlapGame from './minigames/PixelFlapGame';
import PixelRunnerGame from './minigames/PixelRunnerGame';
import BrickBreakerGame from './minigames/BrickBreakerGame';
import PixelInvadersGame from './minigames/PixelInvadersGame';
import ChessGame from './minigames/ChessGame';
import RetroEmulatorGame from './minigames/RetroEmulatorGame';
import SpellingBeeGame from './minigames/SpellingBeeGame';
import { MINIGAMES } from '../content/minigames';
import { useWhatsNew } from '../lib/whatsNew';
import { NewBadge } from '../components/WhatsNewBell';
import { ScoreboardHub } from '../components/Scoreboard';
import LiveHub from './live/LiveHub';
import { PLAYERS, PlayerContext } from '../lib/scoreboard';

const SCATTER = [
  { type: 'die', value: 3, top: '10%', left: '8%', size: 34 },
  { type: 'die', value: 5, top: '72%', left: '86%', size: 30 },
  { type: 'card', suit: 'heart', top: '14%', left: '82%' },
  { type: 'card', suit: 'spade', top: '76%', left: '10%' },
  { type: 'die', value: 1, top: '45%', left: '92%', size: 26 },
  { type: 'card', suit: 'heart', top: '82%', left: '48%' },
  { type: 'die', value: 6, top: '8%', left: '46%', size: 24 },
];

const GAME_COMPONENTS = {
  memory: MemoryMatchGame,
  flappy: FlappyHeartGame,
  whack: WhackAHeartGame,
  merge: MergeHeartsGame,
  snake: SnakeGame,
  rps: RockPaperScissorsGame,
  colors: ColorMemoryGame,
  catch: CatchHeartsGame,
  flap: PixelFlapGame,
  runner: PixelRunnerGame,
  breaker: BrickBreakerGame,
  invaders: PixelInvadersGame,
  chess: ChessGame,
  bee: SpellingBeeGame,
  emulator: RetroEmulatorGame,
};

export default function PlayScreen({ onBack }) {
  const { pendingId, clearPending, markSeen, isNewKey } = useWhatsNew();
  // Opened straight from the notification bell (after the who's-playing question).
  const [activeGame, setActiveGame] = useState(() => pendingId('game'));

  useEffect(() => {
    clearPending();
  }, [clearPending]);

  useEffect(() => {
    if (activeGame && player) markSeen([`game:${activeGame}`]);
  }, [activeGame, player, markSeen]);
  // Asked every time the tab opens so each score lands on the right name.
  const [player, setPlayer] = useState(null);

  const ActiveGameComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

  return (
    <div className="play-screen">
      <div className="play-felt" aria-hidden="true" />

      <div className="play-scatter" aria-hidden="true">
        {SCATTER.map((piece, i) =>
          piece.type === 'die' ? (
            <Die
              key={i}
              value={piece.value}
              size={piece.size}
              className="play-piece"
              style={{ top: piece.top, left: piece.left }}
            />
          ) : (
            <div
              key={i}
              className="play-card play-piece"
              style={{ top: piece.top, left: piece.left }}
            >
              <PixelSprite
                grid={piece.suit === 'heart' ? HEART_GRID : SPADE_GRID}
                size={16}
                color={piece.suit === 'heart' ? '#e6394f' : '#1a1a2e'}
              />
            </div>
          )
        )}
      </div>

      <PlayerContext.Provider value={player}>
      <AnimatePresence mode="wait">
        {!player ? (
          <motion.div
            key="who"
            className="play-board play-board-select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h1 className="pixel-heading small">
              <TypewriterText text="Who's playing?" />
            </h1>
            <p className="pixel-body play-subtitle">so your scores go on the board</p>

            <div className="play-who">
              {PLAYERS.map((p, index) => (
                <motion.button
                  key={p.id}
                  type="button"
                  className="play-who-option"
                  style={{ '--tile-color': p.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlayer(p.id)}
                >
                  <PixelSprite grid={HEART_GRID} size={34} color="var(--tile-color)" />
                  <span className="play-who-name">{p.id}</span>
                </motion.button>
              ))}
            </div>

            <button type="button" className="play-back" onClick={onBack}>
              Back
            </button>
          </motion.div>
        ) : activeGame === 'live' ? (
          <LiveHub key="live" onBack={() => setActiveGame(null)} />
        ) : activeGame === 'scoreboard' ? (
          <ScoreboardHub key="scoreboard" onBack={() => setActiveGame(null)} />
        ) : ActiveGameComponent ? (
          <ActiveGameComponent key={activeGame} onBack={() => setActiveGame(null)} />
        ) : (
          <motion.div
            key="select"
            className="play-board play-board-select"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h1 className="pixel-heading small">
              <TypewriterText text="Play a Game" />
            </h1>
            <p className="pixel-body play-subtitle">quick minigames, just for fun</p>

            <div className="play-player-bar">
              <span className="play-player-name">
                playing as <strong>{player}</strong>
              </span>
              <button type="button" className="shelf-chip" onClick={() => setPlayer(null)}>
                Switch
              </button>
              <button
                type="button"
                className="shelf-chip play-scoreboard-chip"
                onClick={() => setActiveGame('scoreboard')}
              >
                &#9813; Scoreboard
              </button>
            </div>

            <motion.button
              type="button"
              className="play-live-banner"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame('live')}
            >
              <span className="play-live-title">&#9889; Play Live</span>
              <span className="play-live-tagline">
                you vs {PLAYERS.find((p) => p.id !== player)?.id}, on your own phones
              </span>
            </motion.button>

            <div className="play-game-grid">
              {MINIGAMES.map((game, index) => (
                <motion.button
                  key={game.id}
                  type="button"
                  className="play-game-tile"
                  style={{ '--tile-color': game.color }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07, duration: 0.2 }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveGame(game.id)}
                >
                  <PixelSprite grid={HEART_GRID} size={22} color="var(--tile-color)" />
                  <span className="play-game-tile-title">{game.title}</span>
                  <span className="play-game-tile-tagline">{game.tagline}</span>
                  <NewBadge count={isNewKey(`game:${game.id}`) ? 1 : 0} className="corner" />
                </motion.button>
              ))}
            </div>

            <button type="button" className="play-back" onClick={onBack}>
              Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </PlayerContext.Provider>
    </div>
  );
}
