/**
 * @vitest-environment jsdom
 *
 * Integration tests for the Lenis-aware scroll path of useHorizontalFocusSync (#260).
 *
 * The pure scroll-target formula (`computePanelScrollTarget`) is unit-tested in
 * use-horizontal-focus-sync.test.ts. These tests exercise the runtime branch added
 * in #260: when a Lenis instance is provided via LenisContext, focus sync must call
 * `lenis.scrollTo(target, { immediate: false })`; when Lenis is absent (null), it
 * must fall back to native `window.scrollTo`.
 */

import React, { createRef, type RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type Lenis from 'lenis';
import { LenisContext } from '@/lib/scroll/lenis-context';
import { useHorizontalFocusSync } from '@/lib/hooks/useHorizontalFocusSync';

const PANEL_SELECTOR = '[data-test-panel]';

/** Builds a panels container with `count` panels, each holding a focusable button. */
function buildPanels(count: number): { container: HTMLElement; buttons: HTMLButtonElement[] } {
  const container = document.createElement('div');
  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < count; i += 1) {
    const panel = document.createElement('div');
    panel.setAttribute('data-test-panel', '');
    const button = document.createElement('button');
    button.textContent = `cta-${i}`;
    panel.appendChild(button);
    container.appendChild(panel);
    buttons.push(button);
  }
  document.body.appendChild(container);
  return { container, buttons };
}

/** Test harness component that wires the hook to fixed refs under a LenisContext value. */
function Harness({
  panelsRef,
  tlRef,
  lenis,
}: {
  panelsRef: RefObject<HTMLElement | null>;
  tlRef: RefObject<gsap.core.Timeline | null>;
  lenis: Lenis | null;
}) {
  return (
    <LenisContext.Provider value={lenis}>
      <FocusSyncConsumer panelsRef={panelsRef} tlRef={tlRef} />
    </LenisContext.Provider>
  );
}

function FocusSyncConsumer({
  panelsRef,
  tlRef,
}: {
  panelsRef: RefObject<HTMLElement | null>;
  tlRef: RefObject<gsap.core.Timeline | null>;
}) {
  useHorizontalFocusSync(panelsRef, PANEL_SELECTOR, tlRef, true);
  return null;
}

let scrollToSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollToSpy = vi.fn();
  vi.stubGlobal('scrollTo', scrollToSpy);
  // jsdom leaves innerWidth at 1024; keep scrollY at 0 so the target differs from current.
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useHorizontalFocusSync — Lenis-aware scroll path (#260)', () => {
  it('calls lenis.scrollTo(target, { immediate: false }) when Lenis is active', () => {
    const { container, buttons } = buildPanels(3);
    const panelsRef = createRef<HTMLElement>() as RefObject<HTMLElement | null>;
    panelsRef.current = container;
    const tlRef = { current: { scrollTrigger: { start: 100 } } } as unknown as RefObject<gsap.core.Timeline | null>;

    const lenis = { scrollTo: vi.fn() } as unknown as Lenis;
    render(<Harness panelsRef={panelsRef} tlRef={tlRef} lenis={lenis} />);

    // Focus the button in panel index 1 → target = 100 + 1 * innerWidth(1024) = 1124.
    buttons[1].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(lenis.scrollTo).toHaveBeenCalledTimes(1);
    expect(lenis.scrollTo).toHaveBeenCalledWith(100 + window.innerWidth, { immediate: false });
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('falls back to window.scrollTo when Lenis is inactive (null)', () => {
    const { container, buttons } = buildPanels(3);
    const panelsRef = createRef<HTMLElement>() as RefObject<HTMLElement | null>;
    panelsRef.current = container;
    const tlRef = { current: { scrollTrigger: { start: 100 } } } as unknown as RefObject<gsap.core.Timeline | null>;

    render(<Harness panelsRef={panelsRef} tlRef={tlRef} lenis={null} />);

    buttons[2].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    // panel index 2 → target = 100 + 2 * 1024 = 2148.
    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 100 + 2 * window.innerWidth });
  });
});
