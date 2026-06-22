'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useRef, type HTMLAttributes, type ReactNode } from 'react';

type ParallaxSectionProps = HTMLAttributes<HTMLDivElement> & {
  offset?: number;
  children: ReactNode;
};

export default function ParallaxSection({
  children,
  offset = 40,
  className,
  style,
}: ParallaxSectionProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  if (reduceMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ ...style, y }}>
      {children}
    </motion.div>
  );
}
