import type { LogoSamplePoint } from '@/lib/hero/sample-logo-target-points';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Particle = {
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  tx: number;
  ty: number;
  tz: number;
  z: number;
  size: number;
  opacity: number;
  cool: boolean;
  twPhase: number;
  twSpeed: number;
  bright: boolean;
};

export type Dust = {
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
  cool: boolean;
  twPhase: number;
  twSpeed: number;
};

export type Mote = {
  angle: number;
  rad: number;
  depth: number;
  size: number;
  opacity: number;
  cool: boolean;
  twPhase: number;
  twSpeed: number;
  driftPhase: number;
  driftSpeed: number;
};

// ─── Easing ───────────────────────────────────────────────────────────────────

export function easeOutCubic(p: number) {
  return 1 - (1 - p) ** 3;
}

export function easeOutQuint(p: number) {
  return 1 - (1 - p) ** 5;
}

export function easeInOutCubic(p: number) {
  return p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
}

export function easeInOutSine(p: number) {
  return -(Math.cos(Math.PI * p) - 1) / 2;
}

// ─── Catmull-Rom spline ───────────────────────────────────────────────────────

/** Catmull-Rom: C1-continuous interpolation through 4 control points. */
export function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/**
 * Maps the elapsed clock to a single spline parameter u in [0,3]:
 * segment 0 = center→burst (explosive), 1 = burst→drift (slow float),
 * 2 = drift→logo (gather). Keeps the whole motion C1-continuous (no phase cuts).
 */
export function splineParam(
  ms: number,
  bigBangMs: number,
  driftMs: number,
  gatherMs: number,
): number {
  if (ms < bigBangMs) return easeOutQuint(ms / bigBangMs);
  if (ms < bigBangMs + driftMs) return 1 + easeInOutSine((ms - bigBangMs) / driftMs);
  const total = bigBangMs + driftMs + gatherMs;
  if (ms < total) return 2 + easeInOutCubic((ms - bigBangMs - driftMs) / gatherMs);
  return 3;
}

// ─── Particle builders ────────────────────────────────────────────────────────

export function buildParticles(targets: LogoSamplePoint[]): Particle[] {
  return targets.map((t) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 22;
    const driftAngle = Math.random() * Math.PI * 2;
    const driftRadius = 120 + Math.random() * 400;
    const depthLayer = Math.random() ** 0.7;
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      dx: Math.cos(driftAngle) * driftRadius,
      dy: Math.sin(driftAngle) * driftRadius,
      tx: t.x,
      ty: t.y,
      tz: (Math.random() - 0.5) * 24,
      z: (Math.random() - 0.5) * 60,
      size: (0.32 + Math.random() * 0.7) * (1.15 - depthLayer * 0.45),
      opacity: 0.26 + Math.random() * 0.46,
      cool: Math.random() < 0.5,
      twPhase: Math.random() * 6.28,
      twSpeed: 0.6 + Math.random() * 1.6,
      bright: Math.random() < 0.012,
    };
  });
}

export function buildDust(n: number): Dust[] {
  const arr: Dust[] = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 30;
    const driftAngle = Math.random() * Math.PI * 2;
    const driftRadius = 80 + Math.random() * 620;
    arr.push({
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      dx: Math.cos(driftAngle) * driftRadius,
      dy: Math.sin(driftAngle) * driftRadius,
      size: 0.22 + Math.random() * 0.55,
      opacity: 0.1 + Math.random() * 0.26,
      cool: Math.random() < 0.55,
      twPhase: Math.random() * 6.28,
      twSpeed: 0.5 + Math.random() * 2.0,
    });
  }
  return arr;
}

export function buildMotes(n: number): Mote[] {
  const arr: Mote[] = [];
  for (let i = 0; i < n; i++) {
    const depth = Math.random() ** 0.7;
    arr.push({
      angle: Math.random() * Math.PI * 2,
      rad: 0.04 + Math.random() ** 0.85 * 0.72,
      depth,
      size: (0.3 + Math.random() * 0.7) * (1.25 - depth * 0.5),
      opacity: 0.16 + Math.random() * 0.32,
      cool: Math.random() < 0.5,
      twPhase: Math.random() * 6.28,
      twSpeed: 0.5 + Math.random() * 2.2,
      driftPhase: Math.random() * 6.28,
      driftSpeed: 0.0003 + Math.random() * 0.0006,
    });
  }
  return arr;
}
