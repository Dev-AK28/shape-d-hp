'use client';

import { useLayoutEffect } from 'react';
import { observeMicroInteractionScope } from '@/lib/scroll/micro-interaction';

/**
 * Binds GSAP quickTo hover micro-interactions to `[data-micro-interaction]` nodes.
 * Observes DOM mutations for late-mounted targets (e.g. mobile nav menu).
 */
export default function MicroInteractionBinder() {
  useLayoutEffect(() => {
    const cleanup = observeMicroInteractionScope(document);
    return cleanup;
  }, []);

  return null;
}
