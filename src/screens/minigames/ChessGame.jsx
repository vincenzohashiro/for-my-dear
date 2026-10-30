import { useState } from 'react';
import { motion } from 'framer-motion';

const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KING_OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const QUEEN_DIRS = [...BISHOP_DIRS, ...ROOK_DIRS];

const PIECE_GLYPHS = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function opponent(color) {
  return color === 'w' ? 'b' : 'w';
}

function initialBoard() {
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  return [
    backRank.map((type) => ({ type, color: 'b' })),
    Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
    backRank.map((type) => ({ type, color: 'w' })),
  ];
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function slideAttacks(board, row, col, dirs) {
  const squares = [];
  dirs.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      squares.push([r, c]);
      if (board[r][c]) break;
      r += dr;
      c += dc;
    }
  });
  return squares;
}

function getAttackSquares(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];
  const { type, color } = piece;
  if (type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    return [[row + dir, col - 1], [row + dir, col + 1]].filter(([r, c]) => inBounds(r, c));
  }
  if (type === 'n') return KNIGHT_OFFSETS.map(([dr, dc]) => [row + dr, col + dc]).filter(([r, c]) => inBounds(r, c));
  if (type === 'k') return KING_OFFSETS.map(([dr, dc]) => [row + dr, col + dc]).filter(([r, c]) => inBounds(r, c));
  if (type === 'b') return slideAttacks(board, row, col, BISHOP_DIRS);
  if (type === 'r') return slideAttacks(board, row, col, ROOK_DIRS);
  if (type === 'q') return slideAttacks(board, row, col, QUEEN_DIRS);
  return [];
}

function isSquareAttacked(board, row, col, byColor) {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const attacks = getAttackSquares(board, r, c);
        if (attacks.some(([ar, ac]) => ar === row && ac === col)) return true;
      }
    }
  }
  return false;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) return [r, c];
    }
  }
  return null;
}

function getPseudoMoves(board, row, col, state) {
  const piece = board[row][col];
  if (!piece) return [];
  const { type, color } = piece;
  const moves = [];

  if (type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;
    if (inBounds(row + dir, col) && !board[row + dir][col]) {
      moves.push({ toRow: row + dir, toCol: col, promotion: row + dir === promoRow });
      if (row === startRow && !board[row + 2 * dir][col]) {
        moves.push({ toRow: row + 2 * dir, toCol: col, doubleStep: true });
      }
    }
    [-1, 1].forEach((dc) => {
      const tr = row + dir;
      const tc = col + dc;
      if (!inBounds(tr, tc)) return;
      const target = board[tr][tc];
      if (target && target.color !== color) {
        moves.push({ toRow: tr, toCol: tc, capture: true, promotion: tr === promoRow });
      } else if (state.enPassant && state.enPassant.row === tr && state.enPassant.col === tc) {
        moves.push({ toRow: tr, toCol: tc, capture: true, enPassant: true });
      }
    });
    return moves;
  }

  if (type === 'n' || type === 'k') {
    const offsets = type === 'n' ? KNIGHT_OFFSETS : KING_OFFSETS;
    offsets.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (!inBounds(r, c)) return;
      const target = board[r][c];
      if (!target) moves.push({ toRow: r, toCol: c });
      else if (target.color !== color) moves.push({ toRow: r, toCol: c, capture: true });
    });
    if (type === 'k') {
      const homeRow = color === 'w' ? 7 : 0;
      const enemy = opponent(color);
      if (row === homeRow && col === 4 && !state.kingMoved[color]) {
        const kRookKey = `${color}K`;
        const qRookKey = `${color}Q`;
        const kRook = board[homeRow][7];
        if (
          !state.rookMoved[kRookKey] &&
          !board[homeRow][5] &&
          !board[homeRow][6] &&
          kRook && kRook.type === 'r' && kRook.color === color &&
          !isSquareAttacked(board, homeRow, 4, enemy) &&
          !isSquareAttacked(board, homeRow, 5, enemy) &&
          !isSquareAttacked(board, homeRow, 6, enemy)
        ) {
          moves.push({ toRow: homeRow, toCol: 6, castle: 'K' });
        }
        const qRook = board[homeRow][0];
        if (
          !state.rookMoved[qRookKey] &&
          !board[homeRow][1] &&
          !board[homeRow][2] &&
          !board[homeRow][3] &&
          qRook && qRook.type === 'r' && qRook.color === color &&
          !isSquareAttacked(board, homeRow, 4, enemy) &&
          !isSquareAttacked(board, homeRow, 3, enemy) &&
          !isSquareAttacked(board, homeRow, 2, enemy)
        ) {
          moves.push({ toRow: homeRow, toCol: 2, castle: 'Q' });
        }
      }
    }
    return moves;
  }

  const dirs = type === 'b' ? BISHOP_DIRS : type === 'r' ? ROOK_DIRS : QUEEN_DIRS;
  dirs.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c)) {
      const target = board[r][c];
      if (!target) {
        moves.push({ toRow: r, toCol: c });
      } else {
        if (target.color !== color) moves.push({ toRow: r, toCol: c, capture: true });
        break;
      }
      r += dr;
      c += dc;
    }
  });
  return moves;
}

