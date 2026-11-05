import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveContext, useLive, useLiveChannel, useLiveEvent } from '../../lib/live';
import { usePlayer } from '../../lib/scoreboard';
import { LivePresence } from './LiveBits';
import LiveChess from './LiveChess';
import LiveRps from './LiveRps';
import LiveBeeRace from './LiveBeeRace';
import LiveScoreRace from './LiveScoreRace';

const MODES = [
  { id: 'chess', title: 'Chess', tagline: 'One board, two phones', color: 'var(--ink)' },
  { id: 'rps', title: 'Rock Paper Scissors', tagline: 'Secret picks, first to 5', color: 'var(--red)' },
  { id: 'bee', title: 'Spelling Bee Race', tagline: 'Same words, fastest speller', color: 'var(--orange)' },
  { id: 'race', title: 'Score Race', tagline: 'Same game, side by side', color: 'var(--green)' },
];

const SCREENS = { chess: LiveChess, rps: LiveRps, bee: LiveBeeRace, race: LiveScoreRace };

export default function LiveHub({ onBack }) {
  const player = usePlayer();
  const live = useLiveChannel(player);
  return (
    <LiveContext.Provider value={live}>
      <LiveRoom onBack={onBack} />
    </LiveContext.Provider>
  );
}

function LiveRoom({ onBack }) {
  const live = useLive();
  const [screen, setScreen] = useState('hub');
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Picking a game pulls the other person's screen along with you.
  const go = (next) => {
    setScreen(next);
    live.send('nav', { screen: next });
  };
  useLiveEvent('nav', ({ screen: next }) => setScreen(next));

  // When the other person arrives, tell them where we are so they can jump in.
  const { opponentHere, send } = live;
  useEffect(() => {
    if (opponentHere) send('here', { screen: screenRef.current });
  }, [opponentHere, send]);
  useLiveEvent('here', ({ screen: theirs }) => {
    if (screenRef.current === 'hub' && theirs !== 'hub') setScreen(theirs);
  });

  const Screen = SCREENS[screen];

  return (
    <AnimatePresence mode="wait">
      {Screen ? (
        <Screen key={screen} onExit={() => go('hub')} />
      ) : (
        <motion.div
          key="hub"
          className="minigame-screen live-hub"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="minigame-header">
            <span className="minigame-title">&#9889; Play Live</span>
          </div>

          <LivePresence />

          {live.status === 'offline' ? (
            <p className="live-note">Can't reach the live server right now. Check your connection and try again.</p>
          ) : live.sameNameTwice ? (
            <p className="live-note warn">
              Two devices are signed in as {live.player}. One of you should go back and pick {live.opponent}.
            </p>
          ) : !live.opponentHere ? (
            <p className="live-note">
              Waiting for {live.opponent} to open Play Live
              <span className="live-ellipsis" aria-hidden="true" />
            </p>
          ) : (
            <p className="live-note ready">{live.opponent} is here! Pick a game.</p>
          )}

          <div className="live-modes">
            {MODES.map((mode, index) => (
              <motion.button
                key={mode.id}
                type="button"
                className="live-mode"
                style={{ '--tile-color': mode.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.2 }}
                whileHover={live.opponentHere ? { scale: 1.03, y: -2 } : undefined}
                whileTap={live.opponentHere ? { scale: 0.96 } : undefined}
                disabled={!live.opponentHere || live.sameNameTwice}
                onClick={() => go(mode.id)}
              >
                <span className="live-mode-title">{mode.title}</span>
                <span className="live-mode-tagline">{mode.tagline}</span>
              </motion.button>
            ))}
          </div>

          <div className="rps-footer">
            <button type="button" className="minigame-exit" onClick={onBack}>
              Back
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
