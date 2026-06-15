'use client';

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PhilosophyProgressDots from '@/components/PhilosophyProgressDots';
import TextReveal from '@/components/scroll/TextReveal';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { usePanelActiveIndex } from '@/lib/hooks/usePanelActiveIndex';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  gsap,
  refreshScrollTrigger,
  ScrollTrigger,
} from '@/lib/scroll/gsap-config';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';

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

const sectionLetters = sections.map((section) => section.letter);

export default function PhilosophyContent() {
  const reduceMotion = useReducedMotion();
  const { profile } = useDeviceProfile();
  const panelsRef = useRef<HTMLDivElement>(null);
  const activeIndex = usePanelActiveIndex(panelsRef);
  const enableSnap = !profile.isMobile && !profile.prefersCoarsePointer;

  useGsapContext(() => {
    if (!panelsRef.current) {
      return;
    }

    const panels = panelsRef.current.querySelectorAll('[data-philosophy-panel]');

    panels.forEach((panel) => {
      const letter = panel.querySelector('[data-overlay-letter]');

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

    if (enableSnap) {
      ScrollTrigger.create({
        trigger: panelsRef.current,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: 1 / (sections.length - 1),
          duration: ANIMATION_DURATION.section,
          ease: ANIMATION_EASE.section,
        },
      });
    }

    refreshScrollTrigger();
  }, [enableSnap]);

  return (
    <section className="relative bg-[var(--background)]">
      <PhilosophyProgressDots letters={sectionLetters} activeIndex={activeIndex} />

      <div ref={panelsRef}>
        {sections.map((item) => (
          <div
            key={item.letter}
            data-philosophy-panel
            className="relative flex min-h-svh items-center justify-center overflow-hidden py-[var(--space-section)] px-[var(--space-3)]"
            style={{
              background: `linear-gradient(180deg, var(--background) 0%, ${item.bgTint} 50%, var(--background) 100%)`,
            }}
          >
            <span
              data-overlay-letter
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-[200] leading-none type-font-serif text-[clamp(280px,40vw,560px)] text-[color:var(--foreground)]"
              style={{ opacity: 0.04 }}
            >
              {item.letter}
            </span>

            <div className="relative z-[1] max-w-[720px] text-center">
              <motion.div {...getScrollRevealProps(reduceMotion)}>
                <h2 className="mb-[var(--space-2)] type-size-subheading type-font-serif font-light tracking-[0.1em] text-[color:var(--foreground)]">
                  <TextReveal as="span" text={item.title} />
                </h2>
                <p className="mb-[var(--space-6)] type-size-body tracking-[0.15em] text-[color:var(--accent)]">
                  {item.subtitle}
                </p>
              </motion.div>

              <motion.p
                {...getScrollRevealProps(reduceMotion, { delay: 0.2 })}
                className="mb-[var(--space-4)] font-light leading-[1.9] type-font-serif-jp text-[clamp(18px,2.5vw,24px)] text-[color:var(--foreground)]"
              >
                {item.description}
              </motion.p>

              <motion.p
                {...getScrollRevealProps(reduceMotion, { delay: 0.35 })}
                className="leading-[2] type-size-body type-font-serif-jp text-[color:var(--muted)]"
              >
                {item.detail}
              </motion.p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex min-h-[60svh] items-center justify-center py-[var(--space-section)] px-[var(--space-3)] text-center">
        <div className="max-w-[800px]">
          <motion.h2
            {...getScrollRevealProps(reduceMotion)}
            className="mb-[var(--space-6)] font-light leading-[1.5] type-size-heading type-font-serif-jp text-[color:var(--foreground)]"
          >
            心理学とエンジニアリングの融合が
            <br />
            自己一致への道を照らす
          </motion.h2>
          <motion.a
            href="/contact"
            {...getScrollRevealProps(reduceMotion, { delay: 0.2 })}
            className="inline-block rounded-full border border-[var(--accent)] py-[var(--space-2)] px-[var(--space-4)] no-underline type-font-serif-jp text-[color:var(--accent)] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-base)]"
          >
            お問い合わせ
          </motion.a>
        </div>
      </div>
    </section>
  );
}
