import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const philosophySource = readFileSync(
  resolve(process.cwd(), 'components/PhilosophyContent.tsx'),
  'utf8',
);

describe('usePanelActiveIndex hook', () => {
  const hookSource = readFileSync(
    resolve(process.cwd(), 'lib/hooks/usePanelActiveIndex.ts'),
    'utf8',
  );

  it('observes philosophy panels via IntersectionObserver', () => {
    expect(hookSource).toContain('IntersectionObserver');
    expect(hookSource).toContain('[data-philosophy-panel]');
  });

  // #187: desktop (enableHorizontal) must not pay the IntersectionObserver setup
  // cost since ioActiveIndex is discarded in favour of gsapActiveIndex there.
  it('accepts an enabled option defaulting to true', () => {
    expect(hookSource).toMatch(/enabled\s*=\s*true/);
  });

  it('skips IntersectionObserver setup when enabled is false', () => {
    const effectBody = hookSource.slice(
      hookSource.indexOf('useEffect('),
      hookSource.indexOf('}, [containerRef, enabled]);'),
    );
    expect(effectBody).toMatch(/if\s*\(\s*!enabled\s*\)\s*{/);
    // The early-return guard must appear before the observer is constructed.
    expect(effectBody.indexOf('!enabled')).toBeLessThan(
      effectBody.indexOf('new IntersectionObserver'),
    );
  });

  it('includes enabled in the effect dependency array so toggling re-runs setup', () => {
    expect(hookSource).toMatch(/\[containerRef,\s*enabled\]/);
  });

  // PR #250 review: once `enabled` flips back to false, the hook must not keep
  // returning a stale nonzero index observed while it was previously enabled —
  // the public contract ("returns 0 when disabled") must hold at all times, not
  // just on first mount.
  it('gates the returned value on enabled so stale observed state is never surfaced', () => {
    expect(hookSource).toMatch(/return\s+enabled\s*\?\s*activeIndex\s*:\s*0\s*;/);
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

describe('PhilosophyContent — skip desktop IO setup (#187)', () => {
  it('passes enabled: !enableHorizontal so IO only runs on mobile', () => {
    expect(philosophySource).toMatch(
      /usePanelActiveIndex\(\s*panelsRef,\s*{\s*enabled:\s*!enableHorizontal\s*}\s*\)/,
    );
  });
});
