const PIP_LAYOUTS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export default function Die({ value = 1, size = 32, style, className }) {
  const pips = PIP_LAYOUTS[value] || PIP_LAYOUTS[1];

  return (
    <div
      className={`pixel-die${className ? ` ${className}` : ''}`}
      style={{ ...style, width: size, height: size }}
    >
      {pips.map(([row, col]) => (
        <span
          key={`${row}-${col}`}
          className="pixel-die-pip"
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
        />
      ))}
    </div>
  );
}
