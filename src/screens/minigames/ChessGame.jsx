import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameScoreboard } from '../../components/Scoreboard';
import { PLAYERS, recordScore, usePlayer } from '../../lib/scoreboard';
import {
  PIECE_GLYPHS,
  createInitialGame,
  getLegalMoves,
  playMove,
} from '../../lib/chessEngine';

export default function ChessGame({ onBack }) {
  const [game, setGame] = useState(createInitialGame);
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  // Whoever opened the games tab plays White unless they swap before the first move.
  const player = usePlayer();
  const other = PLAYERS.find((p) => p.id !== player)?.id;
  const [playerIsWhite, setPlayerIsWhite] = useState(true);
  const [started, setStarted] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(0);
  const names = { w: playerIsWhite ? player : other, b: playerIsWhite ? other : player };

  const handleRestart = () => {
    setGame(createInitialGame());
    setSelected(null);
    setLegalMoves([]);
    setStarted(false);
  };

  const executeMove = (fromRow, fromCol, move) => {
    const next = playMove(game, fromRow, fromCol, move);
    if (next.status === 'checkmate' && names[next.winner]) {
      recordScore('chess', names[next.winner], 1).then(() => setScoreSaved((k) => k + 1));
    }
    setGame(next);
    setSelected(null);
    setLegalMoves([]);
    setStarted(true);
  };

  const handleSquareClick = (row, col) => {
    if (game.status === 'checkmate' || game.status === 'stalemate') return;
    const piece = game.board[row][col];

    if (selected) {
      const move = legalMoves.find((m) => m.toRow === row && m.toCol === col);
      if (move) {
        executeMove(selected.row, selected.col, move);
        return;
      }
    }

    if (piece && piece.color === game.turn) {
      setSelected({ row, col });
      setLegalMoves(getLegalMoves(game.board, row, col, game));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  };

  const statusText = () => {
    const turnName = names[game.turn];
    if (game.status === 'checkmate') return `Checkmate — ${names[game.winner]} wins!`;
    if (game.status === 'stalemate') return 'Stalemate — draw';
    if (game.status === 'check') return `${turnName} is in check!`;
    return `${turnName} to move`;
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Chess</span>
        <span className="minigame-score chess-status">{statusText()}</span>
      </div>

      <div className="chess-sides">
        <span>&#9812; {names.w}</span>
        <span>&#9818; {names.b}</span>
        {!started && (
          <button type="button" className="shelf-chip" onClick={() => setPlayerIsWhite((w) => !w)}>
            Swap
          </button>
        )}
      </div>

      <div className="chess-board">
        {game.board.map((rowArr, row) =>
          rowArr.map((piece, col) => {
            const isDark = (row + col) % 2 === 1;
            const isSelected = selected && selected.row === row && selected.col === col;
            const moveHere = legalMoves.find((m) => m.toRow === row && m.toCol === col);
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                className={`chess-square${isDark ? ' dark' : ' light'}${isSelected ? ' selected' : ''}`}
                onClick={() => handleSquareClick(row, col)}
              >
                {piece && <span className={`chess-piece chess-piece-${piece.color}`}>{PIECE_GLYPHS[piece.color][piece.type]}</span>}
                {moveHere && <span className={moveHere.capture ? 'chess-capture-ring' : 'chess-move-dot'} />}
              </button>
            );
          })
        )}
      </div>

      <div className="chess-footer">
        <button type="button" className="minigame-exit" onClick={onBack}>
          Back
        </button>
        <button type="button" className="editor-exit-link" onClick={handleRestart}>
          Restart
        </button>
      </div>

      {(game.status === 'checkmate' || game.status === 'stalemate') && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">
            {game.status === 'checkmate' ? 'Checkmate!' : 'Stalemate'}
          </span>
          <span className="minigame-overlay-score">
            {game.status === 'checkmate' ? `${names[game.winner]} wins` : "It's a draw"}
          </span>
          <GameScoreboard game="chess" refreshKey={scoreSaved} />
          <button type="button" className="minigame-restart" onClick={handleRestart}>
            Play Again
          </button>
          <button type="button" className="editor-exit-link" onClick={onBack}>
            Back to Games
          </button>
        </div>
      )}
    </motion.div>
  );
}
