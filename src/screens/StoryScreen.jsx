import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../components/PixelHeart';
import PixelSprite from '../components/PixelSprite';
import { MOON_GRID, PINE_GRID } from '../pixelGrids';
import ChapterDetailScreen from './ChapterDetailScreen';
import image1 from '../assets/Image1.png';
import image2 from '../assets/Image2.png';
import image3 from '../assets/Image3.png';

const CHAPTERS = [
  {
    id: 'one',
    label: 'Chapter One',
    title: 'Who Are You?',
    color: 'var(--pink)',
    image: image1,
    paragraphs: [
      `In the early days of the world called Zelvaria, there was a boy who thought being alone was happiness. He had no idea that was about to change.`,
      `One day, a new player joined. Mingming, who would later go by Charmy, was one of the first few to arrive in the world. The boy noticed her right away, though at the time he was a bit of a "kupal" about it. As far as he knew, she was just another player, someone he'd greet once and never think about again.`,
      `He saw her in a few calls but didn't say anything, until one day he finally greeted her: "Hello Charmy!" He wasn't expecting the "Hello Vinnie!" that came back. Vinnie always had a knack for reading a person's vibe, and her kindness hit him like a truck through a wall. He was intrigued now. He kept watching her, kept visiting her settlement, which she'd named "Arasaka!?" "That's from Cyberpunk!" he said. It was one of his favorite games.`,
      `After that, he found himself checking in on her every time she was online. He'd quietly leave gold coins for her, slip resources into her storage chest, never letting her know it was him. He kept it up until a friend came to visit his hometown, and he disappeared from the game for a few weeks. It seemed like that was the end of it. He was wrong.`,
    ],
  },
  {
    id: 'two',
    label: 'Chapter Two',
    title: 'Opening Doors',
    color: 'var(--sky)',
    image: image2,
    paragraphs: [
      `It seemed like that was the end of it, until his friend came to visit and they got to talking. His friend mentioned, "Oo nga pala, kilala mo si Charmy? Natatanong ka rin pala niya sa akin minsan." He was floored. He'd never let on that he'd been doing all that for her, yet somehow she'd been asking about him. Then his friend added, "Tinanong niya rin kung anong klaseng babae gusto mo." What? Why would she even say that? Was she curious about him?`,
      `Weeks went by without either of them reaching out. Then, on July 4th, she messaged him out of nowhere. They talked about nothing in particular and then went quiet again. He figured that was that, just another dead end. Around this time he was going through his own crisis, wondering if people only valued his kindness for what they could get out of him. So he shut everyone out.`,
      `Then on July 15th, she wrote, "Hi Vinnie, I need you asap." His kind heart didn't know what to do with that. In a panic, he replied, "Okay, give me 5 minutes," and then left her on read. He genuinely didn't want to talk to anyone. But she didn't give up. The next day she asked again if he could help her, and he did, though he held back. Then she asked, "Mag web dev ka pa rin sa Zelvaria?" And that's how it started.`,
    ],
  },
  {
    id: 'three',
    label: 'Chapter Three',
    title: 'Building Together',
    color: 'var(--purple)',
    image: image3,
    paragraphs: [
      `That was when he asked himself, "Do I actually help them, or do I protect my peace?" Hesitant, he said, "Pwede pa rin akong mag-dev," though he wasn't ready to hand over the files he'd built out of his own kindness. "Pero kailangan mo akong sagutin every time magtatanong ako," she said, and that was easy enough to agree to. "Wala ka sa Discord," she pointed out. "Nakakahiya sa owner eh," he admitted. "Ako na ang owner, wag ka mahiya," she said. Something about that touched him deeply. Even after his hesitation, she was still kind. She was the echo of his own kindness, reflected back at him.`,
      `From there, things picked up. They talked constantly, and he realized just how much she'd been struggling on her own. This time he gave her his full effort, on one condition: he'd only work with her, no one else. They spent hours talking through the server, fixing whatever needed fixing. Sleepless nights, endless bugs, and somehow it all felt cozy.`,
      `It wasn't long before the conversations turned personal, interests, hobbies, getting to know each other. They found they had a lot in common, both drawn to the same things, both a little fascinated by the same ideas. Eventually they started a project together called Project-Eden, both of them hooked on sci-fi. That's when they realized they liked a lot of the same games too. She asked if he'd ever played Split Fiction. He hadn't, he never had anyone to play it with. So he asked if she'd play it with him, half expecting a no. She said yes. And that's where it all really began.`,
    ],
  },
];

