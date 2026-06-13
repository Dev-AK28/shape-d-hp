'use client';

import type { CSSProperties } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';

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
  const { isMobile, prefersReducedMotion } = useDeviceProfile();

  return (
    <>
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
              filter: `blur(${blur}px)`,
              animation: prefersReducedMotion ? undefined : layer.animation,
              ...layer.position,
            }}
          />
        );
      })}
    </>
  );
}
