import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const philosophySource = readFileSync(
  resolve(process.cwd(), 'components/PhilosophyContent.tsx'),
  'utf8',
);

describe('usePanelActiveIndex hook', () => {
  it('observes philosophy panels via IntersectionObserver', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'lib/hooks/usePanelActiveIndex.ts'),
      'utf8',
    );

    expect(source).toContain('IntersectionObserver');
    expect(source).toContain('[data-philosophy-panel]');
  });
});

describe('PhilosophyContent structure', () => {
  it('keeps CTA outside snap container and uses panel ref for GSAP snap', () => {
    expect(philosophySource).toContain('panelsRef');
    expect(philosophySource).toContain('usePanelActiveIndex');
    expect(philosophySource).toMatch(/ref=\{panelsRef\}[\s\S]*data-philosophy-panel/);
    expect(philosophySource).not.toMatch(/onEnter:\s*\(\)\s*=>\s*setActiveIndex/);
  });
});

describe('PhilosophyContent — resize handling (#186)', () => {
  it('uses function-based end to auto-recalculate on ScrollTrigger.refresh()', () => {
    expect(philosophySource).toMatch(/end:\s*\(\)\s*=>/);
  });

  it('uses function-based x so tl.invalidate() re-evaluates scroll distance', () => {
    expect(philosophySource).toMatch(/x:\s*\(\)\s*=>/);
  });

  it('registers refreshInit listener to call tl.invalidate() on resize', () => {
    expect(philosophySource).toContain("addEventListener('refreshInit'");
    expect(philosophySource).toContain('invalidate()');
    expect(philosophySource).toContain("removeEventListener('refreshInit'");
  });

  it('stores timeline in a ref for refreshInit callback access', () => {
    expect(philosophySource).toContain('tlRef');
    expect(philosophySource).toMatch(/tlRef\.current\s*=\s*tl/);
  });
});
