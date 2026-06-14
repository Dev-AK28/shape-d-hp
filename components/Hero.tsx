'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';
import LogoParticleFormation from '@/components/hero/LogoParticleFormation';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  BRAND_LOGO_HERO_CLASS,
  brandLogoHeroAspectRatio,
} from '@/lib/design/brand-logo-constants';
import { colors, layout, typography, typographyBlend } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import {
  ANIMATION_EASE,
  gsap,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';
import {
  HERO_DEPTH_PASSAGE,
  HERO_PIN_SCROLL,
  HERO_PIN_TEST_ID,
} from '@/lib/scroll/animation-tokens';
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
  const [scrollRevealed, setScrollRevealed] = useState(false);
  const [logoScrollHidden, setLogoScrollHidden] = useState(false);
  const setScrollRevealedRef = useRef(setScrollRevealed);
  const setLogoScrollHiddenRef = useRef(setLogoScrollHidden);

  // Keep GSAP callbacks on the latest setState without re-running useGsapContext.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ref mirror only; GSAP setup must not re-init on setState identity changes
  useEffect(() => {
    setScrollRevealedRef.current = setScrollRevealed;
    setLogoScrollHiddenRef.current = setLogoScrollHidden;
  });
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
    gsap.set(revealTargets, { opacity: 0, y: 30, pointerEvents: 'none' });
    gsap.set(logoRef.current, { opacity: 1, scale: 1, y: 0 });

    if (particleBandRef.current) {
      gsap.set(particleBandRef.current, {
        opacity: HERO_DEPTH_PASSAGE.particleBand.initialOpacity,
        scale: 1,
        y: 0,
      });
    }

    const syncScrollRevealed = () => {
      const opacity = Number(gsap.getProperty(copyRef.current, 'opacity') ?? 0);
      setScrollRevealedRef.current(opacity > 0.5);
      const logoOpacity = Number(gsap.getProperty(logoRef.current, 'opacity') ?? 1);
      setLogoScrollHiddenRef.current(logoOpacity < 0.01);
    };

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: HERO_PIN_SCROLL.start,
        end: HERO_PIN_SCROLL.end,
        pin: true,
        scrub: HERO_PIN_SCROLL.scrub,
        anticipatePin: HERO_PIN_SCROLL.anticipatePin,
      },
    });

    timeline.eventCallback('onUpdate', syncScrollRevealed);

    const {
      timelineDuration,
      approachPhaseEnd,
      revealTimelineStart,
      logoOpacityHideAt,
      particleBand,
      logo,
    } = HERO_DEPTH_PASSAGE;
    const approachDuration = timelineDuration * approachPhaseEnd;
    const passDuration = timelineDuration - approachDuration;
    const revealDuration = timelineDuration - revealTimelineStart * timelineDuration;

    if (particleBandRef.current) {
      timeline.fromTo(
        particleBandRef.current,
        {
          opacity: particleBand.initialOpacity,
          scale: 1,
          y: 0,
        },
        {
          opacity: particleBand.initialOpacity,
          scale: particleBand.approachScale,
          y: particleBand.approachY,
          duration: approachDuration,
          ease: ANIMATION_EASE.base,
        },
        0,
      );

      timeline.to(
        particleBandRef.current,
        {
          opacity: 0,
          scale: particleBand.passScale,
          y: particleBand.passY,
          duration: passDuration,
          ease: ANIMATION_EASE.base,
        },
        approachDuration,
      );
    }

    timeline.fromTo(
      logoRef.current,
      { scale: 1, opacity: 1, y: 0 },
      {
        scale: logo.approachScale,
        y: logo.approachY,
        duration: approachDuration,
        ease: ANIMATION_EASE.base,
      },
      0,
    );

    timeline.set(
      logoRef.current,
      { opacity: 0 },
      logoOpacityHideAt * timelineDuration,
    );

    timeline.to(
      logoRef.current,
      {
        scale: logo.passScale,
        y: logo.passY,
        duration: passDuration,
        ease: ANIMATION_EASE.base,
      },
      approachDuration,
    );

    timeline.fromTo(
      revealTargets,
      { opacity: 0, y: 30, pointerEvents: 'none' },
      {
        opacity: 1,
        y: 0,
        duration: revealDuration,
        ease: ANIMATION_EASE.base,
        pointerEvents: 'auto',
      },
      revealTimelineStart * timelineDuration,
    );

    syncScrollRevealed();
  }, [isImmersive, staticFallback]);

  const gsapControlled = isImmersive && !staticFallback;
  const showCopyImmediately = isImmersive && staticFallback;
  const copyVisible = !isImmersive || showCopyImmediately;
  const logoVisible = isImmersive && !showCopyImmediately;
  const ctaFocusable = copyVisible || scrollRevealed;
  const reactRevealStyle = gsapControlled
    ? undefined
    : {
        opacity: copyVisible ? 1 : 0,
        pointerEvents: copyVisible ? ('auto' as const) : ('none' as const),
      };
  const reactLogoOpacityStyle = gsapControlled
    ? undefined
    : { opacity: logoVisible ? 1 : 0 };
  const reactParticleBandOpacityStyle = gsapControlled
    ? undefined
    : {
        opacity: logoVisible ? HERO_DEPTH_PASSAGE.particleBand.initialOpacity : 0,
      };
  const mobileStaticHero = isImmersive && staticFallback && profile.isMobile;
  const showParticleFormation =
    logoVisible && !logoRevealed && !skipFormation;

  return (
    <section
      ref={sectionRef}
      data-testid={isImmersive ? HERO_PIN_TEST_ID : undefined}
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
          ...reactLogoOpacityStyle,
          visibility: logoVisible ? 'visible' : 'hidden',
        }}
        aria-hidden={!logoVisible || logoScrollHidden}
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
              ...reactParticleBandOpacityStyle,
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

        <div
          data-testid="hero-logo-stage"
          className={`relative ${BRAND_LOGO_HERO_CLASS}`}
          style={{ aspectRatio: brandLogoHeroAspectRatio }}
        >
          <LogoParticleFormation
            active={showParticleFormation}
            onComplete={() => setFormationComplete(true)}
          />

          <div
            aria-hidden={logoVisible && !logoRevealed}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: logoRevealed || !logoVisible ? 1 : 0,
              transition: 'opacity 700ms ease',
            }}
          >
            <BrandLogo variant="hero" priority={isImmersive} className="w-full" />
          </div>
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
            ...reactRevealStyle,
          }}
        >
          {children}

          <p
            className={typographyBlend.classCosmic}
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
            ...reactRevealStyle,
          }}
        >
          <a
            href="/contact"
            className="hero-cta"
            tabIndex={ctaFocusable ? 0 : -1}
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
