'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  buildDust,
  buildMotes,
  buildParticles,
  catmull,
  easeInOutCubic,
  easeOutCubic,
  easeOutQuint,
  splineParam,
  type Dust,
  type Mote,
  type Particle,
} from '@/lib/hero/animation-utils';
import { HERO_BIGBANG } from '@/lib/scroll/animation-tokens';
import {
  fitSampleDimensions,
  LOGO_ALPHA_THRESHOLD,
  LOGO_PARTICLE_FORMATION_MS,
  LOGO_PARTICLE_RENDER_SCALE,
  type LogoSamplePoint,
} from '@/lib/hero/sample-logo-target-points';

type LogoParticleFormationProps = {
  active: boolean;
  /** Use the reduced-count / fewer-texture profile on mobile / coarse-pointer devices. */
  lowPower?: boolean;
  /** Hero logo stage element — used to align + scale the formed cluster to the crisp logo. */
  logoBoxRef?: RefObject<HTMLDivElement | null>;
  onComplete?: () => void;
};

type Texture = { img: HTMLImageElement; ready: boolean };

const { bigBangMs, driftMs, gatherMs, revealMs, revealLeadFraction, burstScale, quality } =
  HERO_BIGBANG;
// Perspective projection focal length (px): depthMul = FOCAL / (FOCAL − z).
const FOCAL = 520;

type GlowStop = [number, string];
function makeGlow(stops: GlowStop[], dim = 96): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = dim;
  cv.height = dim;
  const g = cv.getContext('2d');
  const r = dim / 2;
  if (g) {
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    stops.forEach(([o, c]) => grad.addColorStop(o, c));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(r, r, r, 0, Math.PI * 2);
    g.fill();
  }
  return cv;
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
  step: number,
  maxParticles: number,
): Promise<{ points: LogoSamplePoint[]; width: number; height: number }> {
  const image = await loadLogoImage(src);
  const { width, height } = fitSampleDimensions(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { points: [], width, height };
  }
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const points: LogoSamplePoint[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > LOGO_ALPHA_THRESHOLD) {
        points.push({ x: x - width / 2, y: y - height / 2 });
      }
    }
  }
  if (points.length <= maxParticles) {
    return { points, width, height };
  }
  const stride = Math.ceil(points.length / maxParticles);
  return { points: points.filter((_, i) => i % stride === 0), width, height };
}

