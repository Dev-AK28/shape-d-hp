'use client';

import { useEffect, useMemo, useState } from 'react';

export type StarConfig = {
  count?: number;
  maxSize?: number;
  minSize?: number;
  maxOpacity?: number;
  minOpacity?: number;
  maxSpeed?: number;
  minSpeed?: number;
  drift?: number;
  glowMultiplier?: number;
};

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

export default function StarBackground({ config }: { config?: StarConfig }) {
  const merged = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const [stars, setStars] = useState(() => createStars(merged));

  useEffect(() => {
    const interval = setInterval(() => {
      setStars((prevStars) =>
        prevStars.map((star) => {
          const newX = star.x + (Math.random() - 0.5) * merged.drift;
          return {
            ...star,
            y: star.y - star.speed < 0 ? 100 : star.y - star.speed,
            x: newX < 0 ? 100 : newX > 100 ? 0 : newX,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [merged.drift]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * merged.glowMultiplier}px rgba(255, 255, 255, 0.3)`,
          }}
        />
      ))}
    </div>
  );
}
