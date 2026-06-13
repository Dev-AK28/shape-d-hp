'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { scrollEase, scrollViewport } from '@/lib/scroll/easing';

type TextRevealProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
};

export default function TextReveal({
  text,
  as: Tag = 'p',
  className = '',
  delay = 0,
}: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.06,
            ease: scrollEase,
          }}
          viewport={scrollViewport}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
