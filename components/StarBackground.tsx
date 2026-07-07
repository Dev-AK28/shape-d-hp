'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useIntersectionVisible } from '@/lib/hooks/useIntersectionVisible';
import { shouldAnimateStars } from '@/lib/performance/device-profile';
import {
  getStarUpdateIntervalMs,
  scaleStarConfig,
  type StarConfig,
} from '@/lib/performance/star-config';
import { STAR_INTERSECTION_OPTIONS } from '@/lib/performance/visibility-options';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
};

const DEFAULT_CONFIG: Required<StarConfig> = {
  count: 80,
  maxSize: 2.5,
  minSize: 0.5,
  maxOpacity: 0.6,
  minOpacity: 0.1,
  maxSpeed: 0.35,
  minSpeed: 0.05,
  drift: 0.1,
  glowMultiplier: 2,
};

function createStars(config: Required<StarConfig>): Star[] {
  return Array.from({ length: config.count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * (config.maxSize - config.minSize) + config.minSize,
    opacity: Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity,
    speed: Math.random() * (config.maxSpeed - config.minSpeed) + config.minSpeed,
  }));
}

export type { StarConfig };

export default function StarBackground({ config }: { config?: StarConfig }) {
  const { profile, isReady } = useDeviceProfile();
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const { visible: intersectionVisible, observed } = useIntersectionVisible(
    containerRef,
    STAR_INTERSECTION_OPTIONS,
    isReady,
  );
  const showEffects = !observed || intersectionVisible;
  const animateStars = isReady && shouldAnimateStars(profile) && showEffects;

  const merged = useMemo(() => {
    const base = { ...DEFAULT_CONFIG, ...config };
    return isReady ? scaleStarConfig(base, profile) : base;
  }, [config, isReady, profile]);

  // Math.random() must not run during the SSR / pre-hydration render: the
  // server and the client would each roll different values, producing a
  // hydration mismatch on every star's left/top/width/opacity/boxShadow.
  // `isReady` (see useDeviceProfile) is false for both the server render and
  // the client's first (hydrating) render, then flips to true post-hydration
  // (#151-style pattern also used by TextReveal / PhilosophyContent). Stars
  // stay empty until that flip, so SSR output and the first client render
  // always match; real star positions are only randomized client-side.
  const stars = useMemo(() => (isReady ? createStars(merged) : []), [isReady, merged]);

  useEffect(() => {
    if (!animateStars) {
      return;
    }

    starsRef.current = stars.map((star) => ({ ...star }));

    const intervalMs = getStarUpdateIntervalMs(profile);

    const interval = window.setInterval(() => {
      starsRef.current = starsRef.current.map((star) => {
        const newX = star.x + (Math.random() - 0.5) * merged.drift;
        return {
          ...star,
          y: star.y - star.speed < 0 ? 100 : star.y - star.speed,
          x: newX < 0 ? 100 : newX > 100 ? 0 : newX,
        };
      });

      const container = containerRef.current;
      if (!container) {
        return;
      }

      container.querySelectorAll<HTMLElement>('[data-star-id]').forEach((node, index) => {
        const star = starsRef.current[index];
        if (!star) {
          return;
        }
        node.style.left = `${star.x}%`;
        node.style.top = `${star.y}%`;
      });
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [animateStars, merged.drift, profile, stars]);

  const applyGlow = showEffects && shouldAnimateStars(profile);

  return (
    <div
      ref={containerRef}
      data-testid="star-background"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {stars.map((star) => (
        <div
          key={star.id}
          data-star-id={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: applyGlow
              ? `0 0 ${star.size * merged.glowMultiplier}px rgba(255, 255, 255, ${star.opacity * 0.5})`
              : 'none',
          }}
        />
      ))}
    </div>
  );
}
