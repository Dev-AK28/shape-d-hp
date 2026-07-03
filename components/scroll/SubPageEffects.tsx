'use client';

import { usePathname } from 'next/navigation';
import DeferredCustomCursor from '@/components/ui/DeferredCustomCursor';
import MicroInteractionBinder from '@/components/ui/MicroInteractionBinder';
import DeferredPageLoader from '@/components/scroll/DeferredPageLoader';
import { isTopPagePath } from '@/lib/scroll/lenis-config';

/**
 * 下層ページ限定の演出インフラ — Issue #312
 *
 * CustomCursor / MicroInteractionBinder / PageLoader はトップページでは無効化し、
 * 下層ページでのみ有効にする（2026-07-03 確定）。参照HTMLのトップページには
 * これらの演出が存在しないため。SmoothScrollProvider は自身でトップ/下層の
 * Lenis 速度・velocity-skew を切り替えるため、ここでは扱わない。
 */
export default function SubPageEffects() {
  const pathname = usePathname();
  if (isTopPagePath(pathname)) {
    return null;
  }
  return (
    <>
      <DeferredCustomCursor />
      <MicroInteractionBinder />
      <DeferredPageLoader />
    </>
  );
}
