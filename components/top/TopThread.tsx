'use client';

import { useRef } from 'react';
import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topShell } from '@/lib/design/tokens';

/**
 * 縦糸ライン #thread — Issue #303（参照HTML L45-L56, L891-L896）
 * ページ全体のスクロール進捗に追従して scaleY(0→1)。
 * reduced-motion / 低性能端末では useGsapContext が setup を実行しないため、
 * 参照HTMLと同じく scaleY(0)（非表示）のまま保たれる。
 */
export default function TopThread() {
  const threadRef = useRef<HTMLDivElement>(null);

  useGsapContext(() => {
    if (!threadRef.current) {
      return;
    }
    gsap.to(threadRef.current, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: topShell.threadScrub,
      },
    });
  });

  return <div id="thread" ref={threadRef} data-testid="top-thread" aria-hidden="true" />;
}