function applyMoveToBoard(board, fromRow, fromCol, move) {
  const newBoard = cloneBoard(board);
  const piece = newBoard[fromRow][fromCol];
  newBoard[move.toRow][move.toCol] = move.promotion ? { type: 'q', color: piece.color } : piece;
  newBoard[fromRow][fromCol] = null;
  if (move.enPassant) {
    newBoard[fromRow][move.toCol] = null;
  }
  if (move.castle === 'K') {
    newBoard[fromRow][5] = newBoard[fromRow][7];
    newBoard[fromRow][7] = null;
  }
  if (move.castle === 'Q') {
    newBoard[fromRow][3] = newBoard[fromRow][0];
    newBoard[fromRow][0] = null;
  }
  return newBoard;
}

function getLegalMoves(board, row, col, state) {
  const piece = board[row][col];
  if (!piece) return [];
  const pseudo = getPseudoMoves(board, row, col, state);
  return pseudo.filter((move) => {
    const simulated = applyMoveToBoard(board, row, col, move);
    const kingPos = findKing(simulated, piece.color);
    return !isSquareAttacked(simulated, kingPos[0], kingPos[1], opponent(piece.color));
  });
}

function getAllLegalMoves(board, color, state) {
  const moves = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        getLegalMoves(board, r, c, state).forEach((m) => moves.push({ fromRow: r, fromCol: c, ...m }));
      }
    }
  }
  return moves;
}

function createInitialGame() {
  return {
    board: initialBoard(),
    turn: 'w',
    kingMoved: { w: false, b: false },
    rookMoved: { wK: false, wQ: false, bK: false, bQ: false },
    enPassant: null,
    status: 'playing',
    winner: null,
  };
}

export default function ChessGame({ onBack }) {
  const [game, setGame] = useState(createInitialGame);
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);

  const handleRestart = () => {
    setGame(createInitialGame());
    setSelected(null);
    setLegalMoves([]);
  };

  const executeMove = (fromRow, fromCol, move) => {
    const piece = game.board[fromRow][fromCol];
    const capturedPiece = game.board[move.toRow][move.toCol];
    const newBoard = applyMoveToBoard(game.board, fromRow, fromCol, move);

    const newKingMoved = { ...game.kingMoved };
    const newRookMoved = { ...game.rookMoved };
    if (piece.type === 'k') newKingMoved[piece.color] = true;
    if (piece.type === 'r') {
      if (fromRow === 7 && fromCol === 0) newRookMoved.wQ = true;
      if (fromRow === 7 && fromCol === 7) newRookMoved.wK = true;
      if (fromRow === 0 && fromCol === 0) newRookMoved.bQ = true;
      if (fromRow === 0 && fromCol === 7) newRookMoved.bK = true;
    }
    if (capturedPiece && capturedPiece.type === 'r') {
      if (move.toRow === 7 && move.toCol === 0) newRookMoved.wQ = true;
      if (move.toRow === 7 && move.toCol === 7) newRookMoved.wK = true;
      if (move.toRow === 0 && move.toCol === 0) newRookMoved.bQ = true;
      if (move.toRow === 0 && move.toCol === 7) newRookMoved.bK = true;
    }

    const newEnPassant = move.doubleStep ? { row: (fromRow + move.toRow) / 2, col: fromCol } : null;
    const nextTurn = opponent(piece.color);
    const newState = { kingMoved: newKingMoved, rookMoved: newRookMoved, enPassant: newEnPassant };

    const kingPos = findKing(newBoard, nextTurn);
    const inCheck = isSquareAttacked(newBoard, kingPos[0], kingPos[1], piece.color);
    const allMoves = getAllLegalMoves(newBoard, nextTurn, newState);

    let status = 'playing';
    let winner = null;
    if (allMoves.length === 0) {
      if (inCheck) {
        status = 'checkmate';
        winner = piece.color;
      } else {
        status = 'stalemate';
      }
    } else if (inCheck) {
      status = 'check';
    }

    setGame({
      board: newBoard,
      turn: nextTurn,
      kingMoved: newKingMoved,
      rookMoved: newRookMoved,
      enPassant: newEnPassant,
      status,
      winner,
    });
    setSelected(null);
    setLegalMoves([]);
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
    const turnName = game.turn === 'w' ? 'White' : 'Black';
    if (game.status === 'checkmate') return `Checkmate — ${game.winner === 'w' ? 'White' : 'Black'} wins!`;
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
            {game.status === 'checkmate' ? `${game.winner === 'w' ? 'White' : 'Black'} wins` : "It's a draw"}
          </span>
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
