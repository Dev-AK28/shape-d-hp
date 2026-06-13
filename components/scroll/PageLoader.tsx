'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useSyncExternalStore } from 'react';

function subscribeNoop() {
  return () => {};
}

export default function PageLoader() {
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!mounted || reduceMotion || dismissed) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
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
