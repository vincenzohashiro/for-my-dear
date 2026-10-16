import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const SIZE = 4;

const TILE_STYLES = {
  2: { bg: '#ffe3ec', text: '#a84a6b' },
  4: { bg: '#ffc9dc', text: '#8c2f52' },
  8: { bg: 'var(--pink)', text: '#fff' },
  16: { bg: 'var(--pink-dark)', text: '#fff' },
  32: { bg: 'var(--red)', text: '#fff' },
  64: { bg: '#ff8c3a', text: '#fff' },
  128: { bg: 'var(--yellow)', text: '#5c3d00' },
  256: { bg: 'var(--purple)', text: '#fff' },
  512: { bg: 'var(--teal)', text: '#fff' },
  1024: { bg: 'var(--blue)', text: '#fff' },
  2048: { bg: '#2b2140', text: 'var(--yellow)' },
};

function getTileStyle(value) {
  return TILE_STYLES[value] || { bg: '#2b2140', text: '#fff' };
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function emptyCells(grid) {
  const cells = [];
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === null) cells.push([r, c]);
    })
  );
  return cells;
}

function addRandomTile(grid) {
  const cells = emptyCells(grid);
  if (cells.length === 0) return grid;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  const next = grid.map((row) => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideLine(line) {
  const compact = line.filter((v) => v !== null);
  let scoreGained = 0;
  for (let i = 0; i < compact.length - 1; i += 1) {
    if (compact[i] !== null && compact[i] === compact[i + 1]) {
      compact[i] *= 2;
      scoreGained += compact[i];
      compact[i + 1] = null;
    }
  }
  const merged = compact.filter((v) => v !== null);
  while (merged.length < line.length) merged.push(null);
  return { line: merged, scoreGained };
}

function transpose(rows) {
  return rows[0].map((_, colIndex) => rows.map((row) => row[colIndex]));
}

function move(grid, direction) {
  let rows = grid.map((row) => [...row]);
  let changed = false;
  let scoreGained = 0;

  const processRow = (row) => {
    const before = row.join(',');
    const { line, scoreGained: gained } = slideLine(row);
    if (line.join(',') !== before) changed = true;
    scoreGained += gained;
    return line;
  };

  if (direction === 'left') {
    rows = rows.map((row) => processRow(row));
  } else if (direction === 'right') {
    rows = rows.map((row) => processRow([...row].reverse()).reverse());
  } else if (direction === 'up') {
    rows = transpose(transpose(rows).map((col) => processRow(col)));
  } else if (direction === 'down') {
    rows = transpose(transpose(rows).map((col) => processRow([...col].reverse()).reverse()));
  }

  return { grid: rows, changed, scoreGained };
}

function hasMoves(grid) {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] === null) return true;
      if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
      if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function startingGrid() {
  return addRandomTile(addRandomTile(emptyGrid()));
}

export default function MergeHeartsGame({ onBack }) {
  const [grid, setGrid] = useState(startingGrid);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const touchStart = useRef(null);

  const handleMove = (direction) => {
    if (over) return;
    const result = move(grid, direction);
    if (!result.changed) return;
    const withNewTile = addRandomTile(result.grid);
    setGrid(withNewTile);
    setScore((s) => s + result.scoreGained);
    if (!hasMoves(withNewTile)) setOver(true);
  };

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      if (map[e.key]) {
        e.preventDefault();
        handleMove(map[e.key]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, over]);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      handleMove(dx > 0 ? 'right' : 'left');
    } else {
      handleMove(dy > 0 ? 'down' : 'up');
    }
  };

  const handleRestart = () => {
    setGrid(startingGrid());
    setScore(0);
    setOver(false);
  };

  return (
    <motion.div
      className="minigame-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="minigame-header">
        <span className="minigame-title">Merge Hearts</span>
        <span className="minigame-score">Score: {score}</span>
      </div>

      <div
        className="merge-grid"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {grid.flat().map((value, i) => {
          const style = value ? getTileStyle(value) : null;
          return (
            <div
              key={i}
              className="merge-cell"
              style={style ? { background: style.bg, color: style.text } : undefined}
            >
              {value || ''}
            </div>
          );
        })}
      </div>

      <div className="merge-controls">
        <button type="button" className="merge-arrow" onClick={() => handleMove('up')}>
          &uarr;
        </button>
        <div className="merge-controls-row">
          <button type="button" className="merge-arrow" onClick={() => handleMove('left')}>
            &larr;
          </button>
          <button type="button" className="merge-arrow" onClick={() => handleMove('down')}>
            &darr;
          </button>
          <button type="button" className="merge-arrow" onClick={() => handleMove('right')}>
            &rarr;
          </button>
        </div>
      </div>

      <button type="button" className="minigame-exit" onClick={onBack}>
        Back
      </button>

      {over && (
        <div className="minigame-overlay">
          <span className="minigame-overlay-title">No more moves!</span>
          <span className="minigame-overlay-score">Score: {score}</span>
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
