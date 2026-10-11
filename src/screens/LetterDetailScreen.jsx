import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import PixelHeart from '../components/PixelHeart';

// Converts simple *italic* markdown within a paragraph into <em> spans.
function renderInline(text) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

const MILESTONES = [25, 50, 75, 100];

export default function LetterDetailScreen({ letter, onBack }) {
  const scrollRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [tapHearts, setTapHearts] = useState([]);
  const milestonesHitRef = useRef(new Set());

  // Reading-progress bar + confetti rewards at 25/50/75/100% scrolled,
  // not just at the very end — small payoffs along the way, not one big
  // one you only get if you make it all the way through.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const handleScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0;
      setProgress(pct);

      // Safety net: a fast scroll, a jump, or a dropped frame could carry a
      // paragraph past the viewport without it ever registering as
      // intersecting, leaving it stuck invisible. Once we're nearly at the
      // end, force-reveal anything still hidden so nothing is ever
      // permanently lost no matter how someone got there.
      if (pct >= 90) {
        el.querySelectorAll('.letter-reveal:not(.letter-reveal-visible)').forEach((node) => {
          node.classList.add('letter-reveal-visible');
        });
      }

      MILESTONES.forEach((milestone) => {
        const threshold = milestone === 100 ? 96 : milestone;
        if (pct >= threshold && !milestonesHitRef.current.has(milestone)) {
          milestonesHitRef.current.add(milestone);
          const isFinal = milestone === 100;
          confetti({
            particleCount: isFinal ? 70 : 26,
            spread: isFinal ? 75 : 55,
            origin: { y: 0.8 },
            colors: ['#ff6b9d', '#ffd93d', '#ff9edb', '#ffffff'],
            shapes: ['square'],
            scalar: isFinal ? 1.2 : 0.9,
          });
        }
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Paragraphs and highlight lines gently fade + rise into view as they're
  // scrolled to, instead of all sitting there at once — gives the letter a
  // living rhythm rather than reading as one flat wall of text.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    const targets = container.querySelectorAll('.letter-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('letter-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: container, threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // Tap/click anywhere on the letter to leave a little heart behind —
  // a tiny bit of play scattered through the whole reading experience.
  const handlePaperClick = (event) => {
    const container = scrollRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top + container.scrollTop;
    const id = `${Date.now()}-${Math.random()}`;
    setTapHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setTapHearts((prev) => prev.filter((heart) => heart.id !== id));
    }, 900);
  };

  let paragraphIndex = -1;

  return (
    <div className="letter-detail-screen">
      <div className="letter-progress-track">
        <div className="letter-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="letter-ambient" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            className="letter-ambient-heart"
            style={{ left: `${(i * 17) % 100}%`, '--i': i }}
            animate={{ y: [0, -16, 0], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
          >
            <PixelHeart size={14} color="#ff8fb3" />
          </motion.span>
        ))}
      </div>

      <button type="button" className="letter-detail-exit" onClick={onBack} aria-label="Back to letters">
        &times;
      </button>

      <motion.div
        className="letter-detail-paper"
        ref={scrollRef}
        onClick={handlePaperClick}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="letter-wax-seal" aria-hidden="true">
          &#10084;
        </div>

        {letter.blocks.map((block, i) => {
          if (block.type === 'eyebrow') {
            return (
              <p key={i} className="letter-eyebrow">
                {block.text}
              </p>
            );
          }
          if (block.type === 'eyebrow-sub') {
            return (
              <p key={i} className="letter-eyebrow-sub">
                {block.text}
              </p>
            );
          }
          if (block.type === 'date') {
            return (
              <p key={i} className="letter-date">
                {block.text}
              </p>
            );
          }
          if (block.type === 'salutation') {
            return (
              <p key={i} className="letter-salutation">
                {block.text}
              </p>
            );
          }
          if (block.type === 'highlight') {
            return (
              <div key={i} className="letter-highlight letter-reveal">
                <p className="letter-highlight-text">{block.text}</p>
                <p className="letter-highlight-translation">{block.translation}</p>
              </div>
            );
          }
          if (block.type === 'signoff') {
            return (
              <p key={i} className="letter-signoff">
                {block.text}
              </p>
            );
          }
          if (block.type === 'signature') {
            return (
              <p key={i} className="letter-signature">
                {renderInline(block.text)}
              </p>
            );
          }

          paragraphIndex += 1;
          const isFirst = paragraphIndex === 0;
          return (
            <p
              key={i}
              className={`letter-paragraph letter-reveal${isFirst ? ' letter-paragraph-first' : ''}`}
            >
              {renderInline(block.text)}
            </p>
          );
        })}

        <button type="button" className="letter-back" onClick={onBack}>
          Back to Letters
        </button>

        {tapHearts.map((heart) => (
          <motion.span
            key={heart.id}
            className="letter-tap-heart"
            style={{ left: heart.x, top: heart.y }}
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -44, scale: 1.15 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <PixelHeart size={16} color="#ff6b9d" />
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
