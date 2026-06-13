'use client';

import { useRef, type CSSProperties } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useIntersectionVisible } from '@/lib/hooks/useIntersectionVisible';

type NebulaLayer = {
  width: number;
  height: number;
  color: string;
  blur: number;
  position: CSSProperties;
  animation: string;
};

type NebulaBackgroundProps = {
  layers: NebulaLayer[];
  position?: 'absolute' | 'fixed';
};

const MOBILE_BLUR_RATIO = 0.45;

export default function NebulaBackground({ layers, position = 'absolute' }: NebulaBackgroundProps) {
  const { profile } = useDeviceProfile();
  const { isMobile, prefersReducedMotion } = profile;
  const containerRef = useRef<HTMLDivElement>(null);
  const intersectionVisible = useIntersectionVisible(containerRef);
  const visible = position === 'fixed' || intersectionVisible;
  const animate = visible && !prefersReducedMotion;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {layers.map((layer, index) => {
        const blur = isMobile ? Math.round(layer.blur * MOBILE_BLUR_RATIO) : layer.blur;

        return (
          <div
            key={index}
            style={{
              position,
              width: `${layer.width}px`,
              height: `${layer.height}px`,
              background: `radial-gradient(circle, ${layer.color} 0%, transparent 60%)`,
              filter: visible ? `blur(${blur}px)` : 'none',
              animation: animate ? layer.animation : undefined,
              ...layer.position,
            }}
          />
        );
      })}
    </div>
  );
}
