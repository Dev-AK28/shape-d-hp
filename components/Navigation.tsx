'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
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
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
      backdropFilter: isScrolled ? 'blur(20px)' : 'none',
      borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ fontSize: '24px', fontWeight: 300, color: 'white', fontFamily: 'serif', letterSpacing: '0.1em' }}
            >
              SHAPE<span style={{ color: '#60a5fa' }}>∞</span>D
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div style={{ display: isMobile ? 'none' : 'flex', gap: '32px', alignItems: 'center' }}>
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  style={{
                    fontSize: '14px',
                    color: pathname === item.href ? '#60a5fa' : '#9ca3af',
                    transition: 'color 0.3s ease',
                    fontFamily: 'serif',
                    letterSpacing: '0.1em'
                  }}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
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
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: '#60a5fa',
                  transition: 'all 0.3s ease'
                }}
              />
              <motion.span
                animate={{ opacity: isOpen ? 0 : 1 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: '#60a5fa',
                  top: '9px',
                  transition: 'all 0.3s ease'
                }}
              />
              <motion.span
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '2px',
                  background: '#60a5fa',
                  top: '18px',
                  transition: 'all 0.3s ease'
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileHover={{ x: 8 }}
                    style={{
                      padding: '16px 0',
                      fontSize: '16px',
                      color: pathname === item.href ? '#60a5fa' : '#9ca3af',
                      fontFamily: 'serif',
                      letterSpacing: '0.1em',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {item.name}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
