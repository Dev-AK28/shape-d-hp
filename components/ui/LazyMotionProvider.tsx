'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import type { ReactNode } from 'react';

type LazyMotionProviderProps = {
  children: ReactNode;
};

/**
 * Wraps the app in framer-motion's `LazyMotion` so every `m.*` component
 * (see components/**\/*.tsx) only bundles the `domAnimation` feature set
 * (animation, exit, hover/tap/focus, whileInView) instead of the full
 * `motion` API. `strict` enforces that no `motion.*` component is
 * accidentally reintroduced, which would silently opt back into the full
 * bundle.
 *
 * `domAnimation` intentionally excludes `drag` and `layout` — verified
 * (issue #402) that no consumer in this codebase uses those features.
 * If a future component needs them, switch to `domMax` instead of
 * reaching for `motion` directly.
 */
export default function LazyMotionProvider({ children }: LazyMotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
