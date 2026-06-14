'use client';

import { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TextReveal from '@/components/scroll/TextReveal';
import { colors, spacing, typography } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { ANIMATION_DURATION, ANIMATION_EASE } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { motion } from 'framer-motion';

const sections = [
  {
    letter: 'S',
    title: 'SELF-CONGRUENCE',
    subtitle: '自己一致',
    description:
      '心理学で学んだ人間理解の深淵。内なる声と外なる行動が響き合う瞬間を、言葉にする。',
    detail:
      '心理学専攻で学士号を取得した経験から、人間の心の奥底にあるものを理解する力を養いました。',
    bgTint: 'rgba(196, 181, 160, 0.02)',
  },
  {
    letter: 'H',
    title: 'HUMAN EXPRESSION',
    subtitle: '人間的表現',
    description: '効率化の果てに、なお残る人間固有の輝き。それを形にする。',
    detail: 'AIが代替不可能な、あなただけの「輪郭」を。',
    bgTint: 'rgba(240, 240, 240, 0.015)',
  },
  {
    letter: 'A',
    title: 'AUTHENTIC',
    subtitle: '本来性',
    description: '他者の期待に応えるのではなく、本来の自分を生きる。',
    detail: '本来の自分を生きる、そのための表現力を引き出す。',
    bgTint: 'rgba(196, 181, 160, 0.025)',
  },
  {
    letter: 'P',
    title: 'PROMOTION',
    subtitle: '促進・繋がりを広げる',
    description: '自己表現が、他者との繋がりを生み、世界を広げる。',
    detail: 'より多くの人が本来の自分を表現し、豊かな繋がりを築ける社会を目指します。',
    bgTint: 'rgba(240, 240, 240, 0.012)',
  },
  {
    letter: 'E',
    title: 'EXPRESSION DEVELOPMENT',
    subtitle: '表現の育成',
    description: '表現力は、育つもの。技術と心で、その成長を支える。',
    detail: '心理学の専門的知見と、エンジニアリングの技術力。この二つが融合します。',
    bgTint: 'rgba(196, 181, 160, 0.018)',
  },
  {
    letter: 'D',
    title: 'Development / Depth / Discovery',
    subtitle: '多様なDの意味',
    description: '開発、深さ、発見、設計、多様性、方向性。全てが自己一致へと繋がる。',
    detail: 'エンジニアリングの技術で具現化し、心理学の人間理解で深さを加える。',
    bgTint: 'rgba(240, 240, 240, 0.02)',
  },
] as const;

export default function PhilosophyContent() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGsapContext(() => {
    if (!containerRef.current) {
      return;
    }

    const panels = containerRef.current.querySelectorAll('[data-philosophy-panel]');

    panels.forEach((panel, index) => {
      const letter = panel.querySelector('[data-overlay-letter]');

      ScrollTrigger.create({
        trigger: panel,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveIndex(index),
        onEnterBack: () => setActiveIndex(index),
      });

      if (letter) {
        gsap.fromTo(
          letter,
          { opacity: 0.04 },
          {
            opacity: 0.08,
            duration: ANIMATION_DURATION.section,
            ease: ANIMATION_EASE.section,
            scrollTrigger: {
              trigger: panel,
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: true,
            },
          },
        );
      }
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      snap: {
        snapTo: 1 / (sections.length - 1),
        duration: ANIMATION_DURATION.section,
        ease: ANIMATION_EASE.section,
      },
    });
  }, []);

  return (
    <section style={{ position: 'relative', background: colors.background }}>
      <nav
        aria-label="Philosophy section progress"
        style={{
          position: 'fixed',
          right: 'var(--space-3)',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {sections.map((item, index) => (
          <span
            key={item.letter}
            aria-current={activeIndex === index ? 'step' : undefined}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activeIndex === index ? colors.accent : colors.border,
              transition: 'background var(--duration-base) var(--ease-base)',
            }}
          />
        ))}
      </nav>

      <div ref={containerRef}>
        {sections.map((item) => (
          <div
            key={item.letter}
            data-philosophy-panel
            style={{
              minHeight: '100svh',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${spacing.section}px var(--space-3)`,
              background: `linear-gradient(180deg, ${colors.background} 0%, ${item.bgTint} 50%, ${colors.background} 100%)`,
              overflow: 'hidden',
            }}
          >
            <span
              data-overlay-letter
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'clamp(280px, 40vw, 560px)',
                fontWeight: 200,
                fontFamily: typography.fontDisplay,
                color: colors.foreground,
                opacity: 0.06,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {item.letter}
            </span>

            <div style={{ maxWidth: '720px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <motion.div {...getScrollRevealProps(reduceMotion)}>
                <h2
                  style={{
                    fontSize: typography.sizeSubheading,
                    fontWeight: 300,
                    color: colors.foreground,
                    marginBottom: spacing.sm,
                    fontFamily: typography.fontDisplay,
                    letterSpacing: '0.1em',
                  }}
                >
                  <TextReveal as="span" text={item.title} />
                </h2>
                <p
                  style={{
                    fontSize: typography.sizeBody,
                    color: colors.accent,
                    letterSpacing: '0.15em',
                    marginBottom: spacing.xl,
                  }}
                >
                  {item.subtitle}
                </p>
              </motion.div>

              <motion.p
                {...getScrollRevealProps(reduceMotion, { delay: 0.2 })}
                style={{
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  color: colors.foreground,
                  lineHeight: 1.9,
                  fontFamily: typography.fontSerifJp,
                  fontWeight: 300,
                  marginBottom: spacing.lg,
                }}
              >
                {item.description}
              </motion.p>

              <motion.p
                {...getScrollRevealProps(reduceMotion, { delay: 0.35 })}
                style={{
                  fontSize: typography.sizeBody,
                  color: colors.muted,
                  lineHeight: 2,
                  fontFamily: typography.fontSerifJp,
                }}
              >
                {item.detail}
              </motion.p>
            </div>
          </div>
        ))}

        <div
          style={{
            minHeight: '60svh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${spacing.section}px var(--space-3)`,
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '800px' }}>
            <motion.h2
              {...getScrollRevealProps(reduceMotion)}
              style={{
                fontSize: typography.sizeHeading,
                fontWeight: 300,
                color: colors.foreground,
                fontFamily: typography.fontSerifJp,
                lineHeight: 1.5,
                marginBottom: spacing.xl,
              }}
            >
              心理学とエンジニアリングの融合が
              <br />
              自己一致への道を照らす
            </motion.h2>
            <motion.a
              href="/contact"
              {...getScrollRevealProps(reduceMotion, { delay: 0.2 })}
              style={{
                display: 'inline-block',
                padding: 'var(--space-2) var(--space-4)',
                border: `1px solid ${colors.accent}`,
                borderRadius: '9999px',
                color: colors.accent,
                textDecoration: 'none',
                fontFamily: typography.fontSerifJp,
                transition: 'opacity var(--duration-base) var(--ease-base)',
              }}
            >
              お問い合わせ
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
