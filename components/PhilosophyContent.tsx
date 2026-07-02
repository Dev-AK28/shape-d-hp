'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PhilosophyProgressDots from '@/components/PhilosophyProgressDots';
import TextReveal from '@/components/scroll/TextReveal';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { useFocusRestore } from '@/lib/hooks/useFocusRestore';
import { usePanelActiveIndex } from '@/lib/hooks/usePanelActiveIndex';
import { useHorizontalFocusSync } from '@/lib/hooks/useHorizontalFocusSync';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  gsap,
  refreshScrollTrigger,
  ScrollTrigger,
} from '@/lib/scroll/gsap-config';
import { PHILOSOPHY_HORIZONTAL } from '@/lib/scroll/animation-tokens';
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
  const { profile, reduceMotion, isReady, staticReveal } = useStaticReveal();
  const focusGuardRef = useFocusRestore(staticReveal);

  // sectionWrapperRef: pin/overflow target on desktop.
  // panelsRef: flex container that GSAP translates horizontally (also queried by IO hook).
  const sectionWrapperRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  // Timeline ref for refreshInit invalidation (resize handling — Issue #186).
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // GSAP-driven active index for horizontal scroll on desktop.
  const [gsapActiveIndex, setGsapActiveIndex] = useState(0);
  const setGsapActiveIndexRef = useRef(setGsapActiveIndex);
  // Keep GSAP onUpdate callback on the latest setter without re-running useGsapContext.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ref mirror only; GSAP setup must not re-init on setState identity changes
  useEffect(() => { setGsapActiveIndexRef.current = setGsapActiveIndex; });

  const isTouchDevice = isTouchInputDevice(profile);
  const enableHorizontal = !isTouchDevice;

  useHorizontalFocusSync(panelsRef, '[data-philosophy-panel]', tlRef, enableHorizontal);

  // Symmetric stale-value guard for gsapActiveIndex (#254): mirrors the
  // prevEnabled pattern in usePanelActiveIndex. When enableHorizontal flips
  // false→true (mobile→desktop), reset gsapActiveIndex to 0 synchronously
  // during render so the stale mobile-session value is never visible even
  // for a single frame before the new ScrollTrigger's first onUpdate fires.
  // useState (not useRef) is used for the comparison — mutating ref.current
  // during render trips react-hooks/refs.
  const [prevEnableHorizontal, setPrevEnableHorizontal] = useState(enableHorizontal);
  if (enableHorizontal !== prevEnableHorizontal) {
    setPrevEnableHorizontal(enableHorizontal);
    if (enableHorizontal) {
      setGsapActiveIndex(0);
    }
  }

  // IO-based index for mobile vertical mode. Disabled on desktop (#187,
  // enabled=false) so ioActiveIndex is always 0 there; on mobile (enabled=true)
  // IO is active but panel 0 is in view at page-top, so both paths return 0 and
  // match the SSR default during the brief pre-hydration window (isReady === false).
  // After hydration, gsapActiveIndex takes over on desktop and ioActiveIndex is
  // discarded entirely (PR #250 review round 5 nit).
  const ioActiveIndex = usePanelActiveIndex(panelsRef, { enabled: !enableHorizontal });

  const activeIndex = isReady && enableHorizontal ? gsapActiveIndex : ioActiveIndex;

  // Re-evaluate function-based x values whenever ScrollTrigger refreshes (e.g. on resize).
  // tl.invalidate() clears recorded start values so GSAP re-reads function-based tween sources on the next render.
  useEffect(() => {
    if (!enableHorizontal) return;
    const onRefreshInit = () => { tlRef.current?.invalidate(); };
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    return () => { ScrollTrigger.removeEventListener('refreshInit', onRefreshInit); };
  }, [enableHorizontal]);

  useGsapContext(() => {
    if (!panelsRef.current) {
      return;
    }

    const panels = Array.from(
      panelsRef.current.querySelectorAll<HTMLElement>('[data-philosophy-panel]'),
    );

    if (enableHorizontal && sectionWrapperRef.current) {
      // ── Desktop: horizontal pin-scroll ──────────────────────────────────────
      // Apply horizontal flex layout via GSAP (ctx.revert cleans inline styles on unmount).
      gsap.set(sectionWrapperRef.current, { overflow: 'hidden' });
      gsap.set(panelsRef.current, {
        display: 'flex',
        flexDirection: 'row',
        width: `${sections.length * 100}vw`,
      });
      gsap.set(panels, { width: '100vw', minHeight: '100svh', flexShrink: 0 });

      // Function-based distance so ScrollTrigger.refresh() (fired on resize)
      // re-evaluates end and x against the current viewport width (#186).
      const getScrollDistance = () => (sections.length - 1) * window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionWrapperRef.current,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: PHILOSOPHY_HORIZONTAL.scrub,
          onUpdate: (self) => {
            const index = Math.min(
              sections.length - 1,
              Math.round(self.progress * (sections.length - 1)),
            );
            setGsapActiveIndexRef.current(index);
          },
        },
      });

      // Horizontal pan animation — duration must be explicit so letter tweens
      // (positioned as fractions of panDuration) don't extend the timeline and
      // cause the pan to complete before all scroll distance is consumed.
      // x is function-based so tl.invalidate() (called on refreshInit) re-evaluates it.
      tl.to(panelsRef.current, { x: () => -getScrollDistance(), ease: 'none', duration: PHILOSOPHY_HORIZONTAL.panDuration });

      tlRef.current = tl;

      // Per-panel letter opacity: fades in at panel entry, peaks at center, fades out
      panels.forEach((panel, i) => {
        const letter = panel.querySelector('[data-overlay-letter]');
        if (!letter) return;
        const enterAt = (i / sections.length) * PHILOSOPHY_HORIZONTAL.panDuration;
        const centerAt = ((i + 0.5) / sections.length) * PHILOSOPHY_HORIZONTAL.panDuration;

        tl.fromTo(
          letter,
          { opacity: PHILOSOPHY_HORIZONTAL.letterOpacityBase },
          { opacity: PHILOSOPHY_HORIZONTAL.letterOpacityPeak, ease: 'power1.in', duration: PHILOSOPHY_HORIZONTAL.letterFadeDuration },
          enterAt,
        );
        tl.to(
          letter,
          { opacity: PHILOSOPHY_HORIZONTAL.letterOpacityBase, ease: 'power1.out', duration: PHILOSOPHY_HORIZONTAL.letterFadeDuration },
          centerAt,
        );
      });
    } else {
      // ── Mobile: vertical scroll with snap (existing behaviour) ──────────────
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
  }, [enableHorizontal]);

  return (
    <section ref={focusGuardRef} className="relative bg-[var(--background)]">
      <PhilosophyProgressDots letters={sectionLetters} activeIndex={activeIndex} />

      {/* sectionWrapperRef = pin target; panelsRef = horizontal flex container */}
      <div ref={sectionWrapperRef}>
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
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-[200] leading-none type-font-serif text-[clamp(280px,40vw,560px)] text-[color:var(--foreground)] opacity-[0.04]"
            >
              {item.letter}
            </span>

            <div className="relative z-[1] max-w-[720px] text-center">
              <motion.div
                key={staticReveal ? `static-${item.letter}-heading` : `reveal-${item.letter}-heading`}
                {...getScrollRevealProps(reduceMotion, { staticReveal, isMobile: isTouchDevice })}
              >
                <h2 className="mb-[var(--space-2)] type-size-subheading type-font-serif font-light tracking-[0.1em] text-[color:var(--foreground)]">
                  <TextReveal as="span" text={item.title} />
                </h2>
                <p className="mb-[var(--space-6)] type-size-body tracking-[0.15em] text-[color:var(--accent)]">
                  {item.subtitle}
                </p>
              </motion.div>

              <motion.p
                key={staticReveal ? `static-${item.letter}-body` : `reveal-${item.letter}-body`}
                {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.2, isMobile: isTouchDevice })}
                className="mb-[var(--space-4)] font-light leading-[1.9] type-font-serif-jp text-[clamp(18px,2.5vw,24px)] text-[color:var(--foreground)]"
              >
                {item.description}
              </motion.p>

              <motion.p
                key={staticReveal ? `static-${item.letter}-detail` : `reveal-${item.letter}-detail`}
                {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.35, isMobile: isTouchDevice })}
                className="leading-[2] type-size-body type-font-serif-jp text-[color:var(--muted)]"
              >
                {item.detail}
              </motion.p>
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="flex min-h-[60svh] items-center justify-center py-[var(--space-section)] px-[var(--space-3)] text-center">
        <div className="max-w-[800px]">
          <motion.h2
            key={staticReveal ? 'static-closing-heading' : 'reveal-closing-heading'}
            {...getScrollRevealProps(reduceMotion, { staticReveal, isMobile: isTouchDevice })}
            className="mb-[var(--space-6)] font-light leading-[1.5] type-size-heading type-font-serif-jp text-[color:var(--foreground)]"
          >
            心理学とエンジニアリングの融合が
            <br />
            自己一致への道を照らす
          </motion.h2>
          <motion.a
            key={staticReveal ? 'static-closing-cta' : 'reveal-closing-cta'}
            href="/contact"
            {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.2, isMobile: isTouchDevice })}
            className="inline-block rounded-full border border-[var(--accent)] py-[var(--space-2)] px-[var(--space-4)] no-underline type-font-serif-jp text-[color:var(--accent)] transition-opacity duration-[var(--duration-base)] ease-[var(--ease-base)]"
          >
            お問い合わせ
          </motion.a>
        </div>
      </div>
    </section>
  );
}
