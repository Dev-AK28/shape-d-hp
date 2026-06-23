'use client';

import Image from 'next/image';
import type { RefObject } from 'react';
import WebGLHeroDepth from '@/components/background/WebGLHeroDepth';
import { backgroundAssets } from '@/lib/design/background-assets';
import { cosmicGrade } from '@/lib/design/tokens';

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
  /**
   * Enable the WebGL animated starfield layer.
   * Caller is responsible for gating this with shouldDisableWebGL().
   * When false/undefined, the static background image serves as the sole background.
   */
  enableWebGL?: boolean;
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
  enableWebGL = false,
}: CosmicSceneProps) {
  const src = isMobile ? backgroundAssets.heroCosmicMobile : backgroundAssets.heroCosmicDesktop;

  return (
    <div
      className={`pointer-events-none overflow-hidden bg-[var(--background)] ${fixed ? 'fixed inset-0 z-0' : 'absolute inset-0'}`}
      aria-hidden="true"
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
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.15)_0%,rgba(10,10,10,0.45)_100%)]"
        />
      </div>

      {showNebula ? (
        <div
          ref={nebulaRef}
          className="cosmic-nebula-layer cosmic-nebula-layer--cosmic-grade absolute inset-0 will-change-transform"
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
        className="cosmic-grade-overlay absolute inset-0"
        data-testid={cosmicGrade.testId}
      />

      {enableWebGL && <WebGLHeroDepth />}
      </div>
    </div>
  );
}
