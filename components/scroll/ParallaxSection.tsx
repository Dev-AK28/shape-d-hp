'use client';

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
} from 'framer-motion';
import { useRef, type HTMLAttributes, type ReactNode } from 'react';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';

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

type StaggerItemProps = HTMLMotionProps<'div'> & {
  index: number;
  baseDelay?: number;
  staggerStep?: number;
};

/** @deprecated Unused export — if adopted, pass `useStaticReveal().staticReveal` to `getScrollRevealProps` (#151). */
export function StaggerItem({
  children,
  index,
  baseDelay = 0,
  staggerStep = REVEAL_OFFSET.stagger,
  ...props
}: StaggerItemProps) {
  const { reduceMotion, staticReveal, profile } = useStaticReveal();
  const revealProps = getScrollRevealProps(reduceMotion, {
    staticReveal,
    delay: baseDelay,
    staggerIndex: index,
    staggerStep,
    variant: 'fadeLeft',
  });

  const motionRevealProps = revealProps.animate
    ? { animate: revealProps.animate }
    : {
        whileInView: revealProps.whileInView,
        viewport: revealProps.viewport,
      };

  return (
    <motion.div
      key={profile.isMobile ? 'mobile' : 'desktop'}
      initial={revealProps.initial}
      transition={revealProps.transition}
      {...motionRevealProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}