export default function StoryScreen({ onBack, onNavigate }) {
  const [activeChapter, setActiveChapter] = useState('one');
  const [openChapter, setOpenChapter] = useState(null);
  const chapterRefs = useRef({});
  const scrollRef = useRef(null);

  const goTo = (step) => {
    if (onNavigate) onNavigate(step);
    else onBack();
  };

  const scrollToChapter = (id) => {
    setActiveChapter(id);
    chapterRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="story-page-screen" ref={scrollRef}>
      <div className="story-bg" aria-hidden="true">
        <div className="story-bg-stars">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="story-star"
              style={{
                left: `${(i * 23) % 100}%`,
                top: `${(i * 31) % 95}%`,
                animationDelay: `${(i % 6) * 0.4}s`,
              }}
            />
          ))}
        </div>
        <PixelSprite grid={MOON_GRID} size={72} color="#fff3c4" className="story-bg-moon" />
        <div className="story-bg-tree left">
          <PixelSprite grid={PINE_GRID} size={80} color="#173622" />
        </div>
        <div className="story-bg-tree right">
          <PixelSprite grid={PINE_GRID} size={80} color="#173622" />
        </div>
      </div>

      <div className="story-content">
        <nav className="story-nav">
          <p className="story-nav-tagline">
            Same game.
            <br />
            Different stories.
            <br />
            Now ours.
          </p>
          <div className="story-nav-links">
            <button type="button" className="story-nav-link" onClick={() => goTo('menu')}>
              Home
            </button>
            <button
              type="button"
              className="story-nav-link active"
              onClick={() => setOpenChapter(null)}
            >
              Our Story
            </button>
            <button type="button" className="story-nav-link" onClick={() => goTo('photos')}>
              Gallery
            </button>
          </div>
        </nav>

        {openChapter ? (
          <ChapterDetailScreen chapter={openChapter} onBack={() => setOpenChapter(null)} />
        ) : (
          <>
            <header className="story-header">
              <PixelHeart size={26} color="#ff6b9d" className="pixel-beat" />
              <h1 className="story-title">Our Story</h1>
              <p className="story-subtitle">A Story of Mein Schatz</p>
              <p className="story-tagline">Different worlds. Same stars.</p>
            </header>

            <div className="story-tabs">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  type="button"
                  className={`story-tab${activeChapter === chapter.id ? ' active' : ''}`}
                  onClick={() => scrollToChapter(chapter.id)}
                >
                  {chapter.label}
                </button>
              ))}
            </div>

            {CHAPTERS.map((chapter, index) => (
              <motion.section
                key={chapter.id}
                ref={(el) => (chapterRefs.current[chapter.id] = el)}
                className="story-chapter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <span className="story-chapter-tag" style={{ '--tag-color': chapter.color }}>
                  {chapter.label}
                </span>
                <h2 className="story-chapter-title">{chapter.title}</h2>
                <p className="story-chapter-body">{chapter.paragraphs[0]}</p>
                <button
                  type="button"
                  className="story-read-more"
                  onClick={() => setOpenChapter(chapter)}
                >
                  Read More <span aria-hidden="true">&rarr;</span>
                </button>
              </motion.section>
            ))}

            <footer className="story-footer">
              <PixelHeart size={16} color="#ff6b9d" />
              <p>Here&apos;s to more chapters Mein Schatz.</p>
            </footer>
          </>
        )}
      </div>

      <p className="story-corner-note">A story that keeps loading... &hearts;</p>
    </div>
  );
}
