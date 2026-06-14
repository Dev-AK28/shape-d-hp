'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import { backgroundAssets } from '@/lib/design/background-assets';
import { colors, warmGrade } from '@/lib/design/tokens';

type CosmicSceneProps = {
  isMobile: boolean;
  showNebula?: boolean;
  baseRef?: RefObject<HTMLDivElement | null>;
  nebulaRef?: RefObject<HTMLDivElement | null>;
  /** Outer wrapper for hero pin depth scale (Issue #100). */
  perspectiveDepthRef?: RefObject<HTMLDivElement | null>;
  /** Transform origin for hero pin perspective scale — supplied by HomePageShell SSOT. */
  perspectiveTransformOrigin?: string;
  priority?: boolean;
  /** Fixed viewport backdrop for full-page home experience. */
  fixed?: boolean;
};

export default function CosmicScene({
  isMobile,
  showNebula = true,
  baseRef,
  nebulaRef,
  perspectiveDepthRef,
  perspectiveTransformOrigin = '50% 45%',
  priority = false,
  fixed = false,
}: CosmicSceneProps) {
  const src = isMobile ? backgroundAssets.heroCosmicMobile : backgroundAssets.heroCosmicDesktop;

  return (
    <div
      className={`pointer-events-none overflow-hidden ${fixed ? 'fixed inset-0 z-0' : 'absolute inset-0'}`}
      aria-hidden="true"
      style={{ background: colors.background }}
    >
      <div
        ref={perspectiveDepthRef}
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: perspectiveTransformOrigin }}
      >
      <div ref={baseRef} className="absolute inset-0 will-change-transform">
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.45) 100%)',
          }}
        />
      </div>

      {showNebula ? (
        <div
          ref={nebulaRef}
          className="cosmic-nebula-layer cosmic-nebula-layer--warm-grade absolute inset-0 will-change-transform"
        >
          <Image
            src={backgroundAssets.heroNebulaLayer}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ) : null}

      <div
        className="cosmic-warm-grade-overlay absolute inset-0"
        data-testid={warmGrade.testId}
      />
      </div>
    </div>
  );
}
