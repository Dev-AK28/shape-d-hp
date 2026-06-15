'use client';

import { useEffect, useRef } from 'react';
import { createStarfieldRenderer } from '@/lib/webgl/starfield-renderer';

type WebGLHeroDepthProps = {
  /** Z-index class to position within the background layer stack. Defaults to absolute inset-0. */
  className?: string;
};

/**
 * WebGL starfield depth effect for the Hero section.
 * Renders animated star particles with mouse-parallax and scroll-drift.
 * The parent (CosmicScene) is responsible for gating this component
 * based on device capability via shouldDisableWebGL().
 *
 * Static fallback: the CosmicScene background image remains visible underneath
 * at all times — this canvas is fully transparent and additive-blended.
 */
export default function WebGLHeroDepth({ className }: WebGLHeroDepthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctrl = createStarfieldRenderer(canvas);
    if (!ctrl) return;

    const handleMouseMove = (e: MouseEvent) => {
      ctrl.setMouse(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };

    const handleScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      ctrl.setScroll(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      ctrl.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? 'absolute inset-0 w-full h-full pointer-events-none'}
      aria-hidden="true"
    />
  );
}
