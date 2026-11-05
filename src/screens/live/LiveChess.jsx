import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { PIECE_GLYPHS, createInitialGame, getLegalMoves, playMove } from '../../lib/chessEngine';
import { useLive, useLiveEvent } from '../../lib/live';
import { PLAYERS, recordScore } from '../../lib/scoreboard';
import { LivePresence, OpponentGone } from './LiveBits';

// Colors alternate every game so nobody is always stuck with Black.
const whiteFor = (round) => PLAYERS[round % 2].id;
const newMatch = (round) => ({ round, moves: 0, game: createInitialGame() });

// A later round always wins; within a round, the side with more moves is newer.
const isNewer = (a, b) => a.round > b.round || (a.round === b.round && a.moves > b.moves);

export default function LiveChess({ onExit }) {
  const live = useLive();
  const [match, setMatch] = useState(() => newMatch(0));
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [scoreSaved, setScoreSaved] = useState(0);

  const { game } = match;
  const white = whiteFor(match.round);
  const myColor = white === live.player ? 'w' : 'b';
  const names = { w: white, b: white === live.player ? live.opponent : live.player };
  const over = game.status === 'checkmate' || game.status === 'stalemate';
  const myTurn = game.turn === myColor && !over;

  const share = (next) => {
    setMatch(next);
    live.send('chess-state', { match: next });
  };

  useLiveEvent('chess-state', ({ match: theirs }) => {
    setMatch((mine) => (isNewer(theirs, mine) ? theirs : mine));
    setSelected(null);
    setLegalMoves([]);
  });

  // On (re)connect, whoever has the further-along board brings the other phone up to date.
  const matchRef = useRef(match);
  useEffect(() => {
    matchRef.current = match;
  });
  const { opponentHere, send } = live;
  useEffect(() => {
    if (opponentHere) send('chess-state', { match: matchRef.current });
  }, [opponentHere, send]);

  const handleSquareClick = (row, col) => {
    if (!myTurn) return;
    const piece = game.board[row][col];

    if (selected) {
      const move = legalMoves.find((m) => m.toRow === row && m.toCol === col);
      if (move) {
        const next = playMove(game, selected.row, selected.col, move);
        share({ ...match, moves: match.moves + 1, game: next });
        setSelected(null);
        setLegalMoves([]);
        // Only the winner's phone saves the win, so it isn't counted twice.
        if (next.status === 'checkmate') {
          recordScore('chess', live.player, 1).then(() => setScoreSaved((k) => k + 1));
        }
        return;
      }
    }

    if (piece && piece.color === myColor) {
      setSelected({ row, col });
      setLegalMoves(getLegalMoves(game.board, row, col, game));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  };

  const statusText = () => {
    if (game.status === 'checkmate') return `${names[game.winner]} wins!`;
    if (game.status === 'stalemate') return 'Stalemate';
    const who = myTurn ? 'Your move' : `${live.opponent}'s move`;
    return game.status === 'check' ? `Check! ${who}` : who;
  };

  // Black sees the board from their own side.
  const order = myColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const last = game.lastMove;

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Live Chess</span>
        <span className={`minigame-score chess-status${myTurn ? ' live-your-turn' : ''}`}>{statusText()}</span>
      </div>

      <LivePresence />

      <div className="chess-sides">
        <span>&#9812; {names.w}</span>
        <span>&#9818; {names.b}</span>
      </div>

      <div className={`chess-board${myTurn ? '' : ' live-locked'}`}>
        {order.map((row) =>
          order.map((col) => {
            const piece = game.board[row][col];
            const isDark = (row + col) % 2 === 1;
            const isSelected = selected && selected.row === row && selected.col === col;
            const isLast =
              last && ((last.fromRow === row && last.fromCol === col) || (last.toRow === row && last.toCol === col));
            const moveHere = legalMoves.find((m) => m.toRow === row && m.toCol === col);
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={`chess-square${isDark ? ' dark' : ' light'}${isSelected ? ' selected' : ''}${isLast ? ' last-move' : ''}`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && (
                  <span className={`chess-piece chess-piece-${piece.color}`}>{PIECE_GLYPHS[piece.color][piece.type]}</span>
                )}
                {moveHere && <span className={moveHere.capture ? 'chess-capture-ring' : 'chess-move-dot'} />}
              </button>
            );
          })
        )}
      </div>

      <OpponentGone />

      <div className="chess-footer">
        <button type="button" className="minigame-exit" onClick={onExit}>
          Leave
        </button>
        <button type="button" className="editor-exit-link" onClick={() => share(newMatch(match.round + 1))}>
          New game (swap colors)
        </button>
      </div>

      {over && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">{game.status === 'checkmate' ? 'Checkmate!' : 'Stalemate'}</span>
          <span className="minigame-overlay-score">
            {game.status === 'checkmate'
              ? names[game.winner] === live.player
                ? 'You win!'
                : `${names[game.winner]} wins`
              : "It's a draw"}
          </span>
          <GameScoreboard game="chess" refreshKey={scoreSaved} />
          <button type="button" className="minigame-restart" onClick={() => share(newMatch(match.round + 1))}>
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
