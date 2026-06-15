'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import TextReveal from '@/components/scroll/TextReveal';
import {
  pillarTextClass,
  sectionAccentDividerClass,
  sectionCaptionClass,
  sectionHeadingClass,
  sectionHistoryCaptionClass,
  timelineBodyClass,
  timelineIndexClass,
} from '@/lib/design/section-typography-classes';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { ANIMATION_EASE, REVEAL_OFFSET } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { shouldUseStaticReveal } from '@/lib/scroll/static-reveal';

const career = [
  '心理学専攻で学士号を取得。学術的な人間理解の素地を築く。',
  'コカコーラボトラーズジャパンベンディングに入社。',
  'SNS起業で独立し、売上数百万円を達成。',
  '自己表現力向上事業の立ち上げを試み。',
  '現在はAIエンジニアとしての活動に注力。',
];

export default function About() {
  const reduceMotion = useReducedMotion();
  const { profile, isReady } = useDeviceProfile();
  const staticReveal = shouldUseStaticReveal(profile, reduceMotion, isReady);
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

  return (
    <section
      className="relative py-[var(--space-section)] px-[var(--space-3)] bg-[rgba(10,10,10,0.62)] backdrop-blur-[2px]"
    >
      <div className="mx-auto max-w-[var(--content-wide)]">
        <motion.div
          {...getScrollRevealProps(reduceMotion, { staticReveal })}
          className="mb-[var(--space-8)]"
        >
          <h2 className={sectionHeadingClass}>
            <TextReveal as="span" text="ABOUT" />
          </h2>
          <div className={sectionAccentDividerClass} />
        </motion.div>

        <div
          className="mb-[var(--space-8)] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[var(--space-6)]"
        >
          <motion.div {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.1 })}>
            <p className={sectionCaptionClass}>心理学</p>
            <p className={pillarTextClass}>
              人間理解の深淵。内なる声を読み解き、
              <br className="hidden md:block" />
              自己一致への道を照らす。
            </p>
          </motion.div>

          <motion.div {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.25 })}>
            <p className={sectionCaptionClass}>エンジニアリング</p>
            <p className={pillarTextClass}>
              AIによる圧倒的な速度。技術でアイデアを具現化し、
              <br className="hidden md:block" />
              事業価値を形にする。
            </p>
          </motion.div>
        </div>

        <div className="mb-[var(--space-4)]">
          <p className={sectionHistoryCaptionClass}>経歴</p>

          <ul
            ref={timelineRef}
            className="m-0 list-none border-l border-[var(--border)] py-0 pl-[var(--space-4)]"
          >
            {career.map((item, index) => (
              <li
                key={item}
                data-timeline-item
                className={`relative mb-[var(--space-4)] ${staticReveal ? 'opacity-100' : 'opacity-0'}`}
              >
                <span
                  className="absolute -left-[calc(var(--space-4)+4px)] top-1.5 size-2 rounded-full bg-[var(--accent)]"
                />
                <span className={timelineIndexClass}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className={timelineBodyClass}>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
