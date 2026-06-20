'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import TextReveal from '@/components/scroll/TextReveal';
import {
  sectionAccentDividerClass,
  sectionHeadingClass,
  visualWordClass,
  visionLeadClass,
  visionQuoteClass,
} from '@/lib/design/section-typography-classes';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { ANIMATION_EASE, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';

const visionQuotes = [
  '内なる価値観と外なる行動が一致する状態こそが、真の自己実現である。',
  '心理学で学んだこの概念が、エンジニアリングという具現化の技術と融合し、新たな価値を生み出す。',
  'AIによる効率化は、人間本来の創造性を解放するための手段に過ぎない。',
  '技術が代替不可能な、あなただけの「輪郭」を形にする。それが、SHAPE∞Dの存在意義。',
];

export default function MissionVision() {
  const { reduceMotion, staticReveal } = useStaticReveal();
  const quotesRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    if (!quotesRef.current) {
      return;
    }

    const items = quotesRef.current.querySelectorAll('[data-vision-quote]');
    const limited = Array.from(items).slice(0, REVEAL_OFFSET.maxStaggerItems);

    gsap.fromTo(
      limited,
      { opacity: 0, y: REVEAL_OFFSET.y },
      {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: ANIMATION_EASE.base,
        stagger: REVEAL_OFFSET.stagger,
        scrollTrigger: {
          trigger: quotesRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      },
    );
  }, []);

  return (
    <section
      className="relative py-[var(--space-section)] px-[var(--space-3)] bg-[rgba(10,10,10,0.72)] backdrop-blur-[2px]"
    >
      {/* overflow-hidden: clips the absolutely positioned <p> to section boundaries,
          preventing it from disrupting compositing layers of elements within this section (#150). */}
      {/* pointer-events-none is intentional and non-redundant with the
          pointer-events-none inside visualWordClass (on the child <p>):
          absolute inset-0 covers the full section, so without it the empty areas outside <p>
          would block click/tap events on section content.
          Keeping pointer-events-none also aligns with aria-hidden="true" best practice:
          an element hidden from the accessibility tree should not intercept mouse/touch
          input from sighted users (#158). */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <p className={visualWordClass}>
          SELF-CONGRUENCE
        </p>
      </div>

      <div className="relative z-[1] mx-auto max-w-[var(--content-standard)]">
        <motion.div
          {...getScrollRevealProps(reduceMotion, { staticReveal })}
          className="mb-[var(--space-8)]"
        >
          <h2 className={sectionHeadingClass}>
            <TextReveal as="span" text="VISION" />
          </h2>
          <div className={sectionAccentDividerClass} />
        </motion.div>

        <motion.p
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.15 })}
          className={visionLeadClass}
        >
          自己一致（SELF-CONGRUENCE）への道
        </motion.p>

        <div ref={quotesRef}>
          {visionQuotes.map((quote) => (
            <blockquote
              key={quote}
              data-vision-quote
              className={`${visionQuoteClass} ${staticReveal ? 'opacity-100' : 'opacity-0'}`}
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
