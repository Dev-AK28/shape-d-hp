'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Returns a CSS attribute selector string that can locate `el` within its
 * container after a React remount caused by a `key` change.
 *
 * Resolution order:
 * 1. `href` — stable across remounts for anchor/area elements
 * 2. `data-focus-id` — opt-in stable identifier for other interactive elements
 *
 * Returns `null` when no stable selector is available.
 *
 * @internal Exported separately from the hook so the pure logic can be unit-tested
 *           without a DOM environment.
 */
export function buildFocusSelector(el: Element): string | null {
  const href = el.getAttribute('href');
  if (href !== null) return `[href="${href}"]`;
  const focusId = el.getAttribute('data-focus-id');
  if (focusId !== null) return `[data-focus-id="${focusId}"]`;
  return null;
}

/**
 * Saves and restores keyboard focus when `trigger` changes.
 *
 * ## Problem
 * Components that use `key={staticReveal ? 'static' : 'reveal'}` force React to
 * unmount and remount descendants when `staticReveal` changes (e.g. on a
 * desktop→mobile breakpoint resize). Any element with keyboard focus is
 * destroyed during the unmount, which silently resets `document.activeElement`
 * to `document.body` (#155, #175).
 *
 * ## Solution
 * 1. Continuously tracks the last focused descendant via a `focusin` listener.
 * 2. After `trigger` changes (i.e. after children remount), queries the new DOM
 *    for an equivalent element using `buildFocusSelector` and calls `.focus()`.
 *
 * Focus can only be restored for elements with a stable `href` or
 * `data-focus-id` attribute. Elements without either are silently ignored —
 * this matches the current (broken) behaviour, so there is no regression.
 *
 * @param trigger - The boolean that drives the `key` switch (typically `staticReveal`).
 * @returns A ref to attach to the outermost container element of the section.
 *
 * @example
 * ```tsx
 * function ServicesContent() {
 *   const { staticReveal } = useStaticReveal();
 *   const focusGuardRef = useFocusRestore(staticReveal);
 *   return <section ref={focusGuardRef}>...</section>;
 * }
 * ```
 */
export function useFocusRestore(trigger: boolean): RefObject<HTMLElement | null> {
  const containerRef = useRef<HTMLElement | null>(null);
  const savedSelectorRef = useRef<string | null>(null);

  // Track the last focused element within the container.
  useLayoutEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const container = containerRef.current;
      if (!container || !(e.target instanceof Element)) return;
      if (!container.contains(e.target)) return;
      savedSelectorRef.current = buildFocusSelector(e.target);
    }

    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // After trigger changes, restore focus to the equivalent element in the new DOM.
  // useLayoutEffect fires synchronously after the DOM is updated, ensuring the
  // new children (with their new key) are already mounted before we query.
  useLayoutEffect(() => {
    const selector = savedSelectorRef.current;
    if (!selector || !containerRef.current) return;

    savedSelectorRef.current = null;
    const el = containerRef.current.querySelector<HTMLElement>(selector);
    if (el) el.focus({ preventScroll: true });
  }, [trigger]);

  return containerRef;
}
