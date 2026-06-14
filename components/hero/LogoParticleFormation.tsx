'use client';

import { useEffect, useRef } from 'react';

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

const SAMPLE_WIDTH = 720;
const SAMPLE_HEIGHT = 160;
const SAMPLE_STEP = 5;
const MAX_PARTICLES = 900;
const LOGO_TEXT = 'SHAPE∞D';
const FONT = '300 96px "Cormorant Garamond", Georgia, serif';

function sampleTargetPoints(): Array<{ x: number; y: number }> {
  if (typeof document === 'undefined') {
    return [];
  }

  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_WIDTH;
  canvas.height = SAMPLE_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return [];
  }

  ctx.clearRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
  ctx.fillStyle = '#ffffff';
  ctx.font = FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(LOGO_TEXT, SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2);

  const { data } = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
  const points: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < SAMPLE_HEIGHT; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_WIDTH; x += SAMPLE_STEP) {
      const alpha = data[(y * SAMPLE_WIDTH + x) * 4 + 3];
      if (alpha > 140) {
        points.push({
          x: x - SAMPLE_WIDTH / 2,
          y: y - SAMPLE_HEIGHT / 2,
        });
      }
    }
  }

  if (points.length <= MAX_PARTICLES) {
    return points;
  }

  const stride = Math.ceil(points.length / MAX_PARTICLES);
  return points.filter((_, index) => index % stride === 0);
}

function createParticles(targets: Array<{ x: number; y: number }>): Particle[] {
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

export default function LogoParticleFormation({
  active,
  onComplete,
}: LogoParticleFormationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
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

    const targets = sampleTargetPoints();
    if (targets.length === 0) {
      onCompleteRef.current?.();
      return;
    }

    particlesRef.current = createParticles(targets);
    startRef.current = null;

    const durationMs = 2400;

    const render = (timestamp: number) => {
      if (startRef.current === null) {
        startRef.current = timestamp;
      }

      const progress = Math.min(1, (timestamp - startRef.current) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) {
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const focalLength = 520;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width / SAMPLE_WIDTH, height / SAMPLE_HEIGHT) * 0.92;

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
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      onCompleteRef.current?.();
    };

    frameRef.current = window.requestAnimationFrame(render);

    return () => {
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
