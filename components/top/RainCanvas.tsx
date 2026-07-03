'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { topHero } from '@/lib/design/tokens';

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
};

/**
 * ヒーローの雨 Canvas — Issue #304（参照HTML L127-L131, L816-L857）
 *
 * 幅 26px あたり 1 本の細線が個別速度で降下し続ける。
 * prefers-reduced-motion 有効時は rAF ループを回さず、一律 alpha の静止描画を 1 度だけ行う。
 * DPR スケーリング・リサイズ再構築・アンマウント時の rAF/リスナ解放を行う。
 */
export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    const { rain } = topHero;
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let drops: Drop[] = [];

    const buildDrops = () => {
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
      const count = Math.floor(canvas.offsetWidth / rain.columnWidthPx);
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        len: (rain.lengthMinPx + Math.random() * rain.lengthRangePx) * dpr,
        speed: (rain.speedMin + Math.random() * rain.speedRange) * dpr,
        alpha: rain.alphaMin + Math.random() * rain.alphaRange,
      }));
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${rain.strokeRgb},${rain.staticAlpha})`;
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
      });
    };

    buildDrops();

    // reduced-motion: 静止描画のみ。リサイズ時も静止で再描画する。
    if (reduceMotion) {
      drawStatic();
      const handleStaticResize = () => {
        buildDrops();
        drawStatic();
      };
      window.addEventListener('resize', handleStaticResize);
      return () => window.removeEventListener('resize', handleStaticResize);
    }

    let rafId = 0;
    let inView = true;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      drops.forEach((d) => {
        ctx.strokeStyle = `rgba(${rain.strokeRgb},${d.alpha})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * width;
        }
      });
      rafId = window.requestAnimationFrame(draw);
    };

    // #313: ヒーローが画面外・タブ非アクティブのときは rAF を止めて CPU/バッテリーを節約する。
    const start = () => {
      if (!rafId && inView && !document.hidden) {
        rafId = window.requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) {
          start();
        } else {
          stop();
        }
      });
      observer.observe(canvas);
    }
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    start();
    window.addEventListener('resize', buildDrops);
    return () => {
      stop();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', buildDrops);
    };
  }, [reduceMotion]);

  return <canvas id="rain-canvas" ref={canvasRef} data-testid="hero-rain-canvas" aria-hidden="true" />;
}
