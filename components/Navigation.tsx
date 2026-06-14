'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/BrandLogo';

const MOBILE_MENU_ID = 'mobile-nav-menu';

export default function Navigation() {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { name: 'ホーム', href: '/' },
    { name: '商品・サービス', href: '/services' },
    { name: '実績', href: '/works' },
    { name: '制作の流れ', href: '/process' },
    { name: '哲学', href: '/philosophy' },
    { name: 'お問い合わせ', href: '/contact' }
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
      <div className="mx-auto max-w-[1400px] px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="no-underline nav-link">
            <div className="flex items-center">
              <BrandLogo height={48} priority />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: isMobile ? 'none' : 'flex', gap: '32px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="nav-link" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    fontSize: '14px',
                    color: pathname === item.href ? 'var(--accent)' : 'var(--muted)',
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
            className="nav-menu-button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
            aria-expanded={isOpen}
            aria-controls={MOBILE_MENU_ID}
            style={{
              display: isMobile ? 'block' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
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
                  transition: reduceMotion ? undefined : 'all 0.3s ease',
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
                  transition: reduceMotion ? undefined : 'all 0.3s ease',
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
                  transition: reduceMotion ? undefined : 'all 0.3s ease',
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
              padding: '24px'
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
                  onClick={() => setIsOpen(false)}
                  className="nav-link"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      padding: '16px 0',
                      fontSize: '16px',
                      color: pathname === item.href ? 'var(--accent)' : 'var(--muted)',
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
