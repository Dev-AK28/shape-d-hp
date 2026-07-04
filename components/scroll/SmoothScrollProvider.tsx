'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { shouldDisableSmoothScroll } from '@/lib/performance/device-profile';
import {
  configureGsapDefaults,
  gsap,
  registerGsapPlugins,
  refreshScrollTrigger,
  ScrollTrigger,
} from '@/lib/scroll/gsap-config';
import { VELOCITY_SKEW } from '@/lib/scroll/animation-tokens';
import { LenisContext } from '@/lib/scroll/lenis-context';
import { getScrollProfile, isTopPagePath } from '@/lib/scroll/lenis-config';

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const { profile, isReady } = useDeviceProfile();
  const pathname = usePathname();
  // #260: 生成した Lenis を Context で公開する。null = Lenis 未起動（SSR / import 前 /
  // reduced-motion）。consumer（useHorizontalFocusSync 等）は null 時に window.scrollTo へフォールバックする。
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  // スクロールプロファイルはトップ/下層でのみ変化する。下層ページ間の遷移で Lenis を
  // 無駄に再生成（スクロールジャンプの原因）しないよう、境界（isTopPage）を effect の依存にする。
  const isTopPage = isTopPagePath(pathname);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    registerGsapPlugins();
    configureGsapDefaults();

    if (shouldDisableSmoothScroll(profile)) {
      return;
    }

    // #312: トップページは Lenis 1.8 + カスタム easing・velocity-skew なし。下層は 1.4 + skew。
    const scrollProfile = getScrollProfile(isTopPage);

    let lenis: Lenis | undefined;
    let cancelled = false;
    let tickerCallback: ((time: number) => void) | undefined;
    const defaultLagSmoothing = 500;

    // Declared outside the IIFE so the cleanup function can release them and disconnect observer on unmount.
    let skewSetter: ((v: number) => void) | null = null;
    let skewTarget: Element | null = null;
    let skewObserver: MutationObserver | undefined;

    void (async () => {
      const { default: Lenis } = await import('lenis');
      await import('lenis/dist/lenis.css');

      if (cancelled) {
        return;
      }

      lenis = new Lenis(scrollProfile.lenis);
      // #260: Context を通じて consumer に公開する。
      setLenisInstance(lenis);

      const makeSkewSetter = (el: Element | null) =>
        el
          ? gsap.quickTo(el, 'skewY', {
              duration: VELOCITY_SKEW.quickToDuration,
              ease: VELOCITY_SKEW.quickToEase,
            })
          : null;

      // #312: velocity-skew はトップページでは無効。下層ページのみ target を追跡する。
      if (scrollProfile.velocitySkew) {
        // Initial query for the velocity-skew target.
        skewTarget = document.querySelector('[data-velocity-content]');
        skewSetter = makeSkewSetter(skewTarget);

        // SPA route changes swap the [data-velocity-content] element (template.tsx remounts).
        // MutationObserver updates the cached target outside the 60fps scroll handler.
        // Skip mutations that don't involve [data-velocity-content] to avoid redundant querySelector calls.
        skewObserver = new MutationObserver((records) => {
          const touched = records.some((r) =>
            [...r.addedNodes, ...r.removedNodes].some(
              (n) =>
                n instanceof Element &&
                (n.hasAttribute('data-velocity-content') || n.querySelector('[data-velocity-content]')),
            ),
          );
          if (!touched) return;
          const el = document.querySelector('[data-velocity-content]');
          if (el !== skewTarget) {
            skewTarget = el;
            skewSetter = makeSkewSetter(el);
          }
        });
        skewObserver.observe(document.body, { childList: true, subtree: true });
      }

      lenis.on('scroll', (lenisInstance) => {
        ScrollTrigger.update();
        if (skewSetter) {
          const { maxDegrees, velocityFactor } = VELOCITY_SKEW;
          skewSetter(Math.max(-maxDegrees, Math.min(maxDegrees, lenisInstance.velocity * velocityFactor)));
        }
      });

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
      refreshScrollTrigger();
    })();

    return () => {
      cancelled = true;
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      gsap.ticker.lagSmoothing(defaultLagSmoothing);
      lenis?.destroy();
      // #260: Lenis 破棄に合わせて Context を null に戻す（consumer をフォールバックへ）。
      setLenisInstance(null);
      skewObserver?.disconnect();
      skewObserver = undefined;
      // Release quickTo instance and DOM reference to allow GC.
      skewSetter = null;
      skewTarget = null;
    };
    // トップ↔下層の境界変化でのみ scroll profile（1.8/skewなし ↔ 1.4/skewあり）を再構築する。
    // 下層→下層の遷移では Lenis を保持し、スクロールジャンプを避ける。
  }, [isReady, profile, isTopPage]);

  return <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>;
}
