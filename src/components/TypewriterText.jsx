import { useEffect, useState } from 'react';

export default function TypewriterText({ text, speed = 35, className, onDone }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span className={`typewriter-cursor${done ? ' blink' : ''}`}>▍</span>
    </span>
  );
}
