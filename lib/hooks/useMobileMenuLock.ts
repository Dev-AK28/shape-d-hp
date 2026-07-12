'use client';

import { useEffect } from 'react';

/**
 * Shared mobile-menu side effects — Navigation.tsx and TopNav.tsx both open a
 * `position: fixed` full-width menu on mobile and need the same three
 * behaviors while it's open (#385):
 *
 *   1. lock `body.style.overflow` so the page behind the menu can't scroll
 *   2. close on `Escape`
 *   3. auto-close if the viewport crosses the `md` (768px) breakpoint into
 *      desktop width, where the mobile menu no longer applies
 *
 * `768px` matches the `md:` Tailwind breakpoint used by both Navigation.tsx
 * and TopNav.tsx for MOBILE_BREAKPOINT_PX (see comments at each call site).
 */
export function useMobileMenuLock(isOpen: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
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
    };
  }, [isOpen, onClose]);
}
