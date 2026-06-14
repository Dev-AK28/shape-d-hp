'use client';

import { useEffect, useRef } from 'react';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  fitSampleDimensions,
  LOGO_PARTICLE_FORMATION_MS,
  LOGO_PARTICLE_RENDER_SCALE,
  sampleLogoTargetPointsFromImageData,
  type LogoSamplePoint,
} from '@/lib/hero/sample-logo-target-points';

type LogoParticleFormationProps = {
  active: boolean;
  onComplete?: () => void;
};

type Particle = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  size: number;
  opacity: number;
};

function createParticles(targets: LogoSamplePoint[]): Particle[] {
  return targets.map((target) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 220 + Math.random() * 280;
    const startZ = (Math.random() - 0.5) * 420;

    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      z: startZ,
      tx: target.x,
      ty: target.y,
      tz: (Math.random() - 0.5) * 24,
      size: 0.8 + Math.random() * 1.6,
      opacity: 0.35 + Math.random() * 0.55,
    };
  });
}

function loadLogoImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load logo image: ${src}`));
    image.src = src;
  });
}

async function sampleTargetPointsFromLogo(
  src: string,
): Promise<{ points: LogoSamplePoint[]; width: number; height: number }> {
  if (typeof document === 'undefined') {
    return { points: [], width: 0, height: 0 };
  }

  const image = await loadLogoImage(src);
  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;
  const { width, height } = fitSampleDimensions(naturalWidth, naturalHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { points: [], width, height };
  }

  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  return {
    points: sampleLogoTargetPointsFromImageData(width, height, data),
    width,
    height,
  };
}

export default function LogoParticleFormation({
  active,
  onComplete,
}: LogoParticleFormationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sampleSizeRef = useRef({ width: 0, height: 0 });
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const { points, width, height } = await sampleTargetPointsFromLogo(
          backgroundAssets.brandLogoTransparent,
        );
        if (cancelled) {
          return;
        }

        if (points.length === 0 || width === 0 || height === 0) {
          onCompleteRef.current?.();
          return;
        }

        sampleSizeRef.current = { width, height };
        particlesRef.current = createParticles(points);
        startRef.current = null;

        let canvasWidth = 0;
        let canvasHeight = 0;

        const render = (timestamp: number) => {
          if (cancelled) {
            return;
          }

          if (startRef.current === null) {
            startRef.current = timestamp;
          }

          const progress = Math.min(
            1,
            (timestamp - startRef.current) / LOGO_PARTICLE_FORMATION_MS,
          );
          const eased = 1 - (1 - progress) ** 3;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');

          if (!canvas || !ctx) {
            onCompleteRef.current?.();
            return;
          }

          if (cancelled) {
            return;
          }

          const dpr = window.devicePixelRatio || 1;
          const displayWidth = canvas.clientWidth;
          const displayHeight = canvas.clientHeight;

          if (displayWidth !== canvasWidth || displayHeight !== canvasHeight) {
            canvasWidth = displayWidth;
            canvasHeight = displayHeight;
            canvas.width = Math.floor(displayWidth * dpr);
            canvas.height = Math.floor(displayHeight * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          ctx.clearRect(0, 0, displayWidth, displayHeight);

          const focalLength = 520;
          const centerX = displayWidth / 2;
          const centerY = displayHeight / 2;
          const { width: sampleWidth, height: sampleHeight } = sampleSizeRef.current;
          const scale =
            Math.min(displayWidth / sampleWidth, displayHeight / sampleHeight) *
            LOGO_PARTICLE_RENDER_SCALE;

          for (const particle of particlesRef.current) {
            particle.x += (particle.tx - particle.x) * (0.04 + eased * 0.08);
            particle.y += (particle.ty - particle.y) * (0.04 + eased * 0.08);
            particle.z += (particle.tz - particle.z) * (0.05 + eased * 0.06);

            const depth = focalLength / (focalLength - particle.z);
            const px = centerX + particle.x * scale * depth;
            const py = centerY + particle.y * scale * depth;
            const size = particle.size * depth * (0.6 + eased * 0.5);
            const alpha = particle.opacity * (0.35 + eased * 0.65);

            ctx.beginPath();
            ctx.fillStyle = `rgba(240, 240, 240, ${alpha})`;
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();

            if (progress > 0.55) {
              ctx.beginPath();
              ctx.fillStyle = `rgba(196, 181, 160, ${alpha * 0.35})`;
              ctx.arc(px, py, size * 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (progress < 1) {
            if (!cancelled) {
              frameRef.current = window.requestAnimationFrame(render);
            }
            return;
          }

          onCompleteRef.current?.();
        };

        frameRef.current = window.requestAnimationFrame(render);
      } catch {
        if (!cancelled) {
          onCompleteRef.current?.();
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
    />
  );
}
