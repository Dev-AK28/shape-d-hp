'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import {
  scrollEase,
  scrollTransition,
  scrollViewport,
  textRevealDurationScale,
  textRevealStagger,
} from '@/lib/scroll/easing';
import { REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  /** Force immediate render without scroll-driven segments. */
  immediate?: boolean;
};

function segmentText(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
    return [...segmenter.segment(text)].map((part) => part.segment);
  }

  return text.includes(' ') ? text.split(' ') : [...text];
}

export default function TextReveal({
  text,
  as: Tag = 'p',
  className = '',
  delay = 0,
  immediate = false,
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const { profile } = useDeviceProfile();
  const segments = segmentText(text);
  const showImmediately =
    immediate || shouldUseStaticReveal(profile, reduceMotion);

  if (showImmediately) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          initial={{ opacity: 0, y: REVEAL_OFFSET.y }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: scrollTransition.duration * textRevealDurationScale,
            delay: delay + index * textRevealStagger,
            ease: scrollEase,
          }}
          viewport={scrollViewport}
          className="inline-block"
        >
          {segment}
          {text.includes(' ') && index < segments.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </Tag>
  );
}
