'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import TextReveal from '@/components/scroll/TextReveal';
import { colors, layout, spacing, typography } from '@/lib/design/tokens';
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
      style={{
        position: 'relative',
        padding: `${spacing.section}px var(--space-3)`,
        background: 'rgba(10, 10, 10, 0.72)',
        backdropFilter: 'blur(2px)',
        overflow: 'hidden',
      }}
    >
      <p
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(40px, 10vw, 140px)',
          fontWeight: 300,
          fontFamily: typography.fontDisplay,
          color: colors.foreground,
          opacity: 0.04,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        SELF-CONGRUENCE
      </p>

      <div
        style={{
          maxWidth: layout.contentStandard,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div
          {...getScrollRevealProps(reduceMotion, { staticReveal })}
          style={{ marginBottom: spacing.xxl }}
        >
          <h2
            style={{
              fontSize: typography.sizeHeading,
              fontWeight: 300,
              color: colors.foreground,
              marginBottom: spacing.sm,
              fontFamily: typography.fontDisplay,
              letterSpacing: '0.05em',
            }}
          >
            <TextReveal as="span" text="VISION" />
          </h2>
          <div style={{ width: '64px', height: '1px', background: colors.accent }} />
        </motion.div>

        <motion.p
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.15 })}
          style={{
            fontSize: typography.sizeSubheading,
            color: colors.accent,
            marginBottom: spacing.xxl,
            fontFamily: typography.fontSerifJp,
            fontWeight: 300,
            letterSpacing: '0.06em',
          }}
        >
          自己一致（SELF-CONGRUENCE）への道
        </motion.p>

        <div ref={quotesRef}>
          {visionQuotes.map((quote) => (
            <blockquote
              key={quote}
              data-vision-quote
              style={{
                fontSize: typography.sizeQuote,
                color: colors.foreground,
                lineHeight: 1.85,
                fontFamily: typography.fontSerifJp,
                fontWeight: 300,
                margin: `0 0 ${spacing.xl}px`,
                padding: 0,
                border: 'none',
                opacity: staticReveal ? 1 : 0,
                maxWidth: '36em',
                textWrap: 'balance',
              }}
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
