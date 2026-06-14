'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import TextReveal from '@/components/scroll/TextReveal';
import { colors, spacing, typography } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { ANIMATION_EASE, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { motion } from 'framer-motion';

const career = [
  '心理学専攻で学士号を取得。学術的な人間理解の素地を築く。',
  'コカコーラボトラーズジャパンベンディングに入社。',
  'SNS起業で独立し、売上数百万円を達成。',
  '自己表現力向上事業の立ち上げを試み。',
  '現在はAIエンジニアとしての活動に注力。',
];

export default function About() {
  const reduceMotion = useReducedMotion();
  const timelineRef = useRef<HTMLUListElement>(null);

  useGsapContext(() => {
    if (!timelineRef.current) {
      return;
    }

    const items = timelineRef.current.querySelectorAll('[data-timeline-item]');
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
          trigger: timelineRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      },
    );
  }, []);

  const sectionStyle = {
    position: 'relative' as const,
    padding: `${spacing.section}px var(--space-3)`,
    background: colors.background,
  };

  return (
    <section style={sectionStyle}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div {...getScrollRevealProps(reduceMotion)} style={{ marginBottom: spacing.xxl }}>
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
            <TextReveal as="span" text="ABOUT" />
          </h2>
          <div style={{ width: '64px', height: '1px', background: colors.accent }} />
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: spacing.xl,
            marginBottom: spacing.xxl,
          }}
        >
          <motion.div {...getScrollRevealProps(reduceMotion, { delay: 0.1 })}>
            <p
              style={{
                fontSize: typography.sizeCaption,
                color: colors.muted,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: spacing.sm,
              }}
            >
              心理学
            </p>
            <p
              style={{
                fontSize: typography.sizeSubheading,
                color: colors.foreground,
                lineHeight: 1.8,
                fontFamily: typography.fontSerifJp,
                fontWeight: 300,
              }}
            >
              人間理解の深淵。内なる声を読み解き、自己一致への道を照らす。
            </p>
          </motion.div>

          <motion.div {...getScrollRevealProps(reduceMotion, { delay: 0.25 })}>
            <p
              style={{
                fontSize: typography.sizeCaption,
                color: colors.muted,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: spacing.sm,
              }}
            >
              エンジニアリング
            </p>
            <p
              style={{
                fontSize: typography.sizeSubheading,
                color: colors.foreground,
                lineHeight: 1.8,
                fontFamily: typography.fontSerifJp,
                fontWeight: 300,
              }}
            >
              AIによる圧倒的な速度。技術でアイデアを具現化し、事業価値を形にする。
            </p>
          </motion.div>
        </div>

        <div style={{ marginBottom: spacing.lg }}>
          <p
            style={{
              fontSize: typography.sizeCaption,
              color: colors.muted,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: spacing.lg,
            }}
          >
            経歴
          </p>

          <ul
            ref={timelineRef}
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              borderLeft: `1px solid ${colors.border}`,
              paddingLeft: spacing.lg,
            }}
          >
            {career.map((item, index) => (
              <li
                key={item}
                data-timeline-item
                style={{
                  marginBottom: spacing.lg,
                  position: 'relative',
                  opacity: reduceMotion ? 1 : 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: `-${spacing.lg + 4}px`,
                    top: '6px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.accent,
                  }}
                />
                <span
                  style={{
                    display: 'block',
                    fontSize: typography.sizeCaption,
                    color: colors.muted,
                    marginBottom: spacing.xs,
                    fontFamily: typography.fontDisplay,
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p
                  style={{
                    color: colors.foreground,
                    fontSize: typography.sizeBody,
                    lineHeight: 1.8,
                    fontFamily: typography.fontSerifJp,
                    margin: 0,
                  }}
                >
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
