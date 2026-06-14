'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { colors, typography } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { ANIMATION_EASE } from '@/lib/scroll/gsap-config';
import type { ReactNode } from 'react';

type HeroProps = {
  children?: ReactNode;
};

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    if (!sectionRef.current || !logoRef.current || !copyRef.current) {
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: 1.6,
        anticipatePin: 1,
      },
    });

    timeline.to(
      logoRef.current,
      {
        scale: 0.35,
        opacity: 0,
        y: -40,
        ease: ANIMATION_EASE.base,
      },
      0,
    );

    timeline.fromTo(
      copyRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, ease: ANIMATION_EASE.base },
      0.35,
    );
  }, []);

  const showCopyImmediately = reduceMotion === true;

  return (
    <section
      ref={sectionRef}
      className="noise-bg"
      style={{
        position: 'relative',
        height: '100svh',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${colors.background} 0%, #111111 100%)`,
      }}
    >
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontSize: typography.sizeHero,
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: colors.foreground,
            margin: 0,
            fontFamily: typography.fontDisplay,
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          SHAPE
          <span style={{ color: colors.accent, display: 'inline-block' }}>&infin;</span>
          D
        </p>
      </div>

      <div
        ref={copyRef}
        style={{
          position: 'relative',
          zIndex: 20,
          textAlign: 'center',
          padding: '0 var(--space-3)',
          maxWidth: '900px',
          opacity: showCopyImmediately ? 1 : 0,
        }}
      >
        {children}

        <p
          style={{
            fontSize: typography.sizeBody,
            color: colors.muted,
            lineHeight: 1.9,
            fontFamily: typography.fontSerifJp,
            fontWeight: 300,
            marginTop: 'var(--space-4)',
            letterSpacing: '0.04em',
          }}
        >
          爆速・安全・低コスト——技術の余白に、創造性を。
          <br />
          AIを指揮し、本来の事業価値を形にする環境を創ります。
        </p>

        <div
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
          <a
            href="/contact"
            className="hero-cta"
            style={{
              display: 'inline-block',
              padding: 'var(--space-2) var(--space-6)',
              border: `1px solid ${colors.accent}`,
              borderRadius: '9999px',
              color: colors.accent,
              background: 'transparent',
              fontSize: typography.sizeBody,
              fontFamily: typography.fontSerifJp,
              textDecoration: 'none',
              letterSpacing: '0.08em',
              transition: 'opacity var(--duration-base) var(--ease-base)',
            }}
          >
            お問い合わせ
          </a>
        </div>
      </div>
    </section>
  );
}
