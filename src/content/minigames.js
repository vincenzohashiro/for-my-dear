// The Play a Game list. An `added` date (YYYY-MM-DD) marks a game as new in the bell.
export const MINIGAMES = [
  { id: 'memory', title: 'Memory Match', tagline: 'Find the pairs', color: 'var(--pink)' },
  { id: 'flappy', title: 'Flappy Heart', tagline: 'Tap to fly', color: 'var(--blue)' },
  { id: 'whack', title: 'Whack-a-Heart', tagline: 'Quick clicks', color: 'var(--yellow)' },
  { id: 'merge', title: 'Merge Hearts', tagline: 'Slide & combine', color: 'var(--purple)' },
  { id: 'snake', title: 'Snake', tagline: 'Grow and go', color: 'var(--green)' },
  { id: 'rps', title: 'Rock Paper Scissors', tagline: 'Beat the CPU', color: 'var(--red)' },
  { id: 'colors', title: 'Color Memory', tagline: 'Repeat the pattern', color: 'var(--teal)' },
  { id: 'catch', title: 'Catch the Hearts', tagline: 'Don’t miss one', color: '#ff8c3a' },
  { id: 'flap', title: 'Pixel Flap', tagline: 'Classic flap & dodge', color: '#4cb24c' },
  { id: 'runner', title: 'Pixel Runner', tagline: 'Jump the cacti', color: '#c9914a' },
  { id: 'breaker', title: 'Brick Breaker', tagline: 'Clear the bricks', color: 'var(--yellow)' },
  { id: 'invaders', title: 'Pixel Invaders', tagline: 'Defend the line', color: 'var(--teal)' },
  { id: 'chess', title: 'Chess', tagline: '2-player, pass & play', color: 'var(--ink)' },
  { id: 'bee', title: 'Spelling Bee', tagline: 'Hear it, spell it', color: 'var(--orange)', added: '2026-11-01' },
  { id: 'emulator', title: 'Retro Emulator', tagline: 'Load your own ROM', color: 'var(--red)' },
];
