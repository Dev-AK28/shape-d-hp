'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Saved focus target: both the CSS selector and the 0-based occurrence index
 * within the container. The index disambiguates duplicate-`href` elements
 * (e.g. multiple "Process Details" links in ServicesContent).
 */
type FocusTarget = {
  selector: string;
  /** 0-based index of the focused element among all `selector` matches in the container. */
  index: number;
};

/**
 * Returns a CSS attribute selector string that can locate `el` within its
 * container after a React remount caused by a `key` change.
 *
 * Resolution order:
 * 1. `href` — stable across remounts for anchor/area elements
 * 2. `data-focus-id` — opt-in stable identifier for other interactive elements.
 *    Must not contain `"` characters, as the value is embedded verbatim in a
 *    CSS attribute selector string.
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
 *    Saves both the CSS selector and occurrence index to handle duplicate `href`
 *    values within the same container (e.g. multiple "Process Details" links).
 * 2. After `trigger` changes (i.e. after children remount), restores focus only
 *    when `document.activeElement` is `body` — indicating the remount destroyed
 *    the focused element. If focus is on a different element, the user intentionally
 *    navigated away; the saved target is discarded without restoring.
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
 *
 * // For non-section container elements, specify the element type explicitly:
 * function ProcessNavigation() {
 *   const { staticReveal } = useStaticReveal();
 *   const focusGuardRef = useFocusRestore<HTMLDivElement>(staticReveal);
 *   return <div ref={focusGuardRef}>...</div>;
 * }
 * ```
 */
export function useFocusRestore<T extends HTMLElement = HTMLElement>(
  trigger: boolean,
): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const savedTargetRef = useRef<FocusTarget | null>(null);

  // Track the last focused element within the container.
  useLayoutEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const container = containerRef.current;
      if (!container || !(e.target instanceof Element)) return;
      if (!container.contains(e.target)) return;

      const selector = buildFocusSelector(e.target);
      if (selector === null) return; // Don't overwrite a valid target with null

      // Record occurrence index to disambiguate elements with the same href
      // (e.g. multiple "Process Details" links in ServicesContent).
      const matches = Array.from(container.querySelectorAll(selector));
      const index = matches.indexOf(e.target);
      savedTargetRef.current = { selector, index: index >= 0 ? index : 0 };
    }

    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // After trigger changes, restore focus to the equivalent element in the new DOM.
  // useLayoutEffect fires synchronously after the DOM is updated, ensuring the
  // new children (with their new key) are already mounted before we query.
  useLayoutEffect(() => {
    const target = savedTargetRef.current;
    if (!target || !containerRef.current) return;

    // Only restore when focus fell to body/html — the sign that the remount destroyed
    // the focused element. If focus is already on another element, the user intentionally
    // navigated away before the resize; respect that choice and discard the saved target.
    const activeEl = document.activeElement;
    const focusWasLost =
      activeEl === document.body ||
      activeEl === document.documentElement ||
      activeEl === null;

    savedTargetRef.current = null;
    if (!focusWasLost) return;

    const matches = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(target.selector),
    );
    const el = matches[target.index] ?? matches[0];
    if (el) el.focus({ preventScroll: true });
  }, [trigger]);

  return containerRef as RefObject<T | null>;
}
