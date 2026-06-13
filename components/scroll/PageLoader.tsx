'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PageLoader() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(!reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      onAnimationComplete={() => setVisible(false)}
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
