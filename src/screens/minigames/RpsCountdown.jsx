import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const WORDS = ['Rock...', 'Paper...', 'Scissors...', 'SHOOT!'];
const STEP_MS = 450;

// "Rock... Paper... Scissors... SHOOT!" with two shaking fists, then `onDone`.
// Both phones in a live match start it when the second pick lands, so the
// reveal happens at the same moment on each screen.
export default function RpsCountdown({ onDone }) {
  const [step, setStep] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < WORDS.length - 1) setStep(step + 1);
      else doneRef.current();
    }, step < WORDS.length - 1 ? STEP_MS : STEP_MS * 0.8);
    return () => clearTimeout(timer);
  }, [step]);

  const shoot = step === WORDS.length - 1;
  return (
    <div className="rps-countdown" aria-live="assertive">
      <div className="rps-faceoff">
        {[0, 1].map((side) => (
          <span key={side} className={side ? 'rps-fist mirror' : 'rps-fist'}>
            <motion.span
              key={step}
              className="rps-emoji"
              initial={{ y: 0 }}
              animate={shoot ? { y: [0, 6, 0], scale: [1, 1.15, 1] } : { y: [0, -16, 0] }}
              transition={{ duration: shoot ? 0.25 : 0.35 }}
            >
              ✊
            </motion.span>
          </span>
        ))}
      </div>
      <motion.p
        key={step}
        className={`rps-countdown-word${shoot ? ' shoot' : ''}`}
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {WORDS[step]}
      </motion.p>
    </div>
  );
}
