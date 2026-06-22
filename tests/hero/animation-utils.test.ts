import { describe, expect, it } from 'vitest';
import {
  buildDust,
  buildMotes,
  buildParticles,
  catmull,
  easeInOutCubic,
  easeInOutSine,
  easeOutCubic,
  easeOutQuint,
  splineParam,
} from '@/lib/hero/animation-utils';

// ─── Easing functions ─────────────────────────────────────────────────────────

describe('easeOutCubic', () => {
  it('maps 0→0 and 1→1', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it('is monotonically increasing on [0,1]', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map(easeOutCubic);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  it('stays in [0,1] for inputs in [0,1]', () => {
    [0, 0.1, 0.5, 0.9, 1].forEach((p) => {
      expect(easeOutCubic(p)).toBeGreaterThanOrEqual(0);
      expect(easeOutCubic(p)).toBeLessThanOrEqual(1);
    });
  });
});

describe('easeOutQuint', () => {
  it('maps 0→0 and 1→1', () => {
    expect(easeOutQuint(0)).toBe(0);
    expect(easeOutQuint(1)).toBe(1);
  });

  it('has steeper initial slope than easeOutCubic at midpoint', () => {
    expect(easeOutQuint(0.5)).toBeGreaterThan(easeOutCubic(0.5));
  });

  it('is monotonically increasing on [0,1]', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map(easeOutQuint);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  it('stays in [0,1] for inputs in [0,1]', () => {
    [0, 0.1, 0.5, 0.9, 1].forEach((p) => {
      expect(easeOutQuint(p)).toBeGreaterThanOrEqual(0);
      expect(easeOutQuint(p)).toBeLessThanOrEqual(1);
    });
  });
});

describe('easeInOutCubic', () => {
  it('maps 0→0 and 1→1', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('passes through (0.5, 0.5)', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
  });

  it('is monotonically increasing on [0,1]', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map(easeInOutCubic);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  it('is symmetric: f(x) = 1 - f(1-x)', () => {
    [0.1, 0.25, 0.4].forEach((x) => {
      expect(easeInOutCubic(x)).toBeCloseTo(1 - easeInOutCubic(1 - x), 10);
    });
  });
});

describe('easeInOutSine', () => {
  it('maps 0→0 and 1→1', () => {
    expect(easeInOutSine(0)).toBeCloseTo(0, 10);
    expect(easeInOutSine(1)).toBeCloseTo(1, 10);
  });

  it('passes through (0.5, 0.5)', () => {
    expect(easeInOutSine(0.5)).toBeCloseTo(0.5, 10);
  });

  it('is monotonically increasing on [0,1]', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map(easeInOutSine);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  it('stays in [0,1] for inputs in [0,1]', () => {
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => {
      const v = easeInOutSine(p);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });
});

// ─── Catmull-Rom spline ───────────────────────────────────────────────────────

describe('catmull', () => {
  it('returns p1 at t=0', () => {
    expect(catmull(0, 1, 2, 3, 0)).toBeCloseTo(1);
  });

  it('returns p2 at t=1', () => {
    expect(catmull(0, 1, 2, 3, 1)).toBeCloseTo(2);
  });

  it('interpolates linearly for uniformly-spaced control points', () => {
    // p0=0,p1=1,p2=2,p3=3 → linear segment between p1 and p2
    expect(catmull(0, 1, 2, 3, 0.5)).toBeCloseTo(1.5);
  });

  it('stays between p1 and p2 for t in [0,1] (uniform spacing)', () => {
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const v = catmull(0, 1, 2, 3, t);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(2);
    });
  });
});

// ─── splineParam ──────────────────────────────────────────────────────────────

describe('splineParam', () => {
  const BB = 1100;
  const DR = 1200;
  const GA = 1800;

  it('returns 0 at ms=0 (BIG BANG start)', () => {
    expect(splineParam(0, BB, DR, GA)).toBeCloseTo(0);
  });

  it('returns 1 at ms=bigBangMs (BIG BANG end)', () => {
    expect(splineParam(BB, BB, DR, GA)).toBeCloseTo(1);
  });

  it('returns 2 at ms=bigBangMs+driftMs (DRIFT end)', () => {
    expect(splineParam(BB + DR, BB, DR, GA)).toBeCloseTo(2);
  });

  it('returns 3 at ms=total (GATHER end)', () => {
    expect(splineParam(BB + DR + GA, BB, DR, GA)).toBeCloseTo(3);
  });

  it('clamps to 3 beyond total', () => {
    expect(splineParam(BB + DR + GA + 9999, BB, DR, GA)).toBe(3);
  });

  it('stays in [0,3] throughout the animation range', () => {
    [0, 500, BB, BB + 1, BB + DR / 2, BB + DR, BB + DR + GA / 2, BB + DR + GA, BB + DR + GA + 1000].forEach(
      (ms) => {
        const u = splineParam(ms, BB, DR, GA);
        expect(u).toBeGreaterThanOrEqual(0);
        expect(u).toBeLessThanOrEqual(3);
      },
    );
  });

  it('is monotonically non-decreasing', () => {
    const msList = [0, 200, BB / 2, BB, BB + 100, BB + DR / 2, BB + DR, BB + DR + GA / 2, BB + DR + GA];
    const vals = msList.map((ms) => splineParam(ms, BB, DR, GA));
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i]).toBeGreaterThanOrEqual(vals[i - 1]);
    }
  });
});

// ─── buildParticles ───────────────────────────────────────────────────────────

describe('buildParticles', () => {
  it('returns one particle per target point', () => {
    const targets = [{ x: 0, y: 0 }, { x: 10, y: 20 }];
    expect(buildParticles(targets)).toHaveLength(2);
  });

  it('returns empty array for empty targets', () => {
    expect(buildParticles([])).toHaveLength(0);
  });

  it('preserves tx and ty from target points', () => {
    const [p] = buildParticles([{ x: 42, y: -7 }]);
    expect(p.tx).toBe(42);
    expect(p.ty).toBe(-7);
  });

  it('produces opacity in [0.26, 0.72]', () => {
    const particles = buildParticles(Array.from({ length: 200 }, (_, i) => ({ x: i, y: 0 })));
    for (const p of particles) {
      expect(p.opacity).toBeGreaterThanOrEqual(0.26);
      expect(p.opacity).toBeLessThanOrEqual(0.72);
    }
  });

  it('produces positive size below 1.2', () => {
    const particles = buildParticles(Array.from({ length: 200 }, (_, i) => ({ x: i, y: i })));
    for (const p of particles) {
      expect(p.size).toBeGreaterThan(0);
      expect(p.size).toBeLessThan(1.2);
    }
  });

  it('produces twPhase in [0, 2π]', () => {
    const particles = buildParticles(Array.from({ length: 200 }, (_, i) => ({ x: i, y: 0 })));
    for (const p of particles) {
      expect(p.twPhase).toBeGreaterThanOrEqual(0);
      expect(p.twPhase).toBeLessThanOrEqual(Math.PI * 2);
    }
  });
});

// ─── buildDust ────────────────────────────────────────────────────────────────

describe('buildDust', () => {
  it('returns exactly n dust particles', () => {
    expect(buildDust(0)).toHaveLength(0);
    expect(buildDust(1)).toHaveLength(1);
    expect(buildDust(50)).toHaveLength(50);
  });

  it('produces size in [0.22, 0.77]', () => {
    for (const d of buildDust(200)) {
      expect(d.size).toBeGreaterThanOrEqual(0.22);
      expect(d.size).toBeLessThanOrEqual(0.77);
    }
  });

  it('produces opacity in [0.1, 0.36]', () => {
    for (const d of buildDust(200)) {
      expect(d.opacity).toBeGreaterThanOrEqual(0.1);
      expect(d.opacity).toBeLessThanOrEqual(0.36);
    }
  });

  it('produces twPhase in [0, 2π]', () => {
    for (const d of buildDust(200)) {
      expect(d.twPhase).toBeGreaterThanOrEqual(0);
      expect(d.twPhase).toBeLessThanOrEqual(Math.PI * 2);
    }
  });
});

// ─── buildMotes ───────────────────────────────────────────────────────────────

describe('buildMotes', () => {
  it('returns exactly n motes', () => {
    expect(buildMotes(0)).toHaveLength(0);
    expect(buildMotes(1)).toHaveLength(1);
    expect(buildMotes(30)).toHaveLength(30);
  });

  it('produces depth in [0, 1]', () => {
    for (const m of buildMotes(200)) {
      expect(m.depth).toBeGreaterThanOrEqual(0);
      expect(m.depth).toBeLessThanOrEqual(1);
    }
  });

  it('produces driftSpeed in [0.0003, 0.0009]', () => {
    for (const m of buildMotes(200)) {
      expect(m.driftSpeed).toBeGreaterThanOrEqual(0.0003);
      expect(m.driftSpeed).toBeLessThanOrEqual(0.0009);
    }
  });

  it('produces angle in [0, 2π]', () => {
    for (const m of buildMotes(200)) {
      expect(m.angle).toBeGreaterThanOrEqual(0);
      expect(m.angle).toBeLessThanOrEqual(Math.PI * 2);
    }
  });

  it('produces rad above 0.04', () => {
    for (const m of buildMotes(200)) {
      expect(m.rad).toBeGreaterThanOrEqual(0.04);
    }
  });
});
