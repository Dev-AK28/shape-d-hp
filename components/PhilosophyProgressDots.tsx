'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

type PhilosophyProgressDotsProps = {
  letters: readonly string[];
  activeIndex: number;
  /**
   * Whether the panelled section is still in view. When false (scrolled past
   * the last panel, e.g. the closing CTA / footer is showing) the dots fade
   * out and are removed from the hit-testing tree via visibility:hidden so
   * they never overlap the footer content (#365).
   */
  visible: boolean;
};

export default function PhilosophyProgressDots({
  letters,
  activeIndex,
  visible,
}: PhilosophyProgressDotsProps) {
  // #378: identical root cause to #368 (Navigation.tsx). app/template.tsx wraps
  // page content in a `[data-velocity-content]` div that SmoothScrollProvider
  // applies a GSAP skewY transform to while scrolling (velocity-skew, #312).
  // Per the CSS Transforms spec, a non-`none` transform on an ancestor makes it
  // the containing block for `position: fixed` descendants — so once that
  // transform engages, these fixed dots stop tracking the viewport and drift
  // with the document scroll instead (roughly 1:1 with scrollY). Portal to
  // `document.body` (a sibling of the transformed wrapper, not a descendant)
  // so `fixed` stays anchored to the viewport regardless of ancestor
  // transforms. `isMounted` mirrors the Navigation.tsx / useDeviceProfile
  // isReady pattern (useSyncExternalStore w/ no-op subscribe) rather than an
  // effect + setState, so React itself resolves SSR-vs-client without a
  // post-mount re-render flash — rendered in-place on the server/first paint,
  // then swapped to the portal on the client (no visible change since no
  // transform is applied before scroll).
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const portalContainer = isMounted ? document.body : null;

  const dotsElement = (
    <div
      aria-hidden="true"
      data-testid="philosophy-progress-dots"
      className={`pointer-events-none fixed top-1/2 right-[max(var(--space-3),env(safe-area-inset-right,0px))] z-50 flex -translate-y-1/2 flex-col gap-[var(--space-2)] transition-[opacity,visibility] duration-[var(--duration-base)] ease-[var(--ease-base)] ${
        visible ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {letters.map((letter, index) => (
        <span
          key={letter}
          data-active={activeIndex === index}
          className={`size-2 rounded-full transition-[background,opacity] duration-[var(--duration-base)] ease-[var(--ease-base)] ${
            activeIndex === index
              ? 'bg-[var(--accent)] opacity-100'
              : 'bg-[var(--muted)] opacity-[0.35]'
          }`}
        />
      ))}
    </div>
  );

  return portalContainer ? createPortal(dotsElement, portalContainer) : dotsElement;
}
