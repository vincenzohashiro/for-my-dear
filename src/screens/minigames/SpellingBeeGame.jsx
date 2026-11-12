import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { summarize, usePlayer, useRecordScore, useScores } from '../../lib/scoreboard';
import { BeeAnswer, BeeCompare, BeeMascot, BeeSpeaker, BeeSpeller, BeeTimer } from './BeeParts';
import {
  CHEERS,
  DIFFICULTIES,
  OOPS,
  blankOut,
  canSpeak,
  compareSpelling,
  honeyBurst,
  isCorrect,
  maxLetters,
  pickLine,
  speak,
} from '../../lib/bee';

function pickWord(words, usedWords) {
  let pool = words.filter((w) => !usedWords.has(w.word));
  if (!pool.length) pool = words;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function SpellingBeeGame({ onBack }) {
  const [difficulty, setDifficulty] = useState(null);

  if (difficulty) {
    return (
      <BeeRound
        key={difficulty.id}
        difficulty={difficulty}
        onChangeDifficulty={() => setDifficulty(null)}
        onBack={onBack}
      />
    );
  }

  return <DifficultyPicker onPick={setDifficulty} onBack={onBack} />;
}

function DifficultyPicker({ onPick, onBack }) {
  const { rows } = useScores(0);

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Spelling Bee</span>
      </div>

      <p className="pixel-body bee-pick-title">Pick a difficulty</p>

      <div className="bee-difficulties">
        {DIFFICULTIES.map((d, index) => (
          <motion.button
            key={d.id}
            type="button"
            className="bee-difficulty"
            style={{ '--tile-color': d.color }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.2 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onPick(d)}
          >
            <span className="bee-difficulty-label">{d.label}</span>
            <span className="bee-difficulty-tagline">{d.tagline}</span>
            <span className="bee-difficulty-meta">
              {d.lives} lives
              {summarize(rows, `bee-${d.id}`).players.map((p) => (
                <span key={p.id}> &middot; {p.id} {p.value ?? '-'}</span>
              ))}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
      </div>
    </motion.div>
  );
}

function BeeRound({ difficulty, onChangeDifficulty, onBack }) {
  const player = usePlayer();
  const { words, lives: maxLives } = difficulty;
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [streak, setStreak] = useState(0);
  const [current, setCurrent] = useState(() => pickWord(words, new Set()));
  const [hints, setHints] = useState({ definition: false, sentence: false });
  const [feedback, setFeedback] = useState(null); // { correct, word }
  const [mascot, setMascot] = useState({ mood: 'idle', line: 'Listen up!', key: 0 });
  const [round, setRound] = useState(0);
  const usedRef = useRef(new Set());

  const gameOver = lives <= 0;
  const scoreSaved = useRecordScore(`bee-${difficulty.id}`, gameOver, score);

  const react = (mood, line) => setMascot((m) => ({ mood, line, key: m.key + 1 }));

  // Announce each new word like a real bee would.
  useEffect(() => {
    if (gameOver) return;
    speak(`Your word is: ${current.word}`);
  }, [current, gameOver]);

  useEffect(() => () => canSpeak && window.speechSynthesis.cancel(), []);

  const nextWord = () => {
    usedRef.current.add(current.word);
    setCurrent(pickWord(words, usedRef.current));
    setHints({ definition: false, sentence: false });
    setFeedback(null);
    react('idle', 'Listen up!');
  };

  // Enter moves on once the answer is showing, so you never need the mouse.
  const nextRef = useRef(nextWord);
  useEffect(() => {
    nextRef.current = nextWord;
  });
  const showingAnswer = Boolean(feedback) && !gameOver;
  useEffect(() => {
    if (!showingAnswer) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      nextRef.current();
    };
    // Small delay so the Enter that spelled the word doesn't also skip past the answer.
    const timer = setTimeout(() => window.addEventListener('keydown', onKey), 250);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [showingAnswer]);

  const loseLife = (line) => {
    speak(`The correct spelling is ${current.word.split('').join(', ')}.`);
    setLives((l) => l - 1);
    setStreak(0);
    react('sad', lives - 1 <= 0 ? 'Bzzz... game over' : line);
  };

  const spell = (guess) => {
    if (feedback) return true;
    const correct = isCorrect(current, guess);
    setFeedback({ correct, word: current.word, compare: correct ? null : compareSpelling(guess, current.word) });
    if (correct) {
      const nextStreak = streak + 1;
      speak('Correct!');
      setScore((s) => s + 1);
      setStreak(nextStreak);
      honeyBurst(nextStreak % 5 === 0);
      react('happy', nextStreak >= 3 ? `${nextStreak} in a row!` : pickLine(CHEERS));
    } else {
      loseLife(pickLine(OOPS));
    }
    // A wrong spelling still ends this word: the answer is shown instead of a retry.
    return true;
  };

  const timeUp = () => {
    if (feedback) return;
    setFeedback({ correct: false, timeout: true, word: current.word });
    loseLife("Time's up!");
  };

  const revealHint = (kind) => {
    setHints((h) => ({ ...h, [kind]: true }));
    speak(kind === 'definition' ? current.definition : current.sentence);
    react('think', kind === 'definition' ? 'Here is a clue...' : 'Try it in a sentence!');
  };

  const restart = () => {
    usedRef.current = new Set();
    setScore(0);
    setLives(maxLives);
    setStreak(0);
    setCurrent(pickWord(words, usedRef.current));
    setHints({ definition: false, sentence: false });
    setFeedback(null);
    setRound((r) => r + 1);
    react('idle', 'Fresh hive, fresh start!');
  };

  return (
    <motion.div
      className="minigame-screen bee-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Spelling Bee</span>
        <motion.span
          key={score}
          className="minigame-score"
          initial={{ scale: score ? 1.6 : 1, color: '#e0a800' }}
          animate={{ scale: 1, color: '#2b2140' }}
        >
          {score} pts
        </motion.span>
      </div>

      <div className="bee-status">
        <span className="bee-lives" aria-label={`${lives} lives left`}>
          {Array.from({ length: maxLives }, (_, i) => (
            <motion.span
              key={i}
              className={i < lives ? 'bee-life' : 'bee-life lost'}
              animate={i === lives ? { scale: [1.6, 1], rotate: [0, -20, 0] } : undefined}
            >
              &#9829;
            </motion.span>
          ))}
        </span>
        <span className="bee-level" style={{ '--tile-color': difficulty.color }}>
          {difficulty.label}
        </span>
        <span className="bee-best">{player}</span>
      </div>

      <AnimatePresence>
        {streak >= 2 && !gameOver && (
          <motion.span
            key={streak}
            className="bee-streak"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
          >
            &#128293; {streak} in a row
          </motion.span>
        )}
      </AnimatePresence>

      {gameOver ? (
        <div className="bee-over">
          <p className="rps-result rps-result-lose">Out of the bee!</p>
          <p className="pixel-body">
            The last word was <strong>{feedback?.word}</strong>. You spelled {score} word{score === 1 ? '' : 's'}.
          </p>
          <GameScoreboard game={`bee-${difficulty.id}`} refreshKey={scoreSaved} />
          <button type="button" className="pixel-button" onClick={restart}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="bee-stage">
            <BeeMascot mood={mascot.mood} moodKey={mascot.key} line={mascot.line} />
            <BeeSpeaker onSay={() => speak(current.word)} label={canSpeak ? 'Say the word' : 'Sound unavailable'} />
          </div>

          <BeeTimer
            seconds={difficulty.seconds}
            running={!feedback}
            resetKey={`${round}-${current.word}`}
            onExpire={timeUp}
          />

          <div className="bee-hints">
            <button
              type="button"
              className={`shelf-chip${hints.definition ? ' active' : ''}`}
              onClick={() => revealHint('definition')}
            >
              Definition
            </button>
            <button
              type="button"
              className={`shelf-chip${hints.sentence ? ' active' : ''}`}
              onClick={() => revealHint('sentence')}
            >
              Use it in a sentence
            </button>
          </div>

          <div className="bee-hint-text">
            {/* Without speech the definition is the only clue, so show it up front. */}
            {(hints.definition || !canSpeak) && <p className="pixel-body">{current.definition}</p>}
            {(hints.sentence || !canSpeak) && (
              <p className="pixel-body bee-sentence">&ldquo;{blankOut(current.sentence, current.word)}&rdquo;</p>
            )}
          </div>

          {feedback ? (
            <motion.div className="bee-feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className={`rps-result ${feedback.correct ? 'rps-result-win' : 'rps-result-lose'}`}>
                {feedback.correct ? 'Correct!' : feedback.timeout ? "Time's up! The word was" : 'Not quite'}
              </p>
              {feedback.compare ? (
                <BeeCompare compare={feedback.compare} />
              ) : (
                <BeeAnswer word={feedback.word} good={feedback.correct} />
              )}
              <button type="button" className="pixel-button" onClick={nextWord}>
                Next word
              </button>
            </motion.div>
          ) : (
            <BeeSpeller
              key={`${round}-${current.word}`}
              onSpell={spell}
              length={current.word.length}
              maxLength={maxLetters(current)}
            />
          )}
        </>
      )}

      <div className="rps-footer bee-footer">
        <button type="button" className="minigame-exit" onClick={onChangeDifficulty}>
          Difficulty
        </button>
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
      </div>
    </motion.div>
  );
}
