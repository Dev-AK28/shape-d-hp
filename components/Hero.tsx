'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';
import LogoParticleFormation from '@/components/hero/LogoParticleFormation';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { backgroundAssets } from '@/lib/design/background-assets';
import { colors, layout, typography } from '@/lib/design/tokens';
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
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const particleBandRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const isImmersive = variant === 'immersive';
  const staticFallback = !isReady || shouldDisableGsapAnimation(profile);
  const skipFormation = staticFallback || reduceMotion === true;
  const [formationComplete, setFormationComplete] = useState(false);
  const logoRevealed = skipFormation || formationComplete;

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

    if (particleBandRef.current) {
      timeline.to(
        particleBandRef.current,
        { opacity: 0, scale: 1.08, ease: ANIMATION_EASE.base },
        0,
      );
    }

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
  const showParticleFormation =
    logoVisible && !logoRevealed && !skipFormation;

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
        background: 'transparent',
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
        {isImmersive ? (
          <div
            ref={particleBandRef}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: logoVisible ? 0.65 : 0,
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 'min(92vw, 960px)',
                aspectRatio: '16 / 9',
              }}
            >
              <Image
                src={backgroundAssets.heroParticleBand}
                alt=""
                fill
                sizes="(max-width: 768px) 92vw, 960px"
                className="object-contain object-center"
              />
            </div>
          </div>
        ) : null}

        <LogoParticleFormation
          active={showParticleFormation}
          onComplete={() => setFormationComplete(true)}
        />

        <div
          aria-hidden={logoVisible && !logoRevealed}
          style={{
            opacity: logoRevealed || !logoVisible ? 1 : 0,
            transition: 'opacity 700ms ease',
          }}
        >
          <BrandLogo variant="hero" priority={isImmersive} />
        </div>
      </div>

      {isImmersive ? (
        <div
          ref={copyRef}
          style={{
            position: 'relative',
            zIndex: 20,
            textAlign: 'center',
            padding: '0 var(--space-3)',
            maxWidth: layout.contentStandard,
            opacity: copyVisible ? 1 : 0,
            pointerEvents: copyVisible ? 'auto' : 'none',
          }}
        >
          {children}

          <p
            style={{
              fontSize: typography.sizeBody,
              color: colors.muted,
              lineHeight: 1.85,
              fontFamily: typography.fontSerifJp,
              fontWeight: 300,
              marginTop: 'var(--space-4)',
              letterSpacing: '0.04em',
              maxWidth: layout.contentProse,
              marginInline: 'auto',
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
            maxWidth: layout.contentStandard,
          }}
        >
          {children ?? <BrandLogo variant="hero" className="w-[min(80vw,420px)]" priority />}
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
            opacity: copyVisible ? 1 : 0,
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
              background: 'rgba(10, 10, 10, 0.35)',
              backdropFilter: 'blur(6px)',
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
