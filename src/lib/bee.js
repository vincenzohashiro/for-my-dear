import confetti from 'canvas-confetti';

// Each difficulty has its own word pool, lives, and scoreboard.
export const DIFFICULTIES = [
  {
    id: 'easy',
    label: 'Easy',
    tagline: 'Short, everyday words',
    lives: 5,
    color: 'var(--green)',
    words: [
      { word: 'heart', definition: 'The organ that pumps blood; also where feelings live.', sentence: 'You have my whole heart.' },
      { word: 'smile', definition: 'A happy expression with the corners of the mouth turned up.', sentence: 'Your smile lights up the room.' },
      { word: 'cuddle', definition: 'To hold someone close in a warm hug.', sentence: 'Movie night means we cuddle on the couch.' },
      { word: 'gentle', definition: 'Kind and soft, never rough.', sentence: 'She has a gentle way of saying hard things.' },
      { word: 'puzzle', definition: 'A game or problem that tests your cleverness.', sentence: 'We finished the puzzle at midnight.' },
      { word: 'garden', definition: 'A piece of ground where flowers or vegetables grow.', sentence: 'The garden was full of tulips.' },
      { word: 'pillow', definition: 'A soft cushion for your head.', sentence: 'She stole my pillow again.' },
      { word: 'castle', definition: 'A large fortified building from long ago.', sentence: 'The castle had a tall stone tower.' },
      { word: 'button', definition: 'A small disk that fastens clothes, or something you press.', sentence: 'Press the button to start.' },
      { word: 'pirate', definition: 'A robber who sails the seas.', sentence: 'The pirate buried his treasure.' },
      { word: 'sunset', definition: 'The time when the sun goes down in the evening.', sentence: 'We watched the sunset from the hill.' },
      { word: 'dragon', definition: 'A large mythical creature that breathes fire.', sentence: 'The knight was not ready for the dragon.' },
      { word: 'kitten', definition: 'A baby cat.', sentence: 'The kitten fell asleep in my lap.' },
      { word: 'cookie', definition: 'A small, sweet baked treat.', sentence: 'Can I have one more cookie?' },
      { word: 'rainbow', definition: 'An arc of colors in the sky after rain.', sentence: 'A rainbow came out after the storm.' },
      { word: 'flower', definition: 'The colorful part of a plant that blooms.', sentence: 'I picked a flower just for you.' },
    ],
  },
  {
    id: 'medium',
    label: 'Medium',
    tagline: 'Commonly misspelled',
    lives: 3,
    color: 'var(--yellow)',
    words: [
      { word: 'adorable', definition: 'So cute that it is hard to resist.', sentence: 'That puppy is adorable.' },
      { word: 'treasure', definition: 'Something very valuable, like gold or someone you love.', sentence: 'You are my favorite treasure.' },
      { word: 'calendar', definition: 'A chart showing the days, weeks and months of a year.', sentence: 'I circled our anniversary on the calendar.' },
      { word: 'february', definition: 'The second month of the year.', sentence: 'Valentine’s Day is in February.' },
      { word: 'chocolate', definition: 'A sweet treat made from roasted cacao beans.', sentence: 'I saved you the last piece of chocolate.' },
      { word: 'beautiful', definition: 'Very pleasing to look at.', sentence: 'The view from the bridge was beautiful.' },
      { word: 'separate', definition: 'To set or keep apart.', sentence: 'Please separate the whites from the colors.' },
      { word: 'definitely', definition: 'Without any doubt.', sentence: 'I will definitely win this round.' },
      { word: 'surprise', definition: 'Something unexpected.', sentence: 'The party was a total surprise.' },
      { word: 'whisper', definition: 'To speak very softly.', sentence: 'She leaned in to whisper a secret.' },
      { word: 'umbrella', definition: 'A folding canopy that keeps the rain off.', sentence: 'We shared one umbrella in the storm.' },
      { word: 'favorite', definition: 'Liked more than all the others.', sentence: 'Pizza is my favorite food.' },
      { word: 'affection', definition: 'A gentle feeling of fondness or liking.', sentence: 'The cat showed its affection by headbutting me.' },
      { word: 'necessary', definition: 'Needed; required.', sentence: 'A second dessert was absolutely necessary.' },
      { word: 'rhythm', definition: 'A strong, regular, repeated pattern of sound or movement.', sentence: 'We danced to the rhythm of the music.' },
      { word: 'restaurant', definition: 'A place where you pay to sit and eat meals.', sentence: 'We found a tiny restaurant by the beach.' },
      { word: 'occasion', definition: 'A particular event or time.', sentence: 'This dress is for a special occasion.' },
      { word: 'cinnamon', definition: 'A sweet brown spice from tree bark.', sentence: 'The rolls smelled of cinnamon.' },
    ],
  },
  {
    id: 'hard',
    label: 'Hard',
    tagline: 'Spelling bee champions only',
    lives: 3,
    color: 'var(--red)',
    words: [
      { word: 'embarrass', definition: 'To make someone feel awkward or ashamed.', sentence: 'Please don’t embarrass me in front of my friends.' },
      { word: 'conscience', definition: 'The inner sense of what is right and wrong.', sentence: 'My conscience would not let me take the last fry.' },
      { word: 'accommodate', definition: 'To provide room for, or to fit in with someone’s needs.', sentence: 'The cabin can accommodate six people.' },
      { word: 'millennium', definition: 'A period of one thousand years.', sentence: 'The castle stood for nearly a millennium.' },
      { word: 'serendipity', definition: 'Finding something good by happy accident.', sentence: 'Meeting you was pure serendipity.' },
      { word: 'mischievous', definition: 'Playfully causing a little trouble.', sentence: 'She gave me a mischievous grin.' },
      { word: 'onomatopoeia', definition: 'A word that sounds like the thing it names, like buzz.', sentence: 'Buzz is an example of onomatopoeia.' },
      { word: 'bougainvillea', definition: 'A climbing plant with bright pink or purple flowers.', sentence: 'The wall was covered in bougainvillea.' },
      { word: 'connoisseur', definition: 'An expert judge in matters of taste.', sentence: 'He is a connoisseur of instant noodles.' },
      { word: 'liaison', definition: 'A link or close relationship between people or groups.', sentence: 'She acted as liaison between the two teams.' },
      { word: 'silhouette', definition: 'The dark outline of someone against a lighter background.', sentence: 'Her silhouette stood against the sunset.' },
      { word: 'pharaoh', definition: 'A ruler of ancient Egypt.', sentence: 'The pharaoh was buried in a pyramid.' },
      { word: 'chrysanthemum', definition: 'A garden flower with many layers of petals.', sentence: 'Grandma grew a chrysanthemum by the door.' },
      { word: 'quintessential', definition: 'The most perfect example of something.', sentence: 'Rainy days are the quintessential cozy weather.' },
    ],
  },
];

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text) {
  if (!canSpeak) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// Hide the word itself in the example sentence so it can't just be copied.
export function blankOut(sentence, word) {
  return sentence.replace(new RegExp(word, 'ig'), (m) => '_'.repeat(m.length));
}

export const CHEERS = ['Buzz-tastic!', 'Bee-autiful!', 'Sweet as honey!', "You're the bee's knees!", 'Un-bee-lievable!'];
export const OOPS = ['Oh, bumble!', 'So close!', 'Buzz... not quite!', 'Shake it off!'];
export const pickLine = (lines) => lines[Math.floor(Math.random() * lines.length)];


// Honey-colored confetti for a correct word; `big` for streak milestones.
export function honeyBurst(big = false) {
  confetti({
    particleCount: big ? 90 : 40,
    spread: big ? 90 : 60,
    startVelocity: big ? 38 : 28,
    origin: { y: 0.6 },
    colors: ['#ffd93d', '#ffb43d', '#ff8fb3', '#2b2140', '#ffffff'],
    shapes: ['square'],
    scalar: 0.9,
  });
}
