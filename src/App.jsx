import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHearts from './components/FloatingHearts';
import PixelHeart from './components/PixelHeart';
import NameGate from './screens/NameGate';
import QuestionGate from './screens/QuestionGate';
import MenuScreen from './screens/MenuScreen';
import GamesScreen from './screens/GamesScreen';
import StoryScreen from './screens/StoryScreen';
import LetterScreen from './screens/LetterScreen';
import PlayScreen from './screens/PlayScreen';
import WaitScreen from './screens/WaitScreen';
import LetterEditorScreen from './screens/LetterEditorScreen';
import './App.css';

// Flip to true and push again when the site is ready to go live.
const SITE_READY = true;

const WIPE_STEPS = {
  initial: {
    clipPath: [
      'inset(0 100% 0 0)',
      'inset(0 80% 0 0)',
      'inset(0 60% 0 0)',
      'inset(0 40% 0 0)',
      'inset(0 20% 0 0)',
      'inset(0 0% 0 0)',
    ],
  },
  exit: {
    clipPath: [
      'inset(0 0 0 0%)',
      'inset(0 0 0 20%)',
      'inset(0 0 0 40%)',
      'inset(0 0 0 60%)',
      'inset(0 0 0 80%)',
      'inset(0 0 0 100%)',
    ],
  },
};

const FULLSCREEN_STEPS = {
  menu: MenuScreen,
  photos: GamesScreen,
  story: StoryScreen,
  letter: LetterScreen,
  game: PlayScreen,
};

function App() {
  const [step, setStep] = useState('name');

  if (typeof window !== 'undefined' && window.location.hash === '#write') {
    return <LetterEditorScreen />;
  }

  if (!SITE_READY) {
    return <WaitScreen />;
  }

  const FullscreenScreen = FULLSCREEN_STEPS[step];
  if (FullscreenScreen) {
    const props =
      step === 'menu'
        ? { onSelect: setStep }
        : { onBack: () => setStep('menu'), onNavigate: setStep };
    return (
      <div className="page">
        <FullscreenScreen {...props} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-stars" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="page-star"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 60}%`,
              '--d': `${2 + (i % 5)}s`,
              '--delay': `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      <FloatingHearts />

      <motion.main
        className="pixel-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pixel-panel-badge">
          <PixelHeart size={30} color="var(--pink)" />
        </div>

        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div
              key="name"
              animate={{ clipPath: WIPE_STEPS.initial.clipPath }}
              exit={{ clipPath: WIPE_STEPS.exit.clipPath }}
              transition={{ duration: 0.4, ease: 'linear' }}
              className="screen-wipe"
            >
              <NameGate onSuccess={() => setStep('question')} />
            </motion.div>
          )}

          {step === 'question' && (
            <motion.div
              key="question"
              animate={{ clipPath: WIPE_STEPS.initial.clipPath }}
              exit={{ clipPath: WIPE_STEPS.exit.clipPath }}
              transition={{ duration: 0.4, ease: 'linear' }}
              className="screen-wipe"
            >
              <QuestionGate onSuccess={() => setStep('menu')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default App;