export default function LogoParticleFormation({
  active,
  lowPower = false,
  logoBoxRef,
  onComplete,
}: LogoParticleFormationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const completeFiredRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    const q = lowPower ? quality.low : quality.high;
    const formationMs = LOGO_PARTICLE_FORMATION_MS;
    const total = formationMs; // bigBang + drift + gather
    const revealStart = total - gatherMs * revealLeadFraction;
    const revealSpan = revealMs + gatherMs * revealLeadFraction;
    completeFiredRef.current = false;

    // Pre-rendered soft glow sprites — pure silver-white grains (no warm tint).
    const glowWarm = makeGlow([
      [0, 'rgba(255,255,255,1)'],
      [0.2, 'rgba(252,251,249,0.95)'],
      [0.5, 'rgba(232,230,226,0.3)'],
      [1, 'rgba(200,198,194,0)'],
    ]);
    const glowCool = makeGlow([
      [0, 'rgba(255,255,255,1)'],
      [0.22, 'rgba(248,250,252,0.92)'],
      [0.55, 'rgba(220,226,232,0.3)'],
      [1, 'rgba(186,194,204,0)'],
    ]);
    const coreFlash = makeGlow(
      [
        [0, 'rgba(255,255,255,1)'],
        [0.12, 'rgba(252,252,250,0.96)'],
        [0.32, 'rgba(238,238,236,0.55)'],
        [0.6, 'rgba(210,212,214,0.18)'],
        [1, 'rgba(180,184,190,0)'],
      ],
      512,
    );

    const textures: Record<'core' | 'rays' | 'nebula', Texture | null> = {
      core: null,
      rays: null,
      nebula: null,
    };
    const texSrc = {
      core: backgroundAssets.bigBangCore,
      rays: backgroundAssets.bigBangRays,
      nebula: backgroundAssets.bigBangNebula,
    } as const;
    for (const key of q.textures) {
      const img = new Image();
      const tex: Texture = { img, ready: false };
      img.onload = () => {
        if (!cancelled) tex.ready = true;
      };
      img.src = texSrc[key];
      textures[key] = tex;
    }

    let particles: Particle[] = [];
    let dust: Dust[] = [];
    let motes: Mote[] = [];
    let sampleSize = { width: 1, height: 1 };

    const run = async () => {
      try {
        const sampled = await sampleTargetPointsFromLogo(
          backgroundAssets.brandLogoTransparent,
          q.sampleStep,
          q.particleCount,
        );
        if (cancelled) return;
        if (sampled.points.length === 0 || sampled.width === 0 || sampled.height === 0) {
          onCompleteRef.current?.();
          return;
        }

        sampleSize = { width: sampled.width, height: sampled.height };
        particles = buildParticles(sampled.points);
        dust = buildDust(q.dustCount);
        motes = buildMotes(q.moteCount);
        startRef.current = null;

        let canvasW = 0;
        let canvasH = 0;

        const drawFrame = (ms: number) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) {
            onCompleteRef.current?.();
            return;
          }

          const dpr = Math.min(window.devicePixelRatio || 1, q.dprCap);
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          if (w !== canvasW || h !== canvasH) {
            canvasW = w;
            canvasH = h;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          }

          // Align + scale to the crisp logo stage so grains dissolve into BrandLogo
          // with no size/position pop. Fall back to a contained fit if unavailable.
          let cx = w / 2;
          let cy = h / 2;
          let scale =
            Math.min(w / sampleSize.width, h / sampleSize.height) * LOGO_PARTICLE_RENDER_SCALE;
          const box = logoBoxRef?.current;
          if (box) {
            const bRect = box.getBoundingClientRect();
            const cRect = canvas.getBoundingClientRect();
            cx = bRect.left - cRect.left + bRect.width / 2;
            cy = bRect.top - cRect.top + bRect.height / 2;
            scale = (bRect.width / sampleSize.width) * LOGO_PARTICLE_RENDER_SCALE;
          }

          const dmin = Math.min(w, h);
          const dmax = Math.max(w, h);

          ctx.clearRect(0, 0, w, h);

          // Dark "cosmic void" backdrop: the explosion ignites from black so the
          // silver CosmicScene behind the canvas stays hidden during BIG BANG/DRIFT,
          // then recedes through GATHER to seamlessly reveal the silver background +
          // particle band as the logo settles (#224 — match the silver hero backdrop).
          // source-over is explicit: clearRect above leaves compositeOperation unchanged
          // from a previous frame; 'lighter' (set below for particles) would be
          // mathematically equivalent on a cleared canvas, but we make intent explicit.
          {
            const voidFadeStart = bigBangMs + driftMs;
            const voidFadeSpan = Math.max(1, total - voidFadeStart);
            const voidA =
              ms < voidFadeStart
                ? HERO_BIGBANG.voidBackdropPeakAlpha
                : HERO_BIGBANG.voidBackdropPeakAlpha *
                  (1 - easeInOutCubic(Math.min(1, (ms - voidFadeStart) / voidFadeSpan)));
            if (voidA > 0.004) {
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = `rgba(${HERO_BIGBANG.voidBackdropRgb}, ${voidA})`;
              ctx.fillRect(0, 0, w, h);
            }
          }

          let phase: 'BIG BANG' | 'DRIFT' | 'GATHER' | 'LOGO';
          let p: number;
          if (ms < bigBangMs) {
            phase = 'BIG BANG';
            p = ms / bigBangMs;
          } else if (ms < bigBangMs + driftMs) {
            phase = 'DRIFT';
            p = (ms - bigBangMs) / driftMs;
          } else if (ms < total) {
            phase = 'GATHER';
            p = (ms - bigBangMs - driftMs) / gatherMs;
          } else {
            phase = 'LOGO';
            p = 1;
          }

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const drawLayer = (t: Texture | null, size: number, alpha: number, rot: number) => {
            if (!t || !t.ready || alpha <= 0.004) return;
            const ar = t.img.naturalHeight / t.img.naturalWidth || 1;
            const lw = size;
            const lh = size * ar;
            ctx.save();
            ctx.translate(cx, cy);
            if (rot) ctx.rotate(rot);
            ctx.globalAlpha = Math.min(1, alpha);
            ctx.drawImage(t.img, -lw / 2, -lh / 2, lw, lh);
            ctx.restore();
            ctx.globalAlpha = 1;
          };

          const blob = (sprite: HTMLCanvasElement, x: number, y: number, r: number, a: number) => {
            if (a <= 0.003 || r <= 0.2) return;
            ctx.globalAlpha = Math.min(1, a);
            ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
          };

          // organic flicker for "living" plasma (sum of incommensurate sines)
          const flick =
            0.86 +
            0.1 * Math.sin(ms * 0.031) +
            0.06 * Math.sin(ms * 0.073 + 1.3) +
            0.04 * Math.sin(ms * 0.151 + 2.7);
          const energy =
            Math.min(1, easeOutQuint(Math.min(1, ms / 90))) *
            (1 - Math.min(1, ms / (bigBangMs * 0.85))) ** 1.8;

          // (1) Exposure white-out: the camera is momentarily overwhelmed by the flash.
          if (energy > 0.002) {
            ctx.globalAlpha = energy * 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = 1;
          }

          // (2) god-rays: fastest flash-in, widest expansion, counter-rotation
          {
            const life = Math.min(1, ms / (bigBangMs * 0.95));
            if (life < 1) {
              const grow = 0.5 + easeOutCubic(life) * 1.35;
              const a = Math.min(1, ms / 90) * (1 - life) ** 1.6 * flick;
              drawLayer(textures.rays, dmax * 1.9 * grow, a * 0.95, -ms * 0.00006);
              drawLayer(textures.rays, dmax * 1.4 * grow, a * 0.5, ms * 0.00009);
            }
          }
          // (3) plasma core: hot inner core + soft HDR bloom halo, pulsing, slow decay
          {
            const life = Math.min(1, ms / (bigBangMs + driftMs * 0.45));
            if (life < 1) {
              const grow = 0.35 + easeOutCubic(life) * 0.95;
              const pulse = 1 + Math.sin(ms * 0.012) * 0.03;
              const a = Math.min(1, easeOutQuint(Math.min(1, ms / 180))) * (1 - life) ** 1.3 * flick;
              drawLayer(textures.core, dmin * 2.5 * grow * pulse, a * 0.4, ms * 0.00003);
              drawLayer(textures.core, dmin * 1.6 * grow * pulse, a, ms * 0.00004);
              drawLayer(textures.core, dmin * 0.7 * grow, a * 0.9 * flick, -ms * 0.00007);
            }
          }
          // (3b) screen-space light scattering haze — soft glow lingering after flash
          {
            const hl = Math.min(1, ms / (bigBangMs + driftMs));
            const ha = (1 - hl) ** 2.0 * 0.5 + energy * 0.4;
            if (ha > 0.01) {
              const hr = dmin * (0.4 + easeOutCubic(Math.min(1, ms / bigBangMs)) * 0.7);
              const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
              g.addColorStop(0, `rgba(255,255,255,${ha})`);
              g.addColorStop(0.4, `rgba(244,246,250,${ha * 0.4})`);
              g.addColorStop(1, 'rgba(230,236,245,0)');
              ctx.fillStyle = g;
              ctx.fillRect(0, 0, w, h);
            }
          }
          // nebula: volumetric parallax gas — 3 depth layers drift, billow, rotate, pulse
          {
            const driftStart = bigBangMs * 0.4;
            const fadeStart = bigBangMs + driftMs;
            const fadeEnd = total + gatherMs * 0.3;
            let na = ms > driftStart ? Math.min(1, (ms - driftStart) / 700) : 0;
            if (ms > fadeStart) na *= Math.max(0, 1 - (ms - fadeStart) / (fadeEnd - fadeStart));
            const neb = textures.nebula;
            if (na > 0.004 && neb && neb.ready) {
              const ar = neb.img.naturalHeight / neb.img.naturalWidth || 1;
              const grow = 1 + (ms / total) * 0.35;
              const layers: [number, number, number, number, number, number, number, number][] = [
                [2.3, 0.26, 0.000011, 0.045, 0.00034, 1, 0.06, 0.0],
                [1.6, 0.38, -0.000021, 0.075, 0.00052, -1, 0.09, 0.6],
                [1.05, 0.3, 0.00003, 0.115, 0.00072, 1, 0.13, 1.7],
              ];
              for (let i = 0; i < layers.length; i++) {
                const L = layers[i];
                const breathe = 1 + Math.sin(ms * L[4] * 1.7 + i * 2.1) * L[6];
                const size = dmax * L[0] * grow * breathe;
                const ox = Math.sin(ms * L[4] + i * 1.7) * dmax * L[3];
                const oy = Math.cos(ms * L[4] * 0.8 + i * 2.3) * dmax * L[3] * 0.7;
                const bright = 0.82 + 0.18 * Math.sin(ms * 0.0009 + i * 1.4);
                ctx.save();
                ctx.translate(cx + ox, cy + oy);
                ctx.rotate(ms * L[2] + L[7]);
                ctx.scale(L[5], 1);
                ctx.globalAlpha = Math.min(1, na * L[1] * bright);
                ctx.drawImage(neb.img, -size / 2, (-size * ar) / 2, size, size * ar);
                ctx.restore();
              }
              ctx.globalAlpha = 1;
            }

            // fine drifting motes inside the gas (parallax dust)
            if (na > 0.004 && motes.length > 0) {
              for (const m of motes) {
                const ang = m.angle + ms * 0.00002 * (1 - m.depth * 0.5);
                const rad = m.rad * dmax * (0.92 + 0.16 * Math.sin(ms * m.driftSpeed + m.driftPhase));
                const x =
                  cx +
                  Math.cos(ang) * rad +
                  Math.sin(ms * m.driftSpeed * 1.3 + m.driftPhase) * dmax * 0.014 * (1 + m.depth);
                const y =
                  cy +
                  Math.sin(ang) * rad +
                  Math.cos(ms * m.driftSpeed * 1.1 + m.driftPhase) * dmax * 0.011 * (1 + m.depth);
                const tw = Math.sin(ms * 0.001 * m.twSpeed + m.twPhase) * 0.4 + 0.6;
                blob(
                  m.cool ? glowCool : glowWarm,
                  x,
                  y,
                  m.size * 1.3,
                  na * m.opacity * (0.4 + m.depth * 0.6) * tw,
                );
              }
            }
          }

          // procedural shockwave + lens streak (complements the textured light)
          const flashLife = Math.min(1, ms / (bigBangMs * 1.05));
          if (flashLife < 1) {
            const texOn = textures.core?.ready ?? false;
            if (!texOn)
              blob(coreFlash, cx, cy, 90 + easeOutQuint(flashLife) * dmax * 0.55, (1 - flashLife) ** 1.5);
            blob(coreFlash, cx, cy, 60 + flashLife * 40, (1 - flashLife) ** 0.6 * (texOn ? 0.6 : 0.95));
            const streakA = (1 - flashLife) ** 1.8 * 0.7;
            if (streakA > 0.01) {
              const sw = dmax * (0.5 + (1 - flashLife) * 0.7);
              const grad = ctx.createLinearGradient(cx - sw, cy, cx + sw, cy);
              grad.addColorStop(0, 'rgba(240,242,245,0)');
              grad.addColorStop(0.5, `rgba(255,255,255,${streakA})`);
              grad.addColorStop(1, 'rgba(240,242,245,0)');
              ctx.fillStyle = grad;
              const sh = 2 + (1 - flashLife) * 6;
              ctx.fillRect(cx - sw, cy - sh / 2, sw * 2, sh);
            }
            ctx.globalAlpha = 1;
            for (let k = 0; k < 2; k++) {
              const rp = Math.min(1, flashLife * (1 + k * 0.35));
              const rr = easeOutQuint(rp) * dmax * 0.6;
              const ra = (1 - rp) ** 2.2 * 0.5;
              if (ra > 0.01) {
                ctx.strokeStyle = `rgba(248,250,252,${ra})`;
                ctx.lineWidth = 2.2 - rp * 1.6;
                ctx.beginPath();
                ctx.arc(cx, cy, rr, 0, Math.PI * 2);
                ctx.stroke();
              }
            }
          }

          // fine atmospheric dust — peaks during burst, fades before GATHER
          let dustVis = 0;
          if (phase === 'BIG BANG') dustVis = easeOutQuint(p);
          else if (phase === 'DRIFT') dustVis = 1 - p * 0.85;
          else if (phase === 'GATHER') dustVis = Math.max(0, 0.15 - p * 0.15);
          if (dustVis > 0.01 && dust.length > 0) {
            for (const d of dust) {
              let x: number;
              let y: number;
              if (phase === 'BIG BANG') {
                const e = easeOutQuint(p);
                x = cx + d.vx * e * 30;
                y = cy + d.vy * e * 30;
              } else {
                const e = phase === 'DRIFT' ? easeInOutCubic(p) : 1;
                const bx = d.vx * 30;
                const by = d.vy * 30;
                const sway = Math.sin(ms * 0.0015 + d.twPhase) * 10;
                x = cx + bx + (d.dx - bx) * e + sway;
                y = cy + by + (d.dy - by) * e + Math.cos(ms * 0.0013 + d.twPhase) * 9;
              }
              const tw = Math.sin(ms * 0.001 * d.twSpeed + d.twPhase) * 0.3 + 0.7;
              blob(d.cool ? glowCool : glowWarm, x, y, d.size * 1.4, d.opacity * dustVis * tw);
            }
          }

          // structured grains: ONE continuous flight (center→burst→drift→logo)
          const u = splineParam(ms, bigBangMs, driftMs, gatherMs);
          const seg = Math.min(2, Math.floor(u));
          const lt = u - seg;
          const gp = u / 3;
          const swayWin = Math.exp(-((u - 1.5) ** 2) / 0.5);
          const lightKick = 1 + energy * 0.8;

          for (const part of particles) {
            const x1 = part.vx * burstScale;
            const y1 = part.vy * burstScale;
            const x3 = part.tx * scale;
            const y3 = part.ty * scale;
            const xs = [0, x1, part.dx, x3];
            const ys = [0, y1, part.dy, y3];
            const zs = [0, part.z, part.z, part.tz];
            const i0 = Math.max(0, seg - 1);
            const i1 = seg;
            const i2 = Math.min(3, seg + 1);
            const i3 = Math.min(3, seg + 2);

            let x = catmull(xs[i0], xs[i1], xs[i2], xs[i3], lt);
            let y = catmull(ys[i0], ys[i1], ys[i2], ys[i3], lt);
            const z = catmull(zs[i0], zs[i1], zs[i2], zs[i3], lt);

            x += Math.sin(ms * 0.0016 + part.twPhase) * 13 * swayWin;
            y += Math.cos(ms * 0.0014 + part.twPhase) * 11 * swayWin;

            const depthMul = FOCAL / (FOCAL - z);
            const sx = cx + x * depthMul;
            const sy = cy + y * depthMul;

            const drawSize = part.size * (1.5 - gp * 0.6) * depthMul;
            const tw = Math.sin(ms * 0.001 * part.twSpeed + part.twPhase) * 0.16 + 0.84;
            const alpha = part.opacity * (0.45 + gp * 0.55) * tw * lightKick;
            const sprite = part.cool ? glowCool : glowWarm;

            if (u < 1 && part.size > 0.9) {
              const tl = (1 - u) * 24;
              blob(sprite, sx - part.vx * tl * 0.18, sy - part.vy * tl * 0.18, drawSize * 2.4, alpha * 0.2);
            }
            if (part.bright || drawSize > 1.0) {
              blob(sprite, sx, sy, drawSize * (part.bright ? 5.0 : 3.0), alpha * 0.45);
            }
            blob(sprite, sx, sy, drawSize * 1.45, alpha);
            if (part.bright) {
              ctx.globalAlpha = Math.min(1, alpha * 0.7);
              ctx.strokeStyle = 'rgba(255,250,240,0.5)';
              ctx.lineWidth = 0.8;
              const rl = drawSize * 6;
              ctx.beginPath();
              ctx.moveTo(sx - rl, sy);
              ctx.lineTo(sx + rl, sy);
              ctx.moveTo(sx, sy - rl);
              ctx.lineTo(sx, sy + rl);
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 1;

          // logo bloom (behind crisp logo) as the grains settle
          if (gp > 0.82) {
            const lb = (gp - 0.82) / 0.18;
            blob(glowWarm, cx, cy, dmin * 0.4, lb * 0.2);
          }
          ctx.restore();

          // vignette + grade (source-over) — deep navy void
          const vg = ctx.createRadialGradient(cx, cy * 0.95, dmin * 0.25, cx, cy, dmax * 0.75);
          vg.addColorStop(0, 'rgba(0,0,0,0)');
          vg.addColorStop(1, 'rgba(3,2,9,0.62)');
          ctx.fillStyle = vg;
          ctx.fillRect(0, 0, w, h);

          // canvas → crisp logo cross-fade: BrandLogo fades in (onComplete) while the
          // canvas dims, then the parent retires the canvas once the handoff completes.
          if (ms >= revealStart) {
            const fade = easeInOutCubic(Math.min(1, (ms - revealStart) / revealSpan));
            canvas.style.opacity = String(1 - fade * 0.85);
            if (!completeFiredRef.current) {
              completeFiredRef.current = true;
              onCompleteRef.current?.();
            }
          } else {
            canvas.style.opacity = '1';
          }
        };

        const render = (timestamp: number) => {
          if (cancelled) return;
          if (startRef.current === null) startRef.current = timestamp;
          const ms = timestamp - startRef.current;
          drawFrame(ms);
          if (ms < total + revealMs) {
            frameRef.current = window.requestAnimationFrame(render);
          }
        };

        frameRef.current = window.requestAnimationFrame(render);
      } catch {
        if (!cancelled) onCompleteRef.current?.();
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  // logoBoxRef is a stable RefObject — its identity never changes, so it is intentionally
  // omitted from deps. We read .current inside the rAF loop to always get the latest rect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lowPower]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="hero-bigbang-canvas"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
    />
  );
}
