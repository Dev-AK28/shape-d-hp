'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

const LOADER_VISIBLE_MS = 650;
const LOADER_FADE_MS = 400;
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
    <motion.div
      data-testid="page-loader"
      className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: LOADER_FADE_MS / 1000, delay: LOADER_VISIBLE_MS / 1000 }}
      onAnimationComplete={() => setVisible(false)}
    >
      <motion.p
        className="font-serif text-sm tracking-[0.35em] text-blue-300 uppercase"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        読み込み中
      </motion.p>
    </motion.div>
  );
}
