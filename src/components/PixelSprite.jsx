export default function PixelSprite({ grid, size = 24, color = 'currentColor', className }) {
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={size}
      height={(size / cols) * rows}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {grid.flatMap((row, y) =>
        row
          .split('')
          .map((cell, x) =>
            cell === '1' ? (
              <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
            ) : null
          )
      )}
    </svg>
  );
}
