'use client';

import { useState, useEffect, useCallback } from 'react';
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] ${
        reduceMotion ? '' : 'transition-all duration-300'
      } ${
        isScrolled
          ? 'border-b border-white/10 bg-black/95 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-6 md:py-5">
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
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: isNavItemActive(pathname, item.href)
                      ? 'var(--accent)'
                      : 'var(--muted)',
                    fontFamily: 'var(--font-serif-jp)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {item.name}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            type="button"
            className="nav-menu-button flex h-11 w-11 items-center justify-center p-0 md:hidden"
            onClick={toggleMenu}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isOpen}
            aria-controls={MOBILE_MENU_ID}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: '24px', height: '20px', position: 'relative' }}>
              <motion.span
                animate={reduceMotion ? undefined : { rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: 'var(--accent)',
                }}
              />
              <motion.span
                animate={reduceMotion ? undefined : { opacity: isOpen ? 0 : 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: 'var(--accent)',
                  top: '9px',
                }}
              />
              <motion.span
                animate={reduceMotion ? undefined : { rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: 'var(--accent)',
                  top: '18px',
                }}
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
            className="md:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(0, 0, 0, 0.98)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px 20px',
            }}
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
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      padding: '16px 0',
                      fontSize: '16px',
                      color: isNavItemActive(pathname, item.href)
                        ? 'var(--accent)'
                        : 'var(--muted)',
                      fontFamily: 'var(--font-serif-jp)',
                      letterSpacing: '0.1em',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
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
}
