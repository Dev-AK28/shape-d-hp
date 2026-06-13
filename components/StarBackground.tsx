'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useDeviceProfile } from '@/lib/hooks/useDeviceProfile';
import { useIntersectionVisible } from '@/lib/hooks/useIntersectionVisible';
import { shouldAnimateStars } from '@/lib/performance/device-profile';
import { getStarUpdateIntervalMs, scaleStarConfig } from '@/lib/performance/star-config';
import { STAR_INTERSECTION_OPTIONS } from '@/lib/performance/visibility-options';

export type { StarConfig } from '@/lib/performance/star-config';
import type { StarConfig } from '@/lib/performance/star-config';

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

function applyStarStyle(
  element: HTMLDivElement,
  star: Star,
  glowMultiplier: number,
): void {
  element.style.left = `${star.x}%`;
  element.style.top = `${star.y}%`;
  element.style.width = `${star.size}px`;
  element.style.height = `${star.size}px`;
  element.style.opacity = `${star.opacity}`;
  element.style.boxShadow =
    glowMultiplier > 0
      ? `0 0 ${star.size * glowMultiplier}px rgba(255, 255, 255, 0.3)`
      : 'none';
}

function advanceStar(star: Star, drift: number): void {
  const newX = star.x + (Math.random() - 0.5) * drift;
  star.y = star.y - star.speed < 0 ? 100 : star.y - star.speed;
  star.x = newX < 0 ? 100 : newX > 100 ? 0 : newX;
}

function mergeStarConfig(config?: StarConfig): Required<StarConfig> {
  return { ...DEFAULT_CONFIG, ...config };
}

export default function StarBackground({ config }: { config?: StarConfig }) {
  const { profile, isReady } = useDeviceProfile();
  const count = config?.count;
  const maxSize = config?.maxSize;
  const minSize = config?.minSize;
  const maxOpacity = config?.maxOpacity;
  const minOpacity = config?.minOpacity;
  const maxSpeed = config?.maxSpeed;
  const minSpeed = config?.minSpeed;
  const drift = config?.drift;
  const glowMultiplier = config?.glowMultiplier;

  const baseConfig = useMemo(
    () =>
      mergeStarConfig({
        count,
        maxSize,
        minSize,
        maxOpacity,
        minOpacity,
        maxSpeed,
        minSpeed,
        drift,
        glowMultiplier,
      }),
    [count, maxSize, minSize, maxOpacity, minOpacity, maxSpeed, minSpeed, drift, glowMultiplier],
  );
  const merged = useMemo(
    () =>
      scaleStarConfig(baseConfig, {
        isMobile: profile.isMobile,
        prefersReducedMotion: profile.prefersReducedMotion,
        prefersCoarsePointer: profile.prefersCoarsePointer,
      }),
    [
      baseConfig,
      profile.isMobile,
      profile.prefersReducedMotion,
      profile.prefersCoarsePointer,
    ],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const elementsRef = useRef<HTMLDivElement[]>([]);
  const visible = useIntersectionVisible(containerRef, STAR_INTERSECTION_OPTIONS);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const stars = createStars(merged);
    starsRef.current = stars;
    container.replaceChildren();

    const elements = stars.map((star) => {
      const element = document.createElement('div');
      element.className = 'absolute rounded-full bg-white';
      element.dataset.starId = String(star.id);
      applyStarStyle(element, star, merged.glowMultiplier);
      container.appendChild(element);
      return element;
    });
    elementsRef.current = elements;
  }, [isReady, merged]);

  useEffect(() => {
    if (!isReady || !shouldAnimateStars(profile) || !visible) {
      return;
    }

    let frame = 0;
    let lastTick = 0;
    const intervalMs = getStarUpdateIntervalMs(profile);
    const starDrift = merged.drift;
    const starGlow = merged.glowMultiplier;

    const tick = (time: number) => {
      const stars = starsRef.current;
      const elements = elementsRef.current;
      if (stars.length === 0 || elements.length === 0) {
        return;
      }

      if (time - lastTick < intervalMs) {
        frame = requestAnimationFrame(tick);
        return;
      }

      lastTick = time;

      for (let index = 0; index < stars.length; index += 1) {
        advanceStar(stars[index], starDrift);
        applyStarStyle(elements[index], stars[index], starGlow);
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isReady, visible, profile, merged]);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
