import { describe, expect, it } from 'vitest';
import { buildFocusSelector } from '@/lib/hooks/useFocusRestore';

/**
 * Unit tests for `buildFocusSelector`.
 *
 * The hook `useFocusRestore` relies on this pure function to produce a CSS
 * attribute selector that survives a React remount triggered by a `key` change
 * (`staticReveal` transition — #175).
 *
 * DOM-level integration tests (focus save/restore round-trip) require
 * @testing-library/react + jsdom and are tracked in #175 acceptance criteria.
 */

function makeEl(attrs: Record<string, string>): Element {
  return {
    getAttribute: (name: string) => attrs[name] ?? null,
  } as unknown as Element;
}

describe('buildFocusSelector', () => {
  it('returns an href selector for elements with an href attribute', () => {
    const el = makeEl({ href: '/contact' });
    expect(buildFocusSelector(el)).toBe('[href="/contact"]');
  });

  it('returns an href selector for external URLs', () => {
    const el = makeEl({ href: 'https://www.getgodd.dev/' });
    expect(buildFocusSelector(el)).toBe('[href="https://www.getgodd.dev/"]');
  });

  it('returns an href selector for process page links', () => {
    const el = makeEl({ href: '/process/development' });
    expect(buildFocusSelector(el)).toBe('[href="/process/development"]');
  });

  it('returns a data-focus-id selector when href is absent', () => {
    const el = makeEl({ 'data-focus-id': 'submit-btn' });
    expect(buildFocusSelector(el)).toBe('[data-focus-id="submit-btn"]');
  });

  it('prefers href over data-focus-id when both are present', () => {
    const el = makeEl({ href: '/contact', 'data-focus-id': 'cta' });
    expect(buildFocusSelector(el)).toBe('[href="/contact"]');
  });

  it('returns null when neither href nor data-focus-id is present', () => {
    const el = makeEl({ class: 'btn', type: 'button' });
    expect(buildFocusSelector(el)).toBeNull();
  });

  it('returns null for an element with no attributes', () => {
    const el = makeEl({});
    expect(buildFocusSelector(el)).toBeNull();
  });

  it('preserves query string in href selector without modification', () => {
    const el = makeEl({ href: '/search?q=test&page=2' });
    expect(buildFocusSelector(el)).toBe('[href="/search?q=test&page=2"]');
  });
});
