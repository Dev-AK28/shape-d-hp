'use client';

import { useRef } from 'react';
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
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import {
  ABOUT_PIN_SCROLL,
  ANIMATION_DURATION,
  ANIMATION_EASE,
  REVEAL_OFFSET,
} from '@/lib/scroll/animation-tokens';

const career = [
  '心理学専攻で学士号を取得。学術的な人間理解の素地を築く。',
  'コカコーラボトラーズジャパンベンディングに入社。',
  'SNS起業で独立し、売上数百万円を達成。',
  '自己表現力向上事業の立ち上げを試み。',
  '現在はAIエンジニアとしての活動に注力。',
];

export default function About() {
  const { profile, staticReveal } = useStaticReveal();
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pillar1Ref = useRef<HTMLDivElement>(null);
  const pillar2Ref = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const historyCaptionRef = useRef<HTMLParagraphElement>(null);

  const isTouchDevice = isTouchInputDevice(profile);

  useGsapContext(() => {
    if (!sectionRef.current) return;

    const headingEl = headingRef.current;
    const pillar1El = pillar1Ref.current;
    const pillar2El = pillar2Ref.current;
    const historyItems = historyRef.current
      ? Array.from(
          historyRef.current.querySelectorAll<HTMLElement>('[data-timeline-item]'),
        ).slice(0, REVEAL_OFFSET.maxStaggerItems)
      : [];
    // Caption is included as the first element so it leads the stagger sequence.
    const allHistoryTargets = [historyCaptionRef.current, ...historyItems].filter(
      (el): el is HTMLElement => el !== null,
    );

    if (isTouchDevice) {
      // Mobile: simple stagger scroll-trigger reveals (no pin)
      const targets = [headingEl, pillar1El, pillar2El].filter(
        (el): el is NonNullable<typeof el> => el !== null,
      );
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: REVEAL_OFFSET.y },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_DURATION.base,
            ease: ANIMATION_EASE.base,
            stagger: REVEAL_OFFSET.stagger,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
      if (allHistoryTargets.length > 0) {
        gsap.fromTo(
          allHistoryTargets,
          { opacity: 0, y: REVEAL_OFFSET.y },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_DURATION.heroChild,
            ease: ANIMATION_EASE.base,
            stagger: REVEAL_OFFSET.stagger,
            scrollTrigger: {
              trigger: historyRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }
      return;
    }

    // Desktop: pin + scrub timeline
    const {
      headingRevealAt,
      headingRevealDuration,
      pillar1RevealAt,
      pillarRevealDuration,
      pillar2RevealAt,
      historyRevealAt,
      historyItemDuration,
      historyStagger,
    } = ABOUT_PIN_SCROLL;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: ABOUT_PIN_SCROLL.start,
        end: ABOUT_PIN_SCROLL.end,
        pin: true,
        scrub: ABOUT_PIN_SCROLL.scrub,
        anticipatePin: ABOUT_PIN_SCROLL.anticipatePin,
      },
    });

    if (headingEl) {
      tl.fromTo(
        headingEl,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: headingRevealDuration, ease: ANIMATION_EASE.reveal },
        headingRevealAt,
      );
    }
    if (pillar1El) {
      tl.fromTo(
        pillar1El,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: pillarRevealDuration, ease: ANIMATION_EASE.reveal },
        pillar1RevealAt,
      );
    }
    if (pillar2El) {
      tl.fromTo(
        pillar2El,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: pillarRevealDuration, ease: ANIMATION_EASE.reveal },
        pillar2RevealAt,
      );
    }
    if (allHistoryTargets.length > 0) {
      tl.fromTo(
        allHistoryTargets,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: historyItemDuration,
          stagger: historyStagger,
          ease: ANIMATION_EASE.base,
        },
        historyRevealAt,
      );
    }
  }, [isTouchDevice]);

  // staticReveal=true: content visible immediately (SSR / reduced-motion)
  // staticReveal=false: GSAP controls reveal; start at opacity:0
  const initialOpacity = staticReveal ? 1 : 0;

  return (
    <section
      ref={sectionRef}
      data-testid="about-section"
      className="relative py-[var(--space-section)] px-[var(--space-3)] bg-[rgba(10,10,10,0.62)] backdrop-blur-[2px]"
    >
      <div className="mx-auto max-w-[var(--content-wide)]">
        <div
          ref={headingRef}
          className="mb-[var(--space-8)]"
          style={{ opacity: initialOpacity }}
        >
          <h2 className={sectionHeadingClass}>
            {/* TextReveal immediate: parent div opacity is GSAP-controlled */}
            <TextReveal as="span" text="ABOUT" immediate />
          </h2>
          <div className={sectionAccentDividerClass} />
        </div>

        <div className="mb-[var(--space-8)] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[var(--space-6)]">
          <div
            ref={pillar1Ref}
            style={{ opacity: initialOpacity }}
          >
            <p className={sectionCaptionClass}>心理学</p>
            <p className={pillarTextClass}>
              人間理解の深淵。内なる声を読み解き、
              <br className="hidden md:block" />
              自己一致への道を照らす。
            </p>
          </div>

          <div
            ref={pillar2Ref}
            style={{ opacity: initialOpacity }}
          >
            <p className={sectionCaptionClass}>エンジニアリング</p>
            <p className={pillarTextClass}>
              AIによる圧倒的な速度。技術でアイデアを具現化し、
              <br className="hidden md:block" />
              事業価値を形にする。
            </p>
          </div>
        </div>

        <div ref={historyRef} className="mb-[var(--space-4)]">
          <p
            ref={historyCaptionRef}
            className={sectionHistoryCaptionClass}
            style={{ opacity: initialOpacity }}
          >
            経歴
          </p>
          <ul className="m-0 list-none border-l border-[var(--border)] py-0 pl-[var(--space-4)]">
            {career.map((item, index) => (
              <li
                key={item}
                data-timeline-item
                className="relative mb-[var(--space-4)]"
                style={{ opacity: initialOpacity }}
              >
                <span className="absolute -left-[calc(var(--space-4)+4px)] top-1.5 size-2 rounded-full bg-[var(--accent)]" />
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
