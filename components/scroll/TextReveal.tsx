'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollEase, scrollViewport } from '@/lib/scroll/easing';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
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
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const segments = segmentText(text);

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.06,
            ease: scrollEase,
          }}
          viewport={scrollViewport}
          className="inline-block"
        >
          {segment}
        </motion.span>
      ))}
    </Tag>
  );
}
