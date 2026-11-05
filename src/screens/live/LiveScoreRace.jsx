import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { useLive, useLiveEvent } from '../../lib/live';
import { PLAYERS, RaceContext, gameMeta, recordScore } from '../../lib/scoreboard';
import { LivePresence, OpponentGone } from './LiveBits';
import MemoryMatchGame from '../minigames/MemoryMatchGame';
import FlappyHeartGame from '../minigames/FlappyHeartGame';
import WhackAHeartGame from '../minigames/WhackAHeartGame';
import MergeHeartsGame from '../minigames/MergeHeartsGame';
import SnakeGame from '../minigames/SnakeGame';
import ColorMemoryGame from '../minigames/ColorMemoryGame';
import CatchHeartsGame from '../minigames/CatchHeartsGame';
import PixelFlapGame from '../minigames/PixelFlapGame';
import PixelRunnerGame from '../minigames/PixelRunnerGame';
import BrickBreakerGame from '../minigames/BrickBreakerGame';
import PixelInvadersGame from '../minigames/PixelInvadersGame';

// Every game here reports its score through useRecordScore, which feeds RaceContext.
const RACE_GAMES = {
  flappy: FlappyHeartGame,
  snake: SnakeGame,
  runner: PixelRunnerGame,
  flap: PixelFlapGame,
  catch: CatchHeartsGame,
  whack: WhackAHeartGame,
  breaker: BrickBreakerGame,
  invaders: PixelInvadersGame,
  merge: MergeHeartsGame,
  colors: ColorMemoryGame,
  memory: MemoryMatchGame,
};

const COUNTDOWN = 3;
const RESULT_DELAY_MS = 1200;
const fresh = { score: 0, done: false };

