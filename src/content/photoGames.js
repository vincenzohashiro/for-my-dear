// The games in the Photos arcade, and the photos/videos dropped in for each.
export const PHOTO_GAMES = [
  {
    id: 'split-fiction',
    title: 'Split Fiction',
    tagline: 'Co-op Sci-Fi Adventure',
    color: 'var(--pink)',
    soft: '#ffc9dc',
  },
  {
    id: 'it-takes-two',
    title: 'It Takes Two',
    tagline: 'Co-op Story Game',
    color: 'var(--sky)',
    soft: '#e3f6ff',
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    tagline: 'Sandbox Survival',
    color: 'var(--green)',
    soft: '#bfe9cf',
  },
  {
    id: 'palworld',
    title: 'Palworld',
    tagline: 'Creature Survival',
    color: 'var(--yellow)',
    soft: '#ffedb0',
  },
  {
    id: 'sea-of-thieves',
    title: 'Sea of Thieves',
    tagline: 'Pirate Adventure',
    color: 'var(--teal)',
    soft: '#c0ede8',
  },
  {
    id: 'roblox',
    title: 'Roblox',
    tagline: 'Endless Minigames',
    color: 'var(--purple)',
    soft: '#dccfff',
  },
  {
    id: 'project-zomboid',
    title: 'Project Zomboid',
    tagline: 'Zombie Survival',
    color: 'var(--red)',
    soft: '#ffd2d5',
  },
  {
    id: 'minecraft-dungeons',
    title: 'Minecraft Dungeons',
    tagline: 'Dungeon Crawler',
    color: 'var(--blue)',
    soft: '#c6dcf7',
  },
  {
    id: 'sketchheads',
    title: 'Sketchheads',
    tagline: 'Drawing Party Game',
    color: 'var(--orange)',
    soft: '#ffdcb8',
  },
  {
    id: 'risk-of-rain-2',
    title: 'Risk of Rain 2',
    tagline: 'Roguelike Survival',
    color: 'var(--lime)',
    soft: '#e4f7bb',
  },
  {
    id: 'deadlock',
    title: 'Deadlock',
    tagline: 'Hero Shooter',
    color: 'var(--cyan)',
    soft: '#c7f5fc',
  },
];

// Drop image or video files into src/assets/photos/<game-id>/ and they show
// up here automatically — no code changes needed.
const mediaModules = import.meta.glob(
  '../assets/photos/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP,mp4,mov,webm,MP4,MOV,WEBM}',
  { eager: true, import: 'default' }
);

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];

export function getMedia(gameId) {
  return Object.entries(mediaModules)
    .filter(([path]) => path.includes(`/photos/${gameId}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => {
      const ext = path.split('.').pop().toLowerCase();
      return { path, url, kind: VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image' };
    });
}
