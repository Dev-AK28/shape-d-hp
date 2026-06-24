'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { useFocusRestore } from '@/lib/hooks/useFocusRestore';
import { gsap, ScrollTrigger } from '@/lib/scroll/gsap-config';
import { SHOWCASE_HORIZONTAL } from '@/lib/scroll/animation-tokens';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { colors } from '@/lib/design/tokens';

const services = [
  {
    id: 'ai-product',
    index: '01',
    category: 'Digital Solution',
    title: 'AIプロダクト開発',
    description:
      '着想を、鮮度を保ったまま形にする。最新のAIスタックを指揮し、事業の核を最短距離でプロダクトへと昇華させます。',
    tagline: '着想の鮮度を保ち、市場投入のリードタイムを短縮',
    categoryColor: colors.blue,
  },
  {
    id: 'dx',
    index: '02',
    category: 'Digital Solution',
    title: '業務自動化・DX支援',
    description:
      '思考のノイズを削ぎ落とし、本来の創造性に没頭できる環境を構築。ルーティンをAIに委ね、淀みのないワークフローを実現します。',
    tagline: '創造的業務への集中時間を最大化',
    categoryColor: colors.blue,
  },
  {
    id: 'web-app',
    index: '03',
    category: 'Digital Solution',
    title: 'Webアプリ・モバイルアプリ開発',
    description:
      '最新のAI活用手法による圧倒的な納期短縮。モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。',
    tagline: 'ユーザー体験の最適化とスケーラビリティの確保',
    categoryColor: colors.blue,
  },
  {
    id: 'coaching',
    index: '04',
    category: 'Human Solution',
    title: '自己表現コーチング',
    description:
      'AI時代に代替不可能な『個』の価値を最大化。心理学士の視点から、自覚・言語化・表現の3スキルを習得し、自己一致した生き方を支援します。',
    tagline: '個の資本化と自己一致した生き方の実現',
    categoryColor: colors.accent,
  },
] as const;

export default function ShowcaseSection() {
  const { profile, reduceMotion, isReady, staticReveal } = useStaticReveal();
  const focusGuardRef = useFocusRestore(staticReveal);

  const sectionWrapperRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const isTouchDevice = isTouchInputDevice(profile);
  const enableHorizontal = isReady && !isTouchDevice;

  // Re-evaluate function-based x values on resize (same pattern as PhilosophyContent #186).
  useEffect(() => {
    if (!enableHorizontal) return;
    const onRefreshInit = () => { tlRef.current?.invalidate(); };
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    return () => { ScrollTrigger.removeEventListener('refreshInit', onRefreshInit); };
  }, [enableHorizontal]);

  useGsapContext(() => {
    if (!panelsRef.current) return;

    const panels = Array.from(
      panelsRef.current.querySelectorAll<HTMLElement>('[data-showcase-card]'),
    );

    if (enableHorizontal && sectionWrapperRef.current) {
      gsap.set(sectionWrapperRef.current, { overflow: 'hidden' });
      gsap.set(panelsRef.current, {
        display: 'flex',
        flexDirection: 'row',
        width: `${services.length * 100}vw`,
      });
      gsap.set(panels, { width: '100vw', minHeight: '100svh', flexShrink: 0 });

      const getScrollDistance = () => (services.length - 1) * window.innerWidth;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionWrapperRef.current,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: SHOWCASE_HORIZONTAL.scrub,
        },
      });

      tl.to(panelsRef.current, {
        x: () => -getScrollDistance(),
        ease: 'none',
        duration: SHOWCASE_HORIZONTAL.panDuration,
      });

      tlRef.current = tl;
    }
  }, [isReady]);

  return (
    <section
      ref={focusGuardRef}
      aria-label="サービス紹介"
      style={{ position: 'relative', background: colors.background }}
    >
      {/* Desktop: horizontal pin-scroll wrapper */}
      <div ref={sectionWrapperRef}>
        {/* panelsRef: flex row on desktop, block on mobile */}
        <div ref={panelsRef}>
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              data-showcase-card
              {...getScrollRevealProps(reduceMotion, { staticReveal, isMobile: isTouchDevice, delay: i * 0.12 })}
              style={{
                minHeight: '100svh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(48px, 8vw, 120px) clamp(24px, 6vw, 80px)',
                borderTop: `1px solid ${colors.border}`,
                position: 'relative',
              }}
            >
              {/* Service number — large decorative background numeral */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 'clamp(24px, 4vw, 48px)',
                  right: 'clamp(24px, 6vw, 80px)',
                  fontSize: 'clamp(80px, 12vw, 160px)',
                  fontFamily: 'var(--font-display, serif)',
                  fontWeight: 700,
                  color: 'rgba(240, 240, 240, 0.04)',
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {service.index}
              </span>

              <div style={{ maxWidth: '560px', width: '100%', position: 'relative', zIndex: 1 }}>
                {/* Category label */}
                <p
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: service.categoryColor,
                    marginBottom: '20px',
                    fontWeight: 500,
                  }}
                >
                  {service.category}
                </p>

                {/* Title */}
                <h2
                  style={{
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    fontWeight: 300,
                    fontFamily: 'var(--font-serif-jp, serif)',
                    color: colors.foreground,
                    lineHeight: 1.3,
                    letterSpacing: '0.02em',
                    marginBottom: '28px',
                  }}
                >
                  {service.title}
                </h2>

                {/* Description */}
                <p
                  style={{
                    fontSize: 'clamp(14px, 1.4vw, 16px)',
                    lineHeight: 1.8,
                    color: colors.muted,
                    marginBottom: '24px',
                  }}
                >
                  {service.description}
                </p>

                {/* Tagline */}
                <p
                  style={{
                    fontSize: '13px',
                    color: colors.accentSubtle,
                    fontStyle: 'italic',
                    letterSpacing: '0.02em',
                    marginBottom: '40px',
                    paddingLeft: '12px',
                    borderLeft: `2px solid ${colors.accentSubtle}`,
                  }}
                >
                  {service.tagline}
                </p>

                {/* CTA */}
                <Link
                  href="/services"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: colors.foreground,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: '4px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  詳しく見る
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
