'use client';

import { useLayoutEffect } from 'react';
import { bindMicroInteractionScope } from '@/lib/scroll/micro-interaction';

/**
 * Binds GSAP quickTo hover micro-interactions to `[data-micro-interaction]` nodes.
 * Placed once in root layout; works with server-rendered Footer links.
 */
export default function MicroInteractionBinder() {
  useLayoutEffect(() => {
    const cleanup = bindMicroInteractionScope(document);
    return cleanup;
  }, []);

  return null;
}