export default function LiveScoreRace({ onExit }) {
  const live = useLive();
  const { send, player, opponent, isHost } = live;
  const [race, setRace] = useState(null); // { id, game }
  const [count, setCount] = useState(0);
  const [me, setMe] = useState(fresh);
  const [them, setThem] = useState(fresh);
  const [showResult, setShowResult] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(0);

  const raceRef = useRef(race);
  const meRef = useRef(me);
  // Highest race number seen, kept even after leaving a race for the picker.
  const lastId = useRef(0);
  useEffect(() => {
    raceRef.current = race;
  });

  const begin = (next, theirState = fresh) => {
    lastId.current = next.id;
    raceRef.current = next;
    meRef.current = fresh;
    setRace(next);
    setMe(fresh);
    setThem(theirState);
    setShowResult(false);
    setCount(COUNTDOWN);
  };

  const start = (game) => {
    const next = { id: lastId.current + 1, game };
    begin(next);
    send('race-start', { race: next });
  };

  // If you both hit start at once, Vinnie's pick wins the tie.
  const adopt = (next, from) => {
    const current = raceRef.current;
    if (next.id > lastId.current) return true;
    return Boolean(current) && next.id === current.id && next.game !== current.game && from === PLAYERS[0].id;
  };

  useLiveEvent('race-start', ({ race: next, from }) => adopt(next, from) && begin(next));
  useLiveEvent('race-score', ({ id, score, done }) => {
    if (id === raceRef.current?.id) setThem({ score, done });
  });
  useLiveEvent('race-sync', ({ race: next, score, done, from }) => {
    const current = raceRef.current;
    if (!next) return;
    if (current && next.id === current.id) setThem({ score, done });
    else if (adopt(next, from)) begin(next, { score, done });
  });

  const { opponentHere } = live;
  useEffect(() => {
    if (opponentHere) send('race-sync', { race: raceRef.current, ...meRef.current });
  }, [opponentHere, send]);

  // The running game calls this every time its score or game-over state changes.
  // A run is locked in at the first game over; later replays don't change it.
  const report = useCallback(
    (score, done) => {
      const current = meRef.current;
      if (current.done || (score === current.score && done === current.done)) return;
      meRef.current = { score, done };
      setMe(meRef.current);
      send('race-score', { id: raceRef.current?.id, score, done });
    },
    [send]
  );
  const raceApi = useMemo(() => ({ report }), [report]);

  const quitRun = () => report(meRef.current.score, true);

  useEffect(() => {
    if (count <= 0) return undefined;
    const timer = setTimeout(() => setCount((n) => n - 1), 800);
    return () => clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (!me.done) return undefined;
    const timer = setTimeout(() => setShowResult(true), RESULT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [me.done]);

  const meta = race && gameMeta(race.game);
  const bothDone = me.done && them.done;
  let winner = null;
  if (bothDone && me.score !== them.score) {
    const iWin = meta.lower ? me.score < them.score : me.score > them.score;
    winner = iWin ? player : opponent;
  }

  // Vinnie's phone saves the race win once, for whoever won it.
  const savedRace = useRef(null);
  useEffect(() => {
    if (!isHost || !winner || savedRace.current === race.id) return;
    savedRace.current = race.id;
    recordScore('race', winner, 1).then(() => setScoreSaved((k) => k + 1));
  }, [isHost, winner, race]);

  if (!race) {
    return (
      <motion.div
        key="race-pick"
        className="minigame-screen"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="minigame-header">
          <span className="minigame-title">Score Race</span>
        </div>
        <LivePresence />
        <p className="pixel-body bee-pick-title">Both play the same game. Best score wins.</p>
        <div className="live-race-grid">
          {Object.keys(RACE_GAMES).map((id) => (
            <button key={id} type="button" className="shelf-chip live-race-chip" onClick={() => start(id)}>
              {gameMeta(id).title}
            </button>
          ))}
        </div>
        <OpponentGone />
        <div className="rps-footer">
          <button type="button" className="minigame-exit" onClick={onExit}>
            Leave
          </button>
        </div>
      </motion.div>
    );
  }

  const Game = RACE_GAMES[race.game];
  const unit = meta.unit;

  return (
    <motion.div
      key="race-stage"
      className="live-race-stage"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="live-race-hud">
        <span className={`live-race-side${me.done ? ' done' : ''}`}>
          You <strong>{me.score}</strong>
          {me.done && ' ✓'}
        </span>
        <span className="live-race-game">{meta.title}</span>
        <span className={`live-race-side${them.done ? ' done' : ''}`}>
          {opponent} <strong>{them.score}</strong>
          {them.done && ' ✓'}
        </span>
      </div>

      {count > 0 ? (
        <div className="minigame-screen live-countdown">
          <motion.span
            key={count}
            className="live-countdown-num"
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {count}
          </motion.span>
          <span className="pixel-body">get ready...</span>
        </div>
      ) : showResult ? (
        <div className="minigame-screen live-race-result">
          <div className="minigame-header">
            <span className="minigame-title">{meta.title}</span>
          </div>
          {!bothDone ? (
            <>
              <p className="rps-result">
                You got {me.score} {unit}
              </p>
              <p className="live-waiting">
                {opponent} is still playing ({them.score} {unit})...
              </p>
            </>
          ) : (
            <>
              <p className={`rps-result ${winner === player ? 'rps-result-win' : winner ? 'rps-result-lose' : 'rps-result-tie'}`}>
                {winner === player ? 'You win!' : winner ? `${opponent} wins!` : "It's a tie!"}
              </p>
              <p className="pixel-body">
                {me.score} vs {them.score} {unit}
              </p>
              <GameScoreboard game="race" refreshKey={scoreSaved} />
            </>
          )}
          <OpponentGone />
          <div className="live-race-actions">
            <button type="button" className="pixel-button" onClick={() => start(race.game)}>
              Rematch
            </button>
            <button type="button" className="shelf-chip" onClick={() => setRace(null)}>
              Pick another game
            </button>
          </div>
          <button type="button" className="minigame-exit" onClick={onExit}>
            Leave
          </button>
        </div>
      ) : (
        <RaceContext.Provider value={raceApi}>
          <Game key={race.id} onBack={quitRun} />
        </RaceContext.Provider>
      )}
    </motion.div>
  );
}
