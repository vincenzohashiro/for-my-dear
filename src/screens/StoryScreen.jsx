import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PixelHeart from '../components/PixelHeart';
import PixelSprite from '../components/PixelSprite';
import { MOON_GRID, PINE_GRID } from '../pixelGrids';
import ChapterDetailScreen from './ChapterDetailScreen';
import { CHAPTERS } from '../content/storyChapters';
import { useWhatsNew } from '../lib/whatsNew';
import { NewBadge } from '../components/WhatsNewBell';
export default function StoryScreen({ onBack, onNavigate }) {
  const { pendingId, clearPending, markSeen, isNewKey } = useWhatsNew();
  const [activeChapter, setActiveChapter] = useState(() => pendingId('chapter') || 'one');
  // Opened straight from the notification bell.
  const [openChapter, setOpenChapter] = useState(() => CHAPTERS.find((c) => c.id === pendingId('chapter')) || null);

  useEffect(() => {
    clearPending();
  }, [clearPending]);

  useEffect(() => {
    if (openChapter) markSeen([`chapter:${openChapter.id}`]);
  }, [openChapter, markSeen]);
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
                  className={`story-tab${activeChapter === chapter.id ? ' active' : ''}${chapter.comingSoon ? ' coming-soon' : ''}`}
                  onClick={() => scrollToChapter(chapter.id)}
                >
                  {chapter.comingSoon ? `${chapter.label} 🔒` : chapter.label}
                  {isNewKey(`chapter:${chapter.id}`) && <span className="story-tab-dot" aria-label="new" />}
                </button>
              ))}
            </div>

            {CHAPTERS.map((chapter, index) => (
              <motion.section
                key={chapter.id}
                ref={(el) => (chapterRefs.current[chapter.id] = el)}
                className={`story-chapter${chapter.comingSoon ? ' coming-soon' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <span className="story-chapter-tag" style={{ '--tag-color': chapter.color }}>
                  {chapter.label}
                </span>
                <NewBadge count={isNewKey(`chapter:${chapter.id}`) ? 1 : 0} className="inline" />
                {chapter.comingSoon ? (
                  <>
                    <h2 className="story-chapter-title">Coming Soon &hearts;</h2>
                    <p className="story-chapter-body coming-soon-body">
                      This chapter hasn&apos;t been written yet. The story's still going, Mein
                      Schatz, check back soon.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="story-chapter-title">{chapter.title}</h2>
                    <p className="story-chapter-body">{chapter.paragraphs[0]}</p>
                    <button
                      type="button"
                      className="story-read-more"
                      onClick={() => setOpenChapter(chapter)}
                    >
                      Read More <span aria-hidden="true">&rarr;</span>
                    </button>
                  </>
                )}
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
