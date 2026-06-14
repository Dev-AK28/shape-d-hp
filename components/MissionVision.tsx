'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import TextReveal from '@/components/scroll/TextReveal';
import { sectionHeadingClass } from '@/lib/design/section-typography-classes';
import { typographyFontClasses, typographySizeClasses } from '@/lib/design/tokens';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { ANIMATION_EASE, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

const visionQuotes = [
  '内なる価値観と外なる行動が一致する状態こそが、真の自己実現である。',
  '心理学で学んだこの概念が、エンジニアリングという具現化の技術と融合し、新たな価値を生み出す。',
  'AIによる効率化は、人間本来の創造性を解放するための手段に過ぎない。',
  '技術が代替不可能な、あなただけの「輪郭」を形にする。それが、SHAPE∞Dの存在意義。',
];

export default function MissionVision() {
  const reduceMotion = useReducedMotion();
  const { profile, isReady } = useDeviceProfile();
  const staticReveal = shouldUseStaticReveal(profile, reduceMotion, isReady);
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
      className="relative overflow-hidden py-[var(--space-section)] px-[var(--space-3)] bg-[rgba(10,10,10,0.72)] backdrop-blur-[2px]"
    >
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap ${typographyFontClasses.serif} ${typographySizeClasses.visualWord} font-light tracking-[0.08em] text-[color:var(--foreground)] opacity-[0.04]`}
      >
        SELF-CONGRUENCE
      </p>

      <div className="relative z-[1] mx-auto max-w-[var(--content-standard)]">
        <motion.div
          {...getScrollRevealProps(reduceMotion, { staticReveal })}
          className="mb-[var(--space-8)]"
        >
          <h2 className={sectionHeadingClass}>
            <TextReveal as="span" text="VISION" />
          </h2>
          <div className="h-px w-16 bg-[var(--accent)]" />
        </motion.div>

        <motion.p
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.15 })}
          className={`mb-[var(--space-8)] ${typographyFontClasses.serifJp} ${typographySizeClasses.subheading} font-light tracking-[0.06em] text-[color:var(--accent)]`}
        >
          自己一致（SELF-CONGRUENCE）への道
        </motion.p>

        <div ref={quotesRef}>
          {visionQuotes.map((quote) => (
            <blockquote
              key={quote}
              data-vision-quote
              className={`mb-[var(--space-6)] max-w-[36em] border-none p-0 ${typographyFontClasses.serifJp} ${typographySizeClasses.quote} font-light leading-[1.85] text-balance text-[color:var(--foreground)]`}
              style={{ opacity: staticReveal ? 1 : 0 }}
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
