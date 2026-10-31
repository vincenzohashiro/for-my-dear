import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LIVES = 3;
const BEST_KEY = 'ftd-spelling-bee-best';

// Each tier unlocks once the score passes `from`, so words get harder as you go.
const TIERS = [
  {
    from: 0,
    words: [
      { word: 'heart', definition: 'The organ that pumps blood; also where feelings live.', sentence: 'You have my whole heart.' },
      { word: 'smile', definition: 'A happy expression with the corners of the mouth turned up.', sentence: 'Your smile lights up the room.' },
      { word: 'cuddle', definition: 'To hold someone close in a warm hug.', sentence: 'Movie night means we cuddle on the couch.' },
      { word: 'gentle', definition: 'Kind and soft, never rough.', sentence: 'She has a gentle way of saying hard things.' },
      { word: 'puzzle', definition: 'A game or problem that tests your cleverness.', sentence: 'We finished the puzzle at midnight.' },
      { word: 'garden', definition: 'A piece of ground where flowers or vegetables grow.', sentence: 'The garden was full of tulips.' },
      { word: 'pillow', definition: 'A soft cushion for your head.', sentence: 'She stole my pillow again.' },
      { word: 'castle', definition: 'A large fortified building from long ago.', sentence: 'The castle had a tall stone tower.' },
      { word: 'button', definition: 'A small disk that fastens clothes, or something you press.', sentence: 'Press the button to start.' },
      { word: 'pirate', definition: 'A robber who sails the seas.', sentence: 'The pirate buried his treasure.' },
      { word: 'sunset', definition: 'The time when the sun goes down in the evening.', sentence: 'We watched the sunset from the hill.' },
      { word: 'dragon', definition: 'A large mythical creature that breathes fire.', sentence: 'The knight was not ready for the dragon.' },
    ],
  },
  {
    from: 4,
    words: [
      { word: 'adorable', definition: 'So cute that it is hard to resist.', sentence: 'That puppy is adorable.' },
      { word: 'treasure', definition: 'Something very valuable, like gold or someone you love.', sentence: 'You are my favorite treasure.' },
      { word: 'calendar', definition: 'A chart showing the days, weeks and months of a year.', sentence: 'I circled our anniversary on the calendar.' },
      { word: 'february', definition: 'The second month of the year.', sentence: 'Valentine’s Day is in February.' },
      { word: 'chocolate', definition: 'A sweet treat made from roasted cacao beans.', sentence: 'I saved you the last piece of chocolate.' },
      { word: 'beautiful', definition: 'Very pleasing to look at.', sentence: 'The view from the bridge was beautiful.' },
      { word: 'separate', definition: 'To set or keep apart.', sentence: 'Please separate the whites from the colors.' },
      { word: 'definitely', definition: 'Without any doubt.', sentence: 'I will definitely win this round.' },
      { word: 'surprise', definition: 'Something unexpected.', sentence: 'The party was a total surprise.' },
      { word: 'whisper', definition: 'To speak very softly.', sentence: 'She leaned in to whisper a secret.' },
      { word: 'umbrella', definition: 'A folding canopy that keeps the rain off.', sentence: 'We shared one umbrella in the storm.' },
      { word: 'favorite', definition: 'Liked more than all the others.', sentence: 'Pizza is my favorite food.' },
    ],
  },
  {
    from: 9,
    words: [
      { word: 'affection', definition: 'A gentle feeling of fondness or liking.', sentence: 'The cat showed its affection by headbutting me.' },
      { word: 'necessary', definition: 'Needed; required.', sentence: 'A second dessert was absolutely necessary.' },
      { word: 'rhythm', definition: 'A strong, regular, repeated pattern of sound or movement.', sentence: 'We danced to the rhythm of the music.' },
      { word: 'embarrass', definition: 'To make someone feel awkward or ashamed.', sentence: 'Please don’t embarrass me in front of my friends.' },
      { word: 'restaurant', definition: 'A place where you pay to sit and eat meals.', sentence: 'We found a tiny restaurant by the beach.' },
      { word: 'conscience', definition: 'The inner sense of what is right and wrong.', sentence: 'My conscience would not let me take the last fry.' },
      { word: 'occasion', definition: 'A particular event or time.', sentence: 'This dress is for a special occasion.' },
      { word: 'cinnamon', definition: 'A sweet brown spice from tree bark.', sentence: 'The rolls smelled of cinnamon.' },
      { word: 'accommodate', definition: 'To provide room for, or to fit in with someone’s needs.', sentence: 'The cabin can accommodate six people.' },
      { word: 'millennium', definition: 'A period of one thousand years.', sentence: 'The castle stood for nearly a millennium.' },
    ],
  },
  {
    from: 15,
    words: [
      { word: 'serendipity', definition: 'Finding something good by happy accident.', sentence: 'Meeting you was pure serendipity.' },
      { word: 'mischievous', definition: 'Playfully causing a little trouble.', sentence: 'She gave me a mischievous grin.' },
      { word: 'onomatopoeia', definition: 'A word that sounds like the thing it names, like buzz.', sentence: 'Buzz is an example of onomatopoeia.' },
      { word: 'bougainvillea', definition: 'A climbing plant with bright pink or purple flowers.', sentence: 'The wall was covered in bougainvillea.' },
      { word: 'connoisseur', definition: 'An expert judge in matters of taste.', sentence: 'He is a connoisseur of instant noodles.' },
      { word: 'liaison', definition: 'A link or close relationship between people or groups.', sentence: 'She acted as liaison between the two teams.' },
      { word: 'silhouette', definition: 'The dark outline of someone against a lighter background.', sentence: 'Her silhouette stood against the sunset.' },
      { word: 'pharaoh', definition: 'A ruler of ancient Egypt.', sentence: 'The pharaoh was buried in a pyramid.' },
      { word: 'chrysanthemum', definition: 'A garden flower with many layers of petals.', sentence: 'Grandma grew a chrysanthemum by the door.' },
      { word: 'quintessential', definition: 'The most perfect example of something.', sentence: 'Rainy days are the quintessential cozy weather.' },
    ],
  },
];

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speak(text) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function pickWord(score, usedWords) {
  const tier = [...TIERS].reverse().find((t) => score >= t.from);
  let pool = tier.words.filter((w) => !usedWords.has(w.word));
  if (!pool.length) pool = tier.words;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Hide the word itself in the example sentence so it can't just be copied.
function blankOut(sentence, word) {
  return sentence.replace(new RegExp(word, 'ig'), (m) => '_'.repeat(m.length));
}

export default function SpellingBeeGame({ onBack }) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [best, setBest] = useState(() => {
    try {
      return Number(localStorage.getItem(BEST_KEY)) || 0;
    } catch {
      return 0;
    }
  });
  const [current, setCurrent] = useState(() => pickWord(0, new Set()));
  const [guess, setGuess] = useState('');
  const [hints, setHints] = useState({ definition: false, sentence: false });
  const [feedback, setFeedback] = useState(null); // { correct, word }
  const usedRef = useRef(new Set());
  const inputRef = useRef(null);

  const gameOver = lives <= 0;

  // Announce each new word like a real bee would.
  useEffect(() => {
    if (gameOver) return;
    speak(`Your word is: ${current.word}`);
    inputRef.current?.focus();
  }, [current, gameOver]);

  useEffect(() => () => canSpeak && window.speechSynthesis.cancel(), []);

  const nextWord = (newScore) => {
    usedRef.current.add(current.word);
    setCurrent(pickWord(newScore, usedRef.current));
    setGuess('');
    setHints({ definition: false, sentence: false });
    setFeedback(null);
  };

  const submit = (e) => {
    e.preventDefault();
    if (feedback || !guess.trim()) return;
    const correct = guess.trim().toLowerCase() === current.word;
    setFeedback({ correct, word: current.word });
    if (correct) {
      speak('Correct!');
      setScore((s) => s + 1);
    } else {
      speak(`That is incorrect. The correct spelling is ${current.word.split('').join(', ')}.`);
      const remaining = lives - 1;
      setLives(remaining);
      if (remaining <= 0 && score > best) {
        setBest(score);
        try {
          localStorage.setItem(BEST_KEY, String(score));
        } catch {
          /* ignore storage failures */
        }
      }
    }
  };

  const revealHint = (kind) => {
    setHints((h) => ({ ...h, [kind]: true }));
    speak(kind === 'definition' ? current.definition : current.sentence);
  };

  const restart = () => {
    usedRef.current = new Set();
    setScore(0);
    setLives(LIVES);
    setCurrent(pickWord(0, usedRef.current));
    setGuess('');
    setHints({ definition: false, sentence: false });
    setFeedback(null);
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Spelling Bee</span>
        <span className="minigame-score">
          {score} pts
        </span>
      </div>

      <div className="bee-status">
        <span className="bee-lives" aria-label={`${lives} lives left`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <span key={i} className={i < lives ? 'bee-life' : 'bee-life lost'}>
              &#9829;
            </span>
          ))}
        </span>
        <span className="bee-best">best {Math.max(best, score)}</span>
      </div>

      {gameOver ? (
        <div className="bee-over">
          <p className="rps-result rps-result-lose">Out of the bee!</p>
          <p className="pixel-body">
            The last word was <strong>{feedback?.word}</strong>. You spelled {score} word{score === 1 ? '' : 's'}.
          </p>
          <button type="button" className="pixel-button" onClick={restart}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <motion.button
            type="button"
            className="bee-speaker"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => speak(current.word)}
          >
            <span className="bee-speaker-icon" aria-hidden="true">
              &#128266;
            </span>
            {canSpeak ? 'Say the word' : 'Sound unavailable'}
          </motion.button>

          <div className="bee-hints">
            <button
              type="button"
              className="shelf-chip"
              onClick={() => revealHint('definition')}
            >
              Definition
            </button>
            <button type="button" className="shelf-chip" onClick={() => revealHint('sentence')}>
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

          <form className="bee-form" onSubmit={submit}>
            <input
              ref={inputRef}
              className="editor-input bee-input"
              value={guess}
              onChange={(e) => setGuess(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              placeholder="spell it..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              disabled={!!feedback}
            />
            {!feedback && (
              <button type="submit" className="pixel-button" disabled={!guess.trim()}>
                Spell
              </button>
            )}
          </form>

          <AnimatePresence>
            {feedback && (
              <motion.div
                className="bee-feedback"
                initial={{ opacity: 0, y: 8 }}
                animate={feedback.correct ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }}
                exit={{ opacity: 0 }}
              >
                <p className={`rps-result ${feedback.correct ? 'rps-result-win' : 'rps-result-lose'}`}>
                  {feedback.correct ? 'Correct!' : 'Not quite'}
                </p>
                <p className="bee-answer">
                  {feedback.word.split('').map((letter, i) => (
                    <motion.span
                      key={i}
                      className="bee-tile"
                      initial={{ rotateX: 90 }}
                      animate={{ rotateX: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </p>
                <button type="button" className="pixel-button" onClick={() => nextWord(score)} autoFocus>
                  Next word
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
      </div>
    </motion.div>
  );
}
