import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
    const source = readFileSync(
      resolve(process.cwd(), 'components/PhilosophyContent.tsx'),
      'utf8',
    );

    expect(source).toContain('panelsRef');
    expect(source).toContain('usePanelActiveIndex');
    expect(source).toMatch(/ref=\{panelsRef\}[\s\S]*data-philosophy-panel/);
    expect(source).not.toMatch(/onEnter:\s*\(\)\s*=>\s*setActiveIndex/);
  });
});
