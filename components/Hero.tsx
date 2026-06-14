'use client';

import { useRef } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { colors, typography } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  gsap,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';
import type { ReactNode } from 'react';

export type HeroVariant = 'immersive' | 'brand';

type HeroProps = {
  children?: ReactNode;
  variant?: HeroVariant;
};

export default function Hero({ children, variant = 'immersive' }: HeroProps) {
  const { profile, isReady } = useDeviceProfile();
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const isImmersive = variant === 'immersive';
  const staticFallback = !isReady || shouldDisableGsapAnimation(profile);

  useGsapContext(() => {
    if (
      !isImmersive ||
      !sectionRef.current ||
      !logoRef.current ||
      !copyRef.current ||
      !ctaRef.current
    ) {
      return;
    }

    const revealTargets = [copyRef.current, ctaRef.current];

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: ANIMATION_DURATION.hero,
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
      revealTargets,
      { opacity: 0, y: 30, pointerEvents: 'none' },
      {
        opacity: 1,
        y: 0,
        ease: ANIMATION_EASE.base,
        pointerEvents: 'auto',
        onStart: () => {
          for (const element of revealTargets) {
            element.style.visibility = 'visible';
            element.removeAttribute('aria-hidden');
          }
        },
      },
      0.35,
    );
  }, [isImmersive]);

  const showCopyImmediately = isImmersive && staticFallback;
  const copyVisible = !isImmersive || showCopyImmediately;
  const logoVisible = isImmersive && !showCopyImmediately;
  const mobileStaticHero = isImmersive && staticFallback && profile.isMobile;

  return (
    <section
      ref={sectionRef}
      className="noise-bg"
      style={{
        position: 'relative',
        ...(mobileStaticHero
          ? {
              height: 'auto',
              minHeight: 'auto',
              paddingTop: 'calc(var(--space-8) + env(safe-area-inset-top, 0px))',
              paddingBottom: 'var(--space-8)',
            }
          : {
              height: '100svh',
              minHeight: '100svh',
            }),
        display: 'flex',
        flexDirection: mobileStaticHero ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: mobileStaticHero ? 'visible' : 'hidden',
        background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundElevated} 100%)`,
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
          opacity: logoVisible ? 1 : 0,
          visibility: logoVisible ? 'visible' : 'hidden',
        }}
        aria-hidden={!logoVisible}
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

      {isImmersive ? (
        <div
          ref={copyRef}
          style={{
            position: 'relative',
            zIndex: 20,
            textAlign: 'center',
            padding: '0 var(--space-3)',
            maxWidth: '900px',
            opacity: copyVisible ? 1 : 0,
            pointerEvents: copyVisible ? 'auto' : 'none',
            visibility: copyVisible ? 'visible' : 'hidden',
          }}
          aria-hidden={!copyVisible}
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
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            zIndex: 20,
            textAlign: 'center',
            padding: '0 var(--space-3)',
            maxWidth: '900px',
          }}
        >
          {children}
        </div>
      )}

      {isImmersive ? (
        <div
          ref={ctaRef}
          style={{
            ...(mobileStaticHero
              ? {
                  position: 'relative',
                  marginTop: 'var(--space-6)',
                  textAlign: 'center',
                }
              : {
                  position: 'absolute',
                  bottom: 'var(--space-6)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }),
            zIndex: 30,
            pointerEvents: copyVisible ? 'auto' : 'none',
            visibility: copyVisible ? 'visible' : 'hidden',
            opacity: copyVisible ? 1 : 0,
          }}
          aria-hidden={!copyVisible}
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
      ) : null}
    </section>
  );
}
