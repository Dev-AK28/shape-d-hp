'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';
import { isNavItemActive } from '@/lib/navigation/is-nav-active';

const MOBILE_MENU_ID = 'mobile-nav-menu';

export default function Navigation() {
  const reduceMotion = useReducedMotion();
  /** Pathname when menu was opened; auto-closes on route change without effect. */
  const [menuOpenAtPath, setMenuOpenAtPath] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isOpen = menuOpenAtPath === pathname;

  // #368: app/template.tsx wraps page content in a `[data-velocity-content]` div that
  // SmoothScrollProvider applies a GSAP skewY transform to while scrolling (velocity-skew,
  // #312). Any non-`none` transform on an ancestor makes it the containing block for
  // `position: fixed` descendants (CSS Transforms spec), so once that transform engages,
  // this fixed nav stops tracking the viewport and instead scrolls away with the document —
  // it isn't "transparent", it has physically scrolled out of view. Portal the nav to
  // `document.body` (a sibling of the transformed wrapper, not a descendant) so `fixed`
  // stays anchored to the viewport regardless of ancestor transforms. `isMounted` mirrors
  // the useDeviceProfile isReady pattern (useSyncExternalStore w/ no-op subscribe) rather
  // than an effect + setState, so React itself resolves SSR-vs-client without a post-mount
  // re-render flash — rendered in-place on the server/first paint, then swapped to the
  // portal on the client (no visible change since no transform is applied before scroll).
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const portalContainer = isMounted ? document.body : null;

  const closeMenu = useCallback(() => setMenuOpenAtPath(null), []);
  const toggleMenu = useCallback(() => {
    setMenuOpenAtPath((current) => (current === pathname ? null : pathname));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const handleDesktopResize = () => {
      if (desktopQuery.matches) {
        closeMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    desktopQuery.addEventListener('change', handleDesktopResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktopQuery.removeEventListener('change', handleDesktopResize);
    };
  }, [isOpen, closeMenu]);

  const navItems = [
    { name: 'ホーム', href: '/' },
    { name: '商品・サービス', href: '/services' },
    { name: '実績', href: '/works' },
    { name: '制作の流れ', href: '/process' },
    { name: '哲学', href: '/philosophy' },
    { name: 'お問い合わせ', href: '/contact' },
  ];

  const navElement = (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] ${
        reduceMotion ? '' : 'transition-[background-color,border-color,backdrop-filter] duration-300'
      } ${
        isScrolled
          ? 'border-b border-white/10 bg-black/95 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-3 md:px-6 md:pt-[max(1.25rem,env(safe-area-inset-top,0px))] md:pb-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="no-underline nav-link">
            <div className="flex items-center">
              <span className="md:hidden">
                <BrandLogo height={36} priority />
              </span>
              <span className="hidden md:block">
                <BrandLogo height={48} />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — md: (768px) matches MOBILE_BREAKPOINT_PX */}
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link inline-block no-underline"
                data-micro-interaction="nav"
              >
                <div
                  className={`text-sm type-font-serif-jp ${
                    isNavItemActive(pathname, item.href)
                      ? 'text-[color:var(--accent)]'
                      : 'text-[color:var(--muted)]'
                  }`}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            className="nav-menu-button flex h-11 w-11 items-center justify-center bg-transparent border-0 cursor-pointer p-0 md:hidden"
            onClick={toggleMenu}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isOpen}
            aria-controls={MOBILE_MENU_ID}
          >
            <div className="w-6 h-5 relative">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="absolute w-full h-[2px] bg-[var(--accent)]"
              />
              <motion.span
                animate={reduceMotion ? undefined : { opacity: isOpen ? 0 : 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="absolute w-full h-[2px] bg-[var(--accent)] top-[9px]"
              />
              <motion.span
                animate={reduceMotion ? undefined : { rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                className="absolute w-full h-[2px] bg-[var(--accent)] top-[18px]"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={MOBILE_MENU_ID}
            className="absolute top-full left-0 right-0 bg-black/[.98] backdrop-blur-[20px] border-b border-white/10 px-5 py-4 md:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  className="nav-link inline-block no-underline"
                  data-micro-interaction="nav"
                >
                  <div
                    className={`py-4 type-size-body type-font-serif-jp border-b border-white/[.05] ${
                      isNavItemActive(pathname, item.href)
                        ? 'text-[color:var(--accent)]'
                        : 'text-[color:var(--muted)]'
                    }`}
                  >
                    {item.name}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  return portalContainer ? createPortal(navElement, portalContainer) : navElement;
}
