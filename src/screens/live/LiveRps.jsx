import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { useLive, useLiveEvent } from '../../lib/live';
import { recordScore } from '../../lib/scoreboard';
import { LivePresence, OpponentGone } from './LiveBits';

const TARGET = 5;
const CHOICES = [
  { id: 'rock', label: 'Rock', emoji: '✊' },
  { id: 'paper', label: 'Paper', emoji: '✋' },
  { id: 'scissors', label: 'Scissors', emoji: '✌' },
];
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
const emojiFor = (id) => CHOICES.find((c) => c.id === id).emoji;

function judge(a, b) {
  if (a === b) return 'tie';
  return BEATS[a] === b ? 'win' : 'lose';
}

// Everything (rounds played, score, winner) is derived from both players' picks,
// so the two phones can't drift apart.
function tally(myPicks, theirPicks) {
  const score = { me: 0, them: 0 };
  let round = 1;
  let last = null;
  while (myPicks[round] && theirPicks[round] && score.me < TARGET && score.them < TARGET) {
    const result = judge(myPicks[round], theirPicks[round]);
    if (result === 'win') score.me += 1;
    if (result === 'lose') score.them += 1;
    last = { mine: myPicks[round], theirs: theirPicks[round], result };
    round += 1;
  }
  return { score, round, last, winner: score.me >= TARGET ? 'me' : score.them >= TARGET ? 'them' : null };
}

export default function LiveRps({ onExit }) {
  const live = useLive();
  const [match, setMatch] = useState({ id: 0, mine: {}, theirs: {} });
  const [scoreSaved, setScoreSaved] = useState(0);
  const { score, round, last, winner } = tally(match.mine, match.theirs);
  const myPick = match.mine[round];
  const theyPicked = Boolean(match.theirs[round]);

  // Takes in the other phone's picks; a newer match id means they started a rematch.
  const absorb = (id, picks) =>
    setMatch((m) => {
      if (id < m.id) return m;
      if (id > m.id) return { id, mine: {}, theirs: { ...picks } };
      return { ...m, theirs: { ...m.theirs, ...picks } };
    });

  useLiveEvent('rps-pick', ({ id, round: r, choice }) => absorb(id, { [r]: choice }));
  useLiveEvent('rps-sync', ({ id, picks }) => absorb(id, picks));

  const matchRef = useRef(match);
  useEffect(() => {
    matchRef.current = match;
  });
  const { opponentHere, send } = live;
  useEffect(() => {
    if (opponentHere) send('rps-sync', { id: matchRef.current.id, picks: matchRef.current.mine });
  }, [opponentHere, send]);

  // Only the winner's phone saves the match win.
  const savedMatch = useRef(null);
  useEffect(() => {
    if (winner !== 'me' || savedMatch.current === match.id) return;
    savedMatch.current = match.id;
    recordScore('rps-live', live.player, 1).then(() => setScoreSaved((k) => k + 1));
  }, [winner, match.id, live.player]);

  const pick = (choice) => {
    if (myPick || winner) return;
    setMatch((m) => ({ ...m, mine: { ...m.mine, [round]: choice } }));
    send('rps-pick', { id: match.id, round, choice });
  };

  const rematch = () => {
    const id = match.id + 1;
    setMatch({ id, mine: {}, theirs: {} });
    send('rps-sync', { id, picks: {} });
  };

  const resultLabel = { win: 'You win the round!', lose: `${live.opponent} wins the round`, tie: 'Tie!' };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Live RPS</span>
        <span className="minigame-score">first to {TARGET}</span>
      </div>

      <LivePresence />

      <div className="live-versus">
        <span className="live-versus-side">
          <span className="live-versus-name">You</span>
          <span className="live-versus-num">{score.me}</span>
        </span>
        <span className="live-versus-vs">vs</span>
        <span className="live-versus-side">
          <span className="live-versus-name">{live.opponent}</span>
          <span className="live-versus-num">{score.them}</span>
        </span>
      </div>

      <div className="rps-arena">
        <AnimatePresence mode="wait">
          {last ? (
            <motion.div
              key={round}
              className="rps-round"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="rps-faceoff">
                <span className="rps-emoji">{emojiFor(last.mine)}</span>
                <span className="rps-vs">vs</span>
                <span className="rps-emoji">{emojiFor(last.theirs)}</span>
              </div>
              <p className={`rps-result rps-result-${last.result}`}>{resultLabel[last.result]}</p>
            </motion.div>
          ) : (
            <p className="pixel-body">Pick in secret. Both picks show at once.</p>
          )}
        </AnimatePresence>
      </div>

      <p className="live-turn-note">
        {winner
          ? ' '
          : myPick
            ? `Locked in ${emojiFor(myPick)}. Waiting for ${live.opponent}...`
            : theyPicked
              ? `${live.opponent} has picked. Your turn!`
              : `Round ${round}: make your pick`}
      </p>

      <div className="rps-choices">
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`rps-choice${myPick === choice.id ? ' picked' : ''}`}
            disabled={Boolean(myPick || winner)}
            onClick={() => pick(choice.id)}
          >
            <span className="rps-emoji">{choice.emoji}</span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>

      <OpponentGone />

      <div className="rps-footer">
        <button type="button" className="minigame-exit" onClick={onExit}>
          Leave
        </button>
      </div>

      {winner && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">{winner === 'me' ? 'You win!' : `${live.opponent} wins!`}</span>
          <span className="minigame-overlay-score">
            {score.me} - {score.them}
          </span>
          <GameScoreboard game="rps-live" refreshKey={scoreSaved} />
          <button type="button" className="minigame-restart" onClick={rematch}>
            Rematch
          </button>
          <button type="button" className="editor-exit-link" onClick={onExit}>
            Back to Live
          </button>
        </div>
      )}
    </motion.div>
  );
}
