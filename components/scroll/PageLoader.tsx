'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADER_VISIBLE_MS = 350;
const LOADER_FADE_MS = 250;
const LOADER_FALLBACK_MS = LOADER_VISIBLE_MS + LOADER_FADE_MS + 100;

export default function PageLoader() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const fallback = window.setTimeout(() => setVisible(false), LOADER_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [reduceMotion]);

  if (reduceMotion || !visible) {
    return null;
  }

  return (
    <m.div
      data-testid="page-loader"
      className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center bg-transparent"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: LOADER_FADE_MS / 1000, delay: LOADER_VISIBLE_MS / 1000 }}
      onAnimationComplete={() => setVisible(false)}
    >
      <m.p
        className="font-serif text-sm tracking-[0.35em] text-blue-300 uppercase"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        読み込み中
      </m.p>
    </m.div>
  );
}
