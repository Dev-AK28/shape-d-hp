'use client';

import { useRef, type ReactNode } from 'react';
import CosmicScene from '@/components/background/CosmicScene';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import {
  HERO_DEPTH_PASSAGE,
  HERO_PIN_SCROLL,
} from '@/lib/scroll/animation-tokens';
import { gsap } from '@/lib/scroll/gsap-config';

type HomePageShellProps = {
  children: ReactNode;
};

export default function HomePageShell({ children }: HomePageShellProps) {
  const mainRef = useRef<HTMLElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const perspectiveDepthRef = useRef<HTMLDivElement>(null);
  const { profile, isReady } = useDeviceProfile();

  useGsapContext(() => {
    if (!mainRef.current || !baseRef.current) {
      return;
    }

    gsap.to(baseRef.current, {
      scale: 1.14,
      ease: 'none',
      scrollTrigger: {
        trigger: mainRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });

    if (nebulaRef.current) {
      gsap.to(nebulaRef.current, {
        y: -96,
        opacity: 0.58,
        ease: 'none',
        scrollTrigger: {
          trigger: mainRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });
    }

    const heroSection = mainRef.current.querySelector('[data-hero-pin]');
    if (heroSection && perspectiveDepthRef.current) {
      gsap.fromTo(
        perspectiveDepthRef.current,
        { scale: 1 },
        {
          scale: HERO_DEPTH_PASSAGE.cosmic.perspectiveScale,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSection,
            start: HERO_PIN_SCROLL.start,
            end: HERO_PIN_SCROLL.end,
            scrub: HERO_PIN_SCROLL.scrub,
          },
        },
      );
    }
  }, [isReady]);

  return (
    <>
      {isReady ? (
        <CosmicScene
          isMobile={profile.isMobile}
          baseRef={baseRef}
          nebulaRef={nebulaRef}
          perspectiveDepthRef={perspectiveDepthRef}
          priority
          fixed
        />
      ) : null}
      <main ref={mainRef} className="relative z-10 min-h-screen">
        {children}
      </main>
    </>
  );
}
