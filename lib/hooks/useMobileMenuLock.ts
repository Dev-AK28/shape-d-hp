'use client';

import { useEffect, type RefObject } from 'react';

/** Elements considered reachable by Tab — mirrors the common WAI-ARIA focus-trap selector list. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Shared mobile-menu side effects — Navigation.tsx and TopNav.tsx both open a
 * `position: fixed` full-width menu on mobile and need the same behaviors
 * while it's open (#385, focus trap added for #398):
 *
 *   1. lock `body.style.overflow` so the page behind the menu can't scroll
 *   2. close on `Escape`
 *   3. auto-close if the viewport crosses the `md` (768px) breakpoint into
 *      desktop width, where the mobile menu no longer applies
 *   4. move focus to the first focusable element inside `panelRef` on open
 *   5. trap Tab / Shift+Tab within `panelRef` while open (cycles last→first
 *      and first→last instead of escaping to background content)
 *   6. mark the page's `<main>` inert + aria-hidden while open, so background
 *      content can't be reached by Tab, screen-reader virtual cursor, or
 *      pointer, restoring its previous state on close
 *
 * `768px` matches the `md:` Tailwind breakpoint used by both Navigation.tsx
 * and TopNav.tsx for MOBILE_BREAKPOINT_PX (see comments at each call site).
 *
 * `<main>` (not the whole document body) is the target for #6 because both
 * consumers render their menu panel as a *sibling* of `<main>` rather than an
 * ancestor of it — Navigation.tsx portals its `<nav>` to `document.body`
 * (#368), and TopNav.tsx renders inline as a sibling of `<main>` inside
 * TopShell — so hiding `<main>` never hides the open menu panel itself.
 */
export function useMobileMenuLock(
  isOpen: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const main = document.querySelector('main');
    const previousMainInert = main?.inert ?? null;
    const previousMainAriaHidden = main?.getAttribute('aria-hidden') ?? null;
    if (main) {
      main.inert = true;
      main.setAttribute('aria-hidden', 'true');
    }

    const panel = panelRef.current;
    // Move focus into the panel on open (first nav link, typically) so
    // keyboard users land inside the menu instead of on whatever element was
    // behind it.
    if (panel) {
      getFocusableElements(panel)[0]?.focus({ preventScroll: true });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panel) {
        return;
      }

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panel.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !panel.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const handleDesktopResize = () => {
      if (desktopQuery.matches) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    desktopQuery.addEventListener('change', handleDesktopResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktopQuery.removeEventListener('change', handleDesktopResize);

      if (main) {
        main.inert = previousMainInert ?? false;
        if (previousMainAriaHidden === null) {
          main.removeAttribute('aria-hidden');
        } else {
          main.setAttribute('aria-hidden', previousMainAriaHidden);
        }
      }
    };
  }, [isOpen, onClose, panelRef]);
}
