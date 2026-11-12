import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { useLive, useLiveEvent } from '../../lib/live';
import { recordLocalScore, recordScore } from '../../lib/scoreboard';
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
  speak,
} from '../../lib/bee';
import { BeeAnswer, BeeCompare, BeeMascot, BeeSpeaker, BeeSpeller, BeeTimer } from '../minigames/BeeParts';
import { LivePresence, OpponentGone } from './LiveBits';

const WORDS_PER_RACE = 8;
const REVEAL_MS = 2200;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const findWord = (difficulty, word) =>
  DIFFICULTIES.find((d) => d.id === difficulty).words.find((w) => w.word === word);

// Vinnie's phone is the referee: it picks the words, decides who spelled each
// one first, and broadcasts the whole race state so both screens match.
export default function LiveBeeRace({ onExit }) {
  const live = useLive();
  const { isHost, send, player, opponent } = live;
  const [race, setRace] = useState(null);
  const [scoreSaved, setScoreSaved] = useState(0);
  // How many letters the other person has typed for the current word.
  const [theirTyping, setTheirTyping] = useState({ key: '', letters: 0 });
  const raceRef = useRef(race);
  useEffect(() => {
    raceRef.current = race;
  });

  const publish = (next) => {
    raceRef.current = next;
    setRace(next);
    send('bee-race', { race: next });
  };

  const start = (difficulty) => {
    if (!isHost) {
      send('bee-request', { difficulty });
      return;
    }
    const words = shuffle(DIFFICULTIES.find((d) => d.id === difficulty).words).slice(0, WORDS_PER_RACE);
    publish({
      id: (raceRef.current?.id || 0) + 1,
      difficulty,
      order: words.map((w) => w.word),
      index: 0,
      points: { [player]: 0, [opponent]: 0 },
      solvedBy: undefined,
      done: false,
    });
  };

  // Host only: the first correct spelling to arrive wins the word; `by: null`
  // means it was skipped or the clock ran out.
  const decide = (index, by, timedOut = false) => {
    const current = raceRef.current;
    if (!current || current.done || current.index !== index || current.solvedBy !== undefined) return;
    const points = by ? { ...current.points, [by]: current.points[by] + 1 } : current.points;
    publish({ ...current, solvedBy: by, points, timedOut });
  };

  const claim = (kind) => {
    const by = kind === 'correct' ? player : null;
    if (isHost) decide(race.index, by);
    else send(`bee-${kind}`, { id: race.id, index: race.index });
  };

  const reset = () => {
    if (isHost) publish(null);
    else send('bee-reset');
  };

  useLiveEvent('bee-race', ({ race: next }) => {
    if (!isHost) setRace(next);
  });
  useLiveEvent('bee-request', ({ difficulty }) => isHost && start(difficulty));
  useLiveEvent('bee-correct', ({ id, index, from }) => isHost && id === raceRef.current?.id && decide(index, from));
  useLiveEvent('bee-skip', ({ id, index }) => isHost && id === raceRef.current?.id && decide(index, null));
  useLiveEvent('bee-reset', () => isHost && publish(null));
  useLiveEvent('bee-typing', ({ id, index, letters }) => setTheirTyping({ key: `${id}-${index}`, letters }));

  const sendTyping = useCallback(
    (guess) => {
      const current = raceRef.current;
      if (current) send('bee-typing', { id: current.id, index: current.index, letters: guess.length });
    },
    [send]
  );

  // Host brings a (re)joining phone up to speed.
  const { opponentHere } = live;
  useEffect(() => {
    if (opponentHere && isHost) send('bee-race', { race: raceRef.current });
  }, [opponentHere, isHost, send]);

  // Host moves everyone on after the answer has been shown for a moment.
  useEffect(() => {
    if (!isHost || !race || race.done || race.solvedBy === undefined) return undefined;
    const timer = setTimeout(() => {
      const finished = race.index + 1 >= race.order.length;
      const next = finished ? { ...race, done: true } : { ...race, index: race.index + 1, solvedBy: undefined };
      raceRef.current = next;
      setRace(next);
      send('bee-race', { race: next });
    }, REVEAL_MS);
    return () => clearTimeout(timer);
  }, [isHost, race, send]);

  // The referee's clock: when a word runs out of time, nobody gets the point.
  // It restarts only when a new word starts (clockKey), not on every update.
  const decideRef = useRef(decide);
  useEffect(() => {
    decideRef.current = decide;
  });
  const clockKey = race && !race.done && race.solvedBy === undefined ? `${race.id}-${race.index}` : null;
  const clockSeconds = race ? DIFFICULTIES.find((d) => d.id === race.difficulty).seconds : 0;
  useEffect(() => {
    if (!isHost || !clockKey) return undefined;
    const index = raceRef.current.index;
    const timer = setTimeout(() => decideRef.current(index, null, true), clockSeconds * 1000);
    return () => clearTimeout(timer);
  }, [isHost, clockKey, clockSeconds]);

  // The win is saved once for whoever won it: Vinnie's phone writes the shared
  // board, and the other phone keeps its own copy so both scoreboards match.
  const savedRace = useRef(null);
  useEffect(() => {
    if (!race?.done || savedRace.current === race.id) return;
    savedRace.current = race.id;
    const mine = race.points[player];
    const theirs = race.points[opponent];
    if (mine === theirs) return;
    const winner = mine > theirs ? player : opponent;
    if (isHost) recordScore('bee-race', winner, 1).then(() => setScoreSaved((k) => k + 1));
    else {
      recordLocalScore('bee-race', winner, 1).then(() => setScoreSaved((k) => k + 1));
    }
  }, [isHost, race, player, opponent]);

  return (
    <motion.div
      className="minigame-screen bee-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Bee Race</span>
        {race && (
          <span className="minigame-score">
            word {Math.min(race.index + 1, race.order.length)}/{race.order.length}
          </span>
        )}
      </div>

      <LivePresence />

      {!race ? (
        <>
          <p className="pixel-body bee-pick-title">Same words for both of you. First to spell it gets the point.</p>
          <div className="bee-difficulties">
            {DIFFICULTIES.map((d) => (
              <motion.button
                key={d.id}
                type="button"
                className="bee-difficulty"
                style={{ '--tile-color': d.color }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => start(d.id)}
              >
                <span className="bee-difficulty-label">{d.label}</span>
                <span className="bee-difficulty-tagline">{d.tagline}</span>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="live-versus">
            <span className="live-versus-side">
              <span className="live-versus-name">You</span>
              <span className="live-versus-num">{race.points[player]}</span>
            </span>
            <span className="live-versus-vs">vs</span>
            <span className="live-versus-side">
              <span className="live-versus-name">{opponent}</span>
              <span className="live-versus-num">{race.points[opponent]}</span>
            </span>
          </div>
          {!race.done && (
            <BeeWord
              key={`${race.id}-${race.index}`}
              race={race}
              onClaim={claim}
              onTyping={sendTyping}
              theirLetters={theirTyping.key === `${race.id}-${race.index}` ? theirTyping.letters : 0}
            />
          )}
        </>
      )}

      <OpponentGone />

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onExit}>
          Leave
        </button>
      </div>

      {race?.done && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">
            {race.points[player] === race.points[opponent]
              ? "It's a tie!"
              : race.points[player] > race.points[opponent]
                ? 'You win!'
                : `${opponent} wins!`}
          </span>
          <span className="minigame-overlay-score">
            {race.points[player]} - {race.points[opponent]}
          </span>
          <GameScoreboard game="bee-race" refreshKey={scoreSaved} />
          <button type="button" className="minigame-restart" onClick={reset}>
            Race Again
          </button>
          <button type="button" className="editor-exit-link" onClick={onExit}>
            Back to Live
          </button>
        </div>
      )}
    </motion.div>
  );
}

function BeeWord({ race, onClaim, onTyping, theirLetters }) {
  const live = useLive();
  const current = findWord(race.difficulty, race.order[race.index]);
  const seconds = DIFFICULTIES.find((d) => d.id === race.difficulty).seconds;
  const [wrong, setWrong] = useState(0);
  const [lastTry, setLastTry] = useState('');
  const [hints, setHints] = useState({ definition: false, sentence: false });
  const [claimed, setClaimed] = useState(false);
  const solved = race.solvedBy !== undefined;
  const iGotIt = race.solvedBy === live.player;

  useEffect(() => {
    speak(`Your word is: ${current.word}`);
  }, [current.word]);

  useEffect(() => {
    if (!race.solvedBy) return;
    speak(race.solvedBy === live.player ? 'Correct!' : `${race.solvedBy} got it.`);
    if (race.solvedBy === live.player) honeyBurst();
  }, [race.solvedBy, live.player]);

  const spell = (guess) => {
    if (solved || claimed) return true;
    if (isCorrect(current, guess)) {
      setClaimed(true);
      onClaim('correct');
      return true;
    }
    setWrong((n) => n + 1);
    setLastTry(guess);
    return false;
  };

  const revealHint = (kind) => {
    setHints((h) => ({ ...h, [kind]: true }));
    speak(kind === 'definition' ? current.definition : current.sentence);
  };

  // The mascot reacts to the race: cheers for you, sulks when the other phone was quicker.
  let mood = 'idle';
  let line = 'First to spell it wins!';
  if (solved) {
    mood = iGotIt ? 'happy' : race.solvedBy ? 'sad' : 'think';
    line = iGotIt
      ? CHEERS[race.index % CHEERS.length]
      : race.solvedBy
        ? `${race.solvedBy} was quicker!`
        : race.timedOut
          ? "Time's up!"
          : 'Skipped! Next one...';
  } else if (wrong) {
    mood = 'sad';
    line = OOPS[(wrong - 1) % OOPS.length];
  } else if (theirLetters > 0) {
    line = `${live.opponent} is typing...`;
  }

  return (
    <>
      <div className="bee-stage">
        <BeeMascot mood={mood} moodKey={`${race.solvedBy}-${wrong}`} line={line} />
        <BeeSpeaker onSay={() => speak(current.word)} label={canSpeak ? 'Say the word' : 'Sound unavailable'} />
      </div>

      <BeeTimer seconds={seconds} running={!solved} resetKey={`${race.id}-${race.index}`} />

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
        {(hints.definition || !canSpeak) && <p className="pixel-body">{current.definition}</p>}
        {(hints.sentence || !canSpeak) && (
          <p className="pixel-body bee-sentence">&ldquo;{blankOut(current.sentence, current.word)}&rdquo;</p>
        )}
      </div>

      {solved ? (
        <motion.div className="bee-feedback" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className={`rps-result ${iGotIt ? 'rps-result-win' : race.solvedBy ? 'rps-result-lose' : 'rps-result-tie'}`}>
            {iGotIt
              ? 'You got it first!'
              : race.solvedBy
                ? `${race.solvedBy} got it first!`
                : race.timedOut
                  ? "Time's up!"
                  : 'Skipped'}
          </p>
          {!iGotIt && lastTry ? (
            <BeeCompare compare={compareSpelling(lastTry, current.word)} />
          ) : (
            <BeeAnswer word={current.word} good={iGotIt} />
          )}
        </motion.div>
      ) : (
        <>
          <p className="bee-race-typing" aria-live="polite">
            {live.opponent}:{' '}
            {Array.from({ length: current.word.length }, (_, i) => (
              <span key={i} className={`bee-race-dot${i < theirLetters ? ' on' : ''}`} />
            ))}
          </p>
          <BeeSpeller
            onSpell={spell}
            onChange={onTyping}
            length={current.word.length}
            maxLength={maxLetters(current)}
            disabled={claimed}
            busyLabel={claimed ? 'checking...' : undefined}
          />
          <button type="button" className="editor-exit-link bee-skip" onClick={() => onClaim('skip')}>
            Skip this word
          </button>
        </>
      )}
    </>
  );
}
