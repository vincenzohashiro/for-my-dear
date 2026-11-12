import { useLayoutEffect, useRef, useState } from 'react';

// Scales a fixed-size play area up (or down) to fill the room it has, so the
// minigames use the width of a desktop screen without changing any game logic.
// The games map pointer positions as a fraction of the area's on-screen size,
// so their controls keep working at any scale.
export default function GameStage({ children, maxZoom = 2.4, heightShare = 0.6 }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const fit = () => {
      // The play area's own layout size: unaffected by the panel's opening
      // scale animation and by the zoom applied here.
      const area = inner.firstElementChild;
      const naturalW = area?.offsetWidth;
      const naturalH = area?.offsetHeight;
      if (!naturalW || !naturalH) return;
      const byWidth = outer.clientWidth / naturalW;
      const byHeight = (window.innerHeight * heightShare) / naturalH;
      const next = Math.max(0.7, Math.min(maxZoom, byWidth, byHeight));
      const rounded = Math.round(next * 100) / 100;
      if (rounded !== zoomRef.current) {
        zoomRef.current = rounded;
        setZoom(rounded);
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    window.addEventListener('resize', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [maxZoom, heightShare]);

  return (
    <div ref={outerRef} className="game-stage">
      <div ref={innerRef} className="game-stage-inner" style={{ zoom }}>
        {children}
      </div>
    </div>
  );
}
