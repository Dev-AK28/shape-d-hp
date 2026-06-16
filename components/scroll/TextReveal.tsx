'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import {
  scrollEase,
  scrollTransition,
  scrollViewport,
  textRevealDurationScale,
  textRevealStagger,
} from '@/lib/scroll/easing';
import { REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { typographyBlend } from '@/lib/design/tokens';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  /** Force immediate render without scroll-driven segments. */
  immediate?: boolean;
  /** Cosmic = screen blend over nebula; solid = normal (default). */
  blend?: 'cosmic' | 'solid';
};

function mergeBlendClass(className: string, blend: 'cosmic' | 'solid'): string {
  const blendClass =
    blend === 'cosmic' ? typographyBlend.classCosmic : typographyBlend.classSolid;

  return [blendClass, className].filter(Boolean).join(' ');
}

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
  blend = 'solid',
}: TextRevealProps) {
  const { staticReveal } = useStaticReveal();
  const segments = segmentText(text);
  // Latch first-paint staticReveal (!isReady) so hydration cannot flip back to IO mode (#151).
  // Also react to profile.isMobile changes (e.g. viewport resize) via live staticReveal.
  const [initialStaticReveal] = useState(() => staticReveal);
  const showImmediately = immediate || staticReveal || initialStaticReveal;
  const mergedClassName = mergeBlendClass(className, blend);

  if (showImmediately) {
    return <Tag className={mergedClassName}>{text}</Tag>;
  }

  return (
    <Tag className={mergedClassName}>
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
