'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { topShell } from '@/lib/design/tokens';
import { useMobileMenuLock } from '@/lib/hooks/useMobileMenuLock';

const MOBILE_MENU_ID = 'mobile-nav-menu';

/** 下層ページ導線（#314 暫定方針 — 参照HTMLビジュアル基調でリンク維持） */
const NAV_LINKS = [
  { name: '商品・サービス', href: '/services' },
  { name: '実績', href: '/works' },
  { name: '制作の流れ', href: '/process' },
  { name: '哲学', href: '/philosophy' },
] as const;

/**
 * トップページ専用ナビ — Issue #303（参照HTML L58-L94, L624-L627, L872-L876）
 * スクロール 60px 超で縮小 + ブラー背景 + ヘアラインボーダー。
 */
export default function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > topShell.navScrollThresholdPx);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useMobileMenuLock(isOpen, closeMenu, menuPanelRef);

  return (
    <nav className={`top-nav${isScrolled ? ' scrolled' : ''}`}>
      <Link className="top-nav-mark" href="/">
        SHAPE<span>∞</span>D
      </Link>

      {/* Desktop — md: (768px) matches MOBILE_BREAKPOINT_PX */}
      <div className="top-nav-links">
        {NAV_LINKS.map((item) => (
          <Link key={item.href} className="top-nav-link" href={item.href}>
            {item.name}
          </Link>
        ))}
        <Link className="top-nav-cta" href="/contact">
          ご相談
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="top-nav-menu-button nav-menu-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'メニューを閉じる' : 'メニューを開く'}
        aria-expanded={isOpen}
        // メニュー DOM は開時のみ存在するため、閉時は参照を付けない（dangling aria-controls 回避）
        aria-controls={isOpen ? MOBILE_MENU_ID : undefined}
      >
        <span className="top-nav-menu-icon" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div id={MOBILE_MENU_ID} className="top-nav-menu" ref={menuPanelRef}>
          {[...NAV_LINKS, { name: 'お問い合わせ', href: '/contact' }].map((item) => (
            <Link key={item.name} href={item.href} onClick={closeMenu}>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
