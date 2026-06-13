'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useSyncExternalStore } from 'react';

const FADE_DELAY_S = 0.45;
const FADE_DURATION_S = 0.5;
const DISMISS_FALLBACK_MS = Math.round((FADE_DELAY_S + FADE_DURATION_S) * 1000) + 500;

function subscribeNoop() {
  return () => {};
}

export default function PageLoader() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!mounted || reduceMotion || dismissed) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDismissed(true);
    }, DISMISS_FALLBACK_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [mounted, reduceMotion, dismissed]);

  if (!mounted || reduceMotion || dismissed) {
    return null;
  }

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: FADE_DURATION_S, delay: FADE_DELAY_S }}
      onAnimationComplete={() => setDismissed(true)}
    >
      <motion.p
        className="font-serif text-sm tracking-[0.35em] text-blue-300 uppercase"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Loading experience
      </motion.p>
    </motion.div>
  );
}
