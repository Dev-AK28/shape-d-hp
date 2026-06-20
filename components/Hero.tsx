'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import LogoParticleFormation from '@/components/hero/LogoParticleFormation';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  BRAND_LOGO_HERO_CLASS,
  brandLogoHeroAspectRatio,
} from '@/lib/design/brand-logo-constants';
import { typographyBlend } from '@/lib/design/tokens';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import {
  ANIMATION_EASE,
  gsap,
  shouldDisableGsapAnimation,
} from '@/lib/scroll/gsap-config';
import {
  ANIMATION_DURATION,
  HERO_DEPTH_PASSAGE,
  HERO_PIN_SCROLL,
  HERO_PIN_TEST_ID,
  REVEAL_DELAY,
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
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

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
  const gsapControlled = isImmersive && !staticFallback;

  // Fade-in scroll indicator after particle formation completes.
  // Guard against scrollRevealed to avoid post-formation flash when the user
  // already scrolled during the 2400ms formation window.
  useEffect(() => {
    if (!gsapControlled || !formationComplete || scrollRevealed || !scrollIndicatorRef.current) return;
    const tween = gsap.to(scrollIndicatorRef.current, {
      opacity: 1,
      duration: ANIMATION_DURATION.heroScrollIndicator,
      delay: REVEAL_DELAY.heroScrollIndicator,
      ease: ANIMATION_EASE.reveal,
    });
    return () => { tween.kill(); };
  }, [formationComplete, gsapControlled, scrollRevealed]);

  // Fade-out scroll indicator once the scroll reveal has triggered.
  useEffect(() => {
    if (!scrollIndicatorRef.current || !scrollRevealed) return;
    const tween = gsap.to(scrollIndicatorRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: ANIMATION_EASE.base,
      overwrite: true,
    });
    return () => { tween.kill(); };
  }, [scrollRevealed]);

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

    gsap.set([copyRef.current, ctaRef.current], { opacity: 0, y: 36, scale: 0.97, pointerEvents: 'none' });
    gsap.set(logoRef.current, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' });

    if (particleBandRef.current) {
      gsap.set(particleBandRef.current, {
        opacity: HERO_DEPTH_PASSAGE.particleBand.initialOpacity,
        scale: 1,
        y: 0,
        rotation: 0,
        filter: 'blur(0px)',
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
      // Approach: particle band closes in with slight rotation for 3-D depth
      timeline.fromTo(
        particleBandRef.current,
        { opacity: particleBand.initialOpacity, scale: 1, y: 0, rotation: 0 },
        {
          opacity: particleBand.initialOpacity,
          scale: particleBand.approachScale,
          y: particleBand.approachY,
          rotation: -2.5,
          duration: approachDuration,
          ease: 'power1.inOut',
        },
        0,
      );

      // Pass-through: expands + blurs as camera flies through
      timeline.to(
        particleBandRef.current,
        {
          opacity: 0,
          scale: particleBand.passScale,
          y: particleBand.passY,
          filter: `blur(${particleBand.passBlurPx}px)`,
          duration: passDuration,
          ease: 'power2.in',
        },
        approachDuration,
      );
    }

    // Logo approach: zooms in with vertical drift
    timeline.fromTo(
      logoRef.current,
      { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' },
      {
        scale: logo.approachScale,
        y: logo.approachY,
        duration: approachDuration,
        ease: 'power1.inOut',
      },
      0,
    );

    timeline.set(
      logoRef.current,
      { opacity: 0 },
      logoOpacityHideAt * timelineDuration,
    );

    // Logo pass-through: shrinks + blurs (depth-of-field exit)
    timeline.to(
      logoRef.current,
      {
        scale: logo.passScale,
        y: logo.passY,
        filter: `blur(${logo.passBlurPx}px)`,
        duration: passDuration,
        ease: 'power2.in',
      },
      approachDuration,
    );

    // Copy and CTA reveal with slight stagger and scale
    timeline.fromTo(
      copyRef.current,
      { opacity: 0, y: 36, scale: 0.97, pointerEvents: 'none' },
      { opacity: 1, y: 0, scale: 1, duration: revealDuration, ease: 'power3.out', pointerEvents: 'auto' },
      revealTimelineStart * timelineDuration,
    );

    timeline.fromTo(
      ctaRef.current,
      { opacity: 0, y: 36, scale: 0.97, pointerEvents: 'none' },
      { opacity: 1, y: 0, scale: 1, duration: revealDuration * 0.9, ease: 'power3.out', pointerEvents: 'auto' },
      revealTimelineStart * timelineDuration + 0.07,
    );

    syncScrollRevealed();
  }, [isImmersive, staticFallback]);

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
  // Use the static touch layout for any touch-primary device (mobile viewport or coarse pointer)
  // when GSAP is disabled. Large tablets (iPad Pro, large Android) report prefersCoarsePointer
  // but not isMobile, so they need the same flow layout to avoid absolute-positioned CTA being
  // hidden under virtual keyboards or browser chrome. See Issue #136.
  const mobileStaticHero = isImmersive && staticFallback && isTouchInputDevice(profile);
  const showParticleFormation =
    logoVisible && !logoRevealed && !skipFormation;

  return (
    <section
      ref={sectionRef}
      data-testid={isImmersive ? HERO_PIN_TEST_ID : undefined}
      data-hero={isImmersive ? 'immersive' : undefined}
      className={`noise-bg relative flex items-center justify-center bg-transparent ${
        mobileStaticHero
          ? 'flex-col h-auto overflow-visible pt-[calc(var(--space-8)_+_env(safe-area-inset-top,_0px))] pb-[var(--space-8)]'
          : 'flex-row h-svh min-h-svh overflow-hidden'
      }`}
    >
      <div
        ref={logoRef}
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          ...reactLogoOpacityStyle,
          visibility: logoVisible ? 'visible' : 'hidden',
        }}
        aria-hidden={!logoVisible || logoScrollHidden}
      >
        {isImmersive ? (
          <div
            ref={particleBandRef}
            className="absolute inset-0 flex items-center justify-center"
            style={reactParticleBandOpacityStyle}
          >
            <div className="relative w-[min(92vw,960px)] aspect-[16/9]">
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
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
            style={{ opacity: logoRevealed || !logoVisible ? 1 : 0 }}
          >
            <BrandLogo variant="hero" priority={isImmersive} className="w-full" />
          </div>
        </div>
      </div>

      {isImmersive ? (
        <div
          ref={copyRef}
          className="relative z-20 text-center px-[var(--space-3)] max-w-[var(--content-standard)]"
          style={reactRevealStyle}
        >
          {children}

          <p
            className={`${typographyBlend.classCosmic} type-size-body type-font-serif-jp font-light leading-[1.85] mt-[var(--space-4)] tracking-[0.04em] max-w-[var(--content-prose)] mx-auto text-[color:var(--muted)]`}
          >
            爆速・安全・低コスト——技術の余白に、創造性を。
            <br />
            AIを指揮し、本来の事業価値を形にする環境を創ります。
          </p>
        </div>
      ) : (
        <div className="relative z-20 text-center px-[var(--space-3)] max-w-[var(--content-standard)]">
          {children ?? <BrandLogo variant="hero" className="w-[min(80vw,420px)]" priority />}
        </div>
      )}

      {isImmersive ? (
        <div
          ref={ctaRef}
          data-hero-cta=""
          className={`z-30 ${
            mobileStaticHero
              ? 'relative mt-[var(--space-6)] text-center'
              : 'absolute bottom-[var(--space-6)] left-1/2 -translate-x-1/2'
          }`}
          style={reactRevealStyle}
          data-testid="hero-cta-wrapper"
        >
          <a
            href="/contact"
            className="hero-cta inline-block px-[var(--space-6)] py-[var(--space-2)] border border-[var(--accent)] rounded-full text-[color:var(--accent)] bg-[#0a0a0a]/35 backdrop-blur-[6px] type-size-body type-font-serif-jp no-underline tracking-[0.08em]"
            data-micro-interaction="cta"
            tabIndex={ctaFocusable ? 0 : -1}
          >
            お問い合わせ
          </a>
        </div>
      ) : null}

      {formationComplete ? (
        <span data-testid="hero-formation-complete" className="sr-only" aria-hidden />
      ) : null}

      {isImmersive && gsapControlled ? (
        <div
          ref={scrollIndicatorRef}
          data-testid="hero-scroll-indicator"
          aria-hidden={true}
          className="absolute bottom-[max(var(--space-3),env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 pointer-events-none select-none opacity-0"
        >
          <span className="type-size-caption type-font-serif-jp tracking-[0.12em] text-[color:var(--accent-subtle)]">
            SCROLL
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            className="text-[color:var(--accent-subtle)] motion-safe:animate-bounce"
          />
        </div>
      ) : null}
    </section>
  );
}
