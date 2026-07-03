/**
 * @vitest-environment jsdom
 *
 * トップページ共通シェルのナビゲーション — Issue #303
 *
 * 参照HTML: lib/design/shape-d-prototype-v4.html L58-L94, L872-L876
 * - スクロール 60px 超で .scrolled（縮小+ブラー背景）が付く
 * - 下層ページへの導線を維持する（#314 暫定方針）
 * - モバイルメニュー: 開閉 / Escape で閉じる / 開いている間は body スクロールロック
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TopNav from '@/components/top/TopNav';
import { topShell } from '@/lib/design/tokens';

const SUB_PAGE_LINKS = [
  { name: '商品・サービス', href: '/services' },
  { name: '実績', href: '/works' },
  { name: '制作の流れ', href: '/process' },
  { name: '哲学', href: '/philosophy' },
] as const;

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

beforeEach(() => {
  setScrollY(0);
  // jsdom には matchMedia がないためスタブ（desktop resize close 用）
  window.matchMedia ??= vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  document.body.style.overflow = '';
});

describe('TopNav', () => {
  it('renders the brand mark linking to the page top', () => {
    render(<TopNav />);
    const mark = screen.getByRole('link', { name: /SHAPE\s*∞\s*D/ });
    expect(mark.getAttribute('href')).toBe('/');
  });

  it('keeps lower-page links in the desktop nav (#314 暫定方針)', () => {
    render(<TopNav />);
    for (const item of SUB_PAGE_LINKS) {
      const link = screen.getAllByRole('link', { name: item.name })[0];
      expect(link.getAttribute('href')).toBe(item.href);
    }
  });

  it('renders the ご相談 CTA linking to the existing /contact flow', () => {
    render(<TopNav />);
    const cta = screen.getByRole('link', { name: 'ご相談' });
    expect(cta.getAttribute('href')).toBe('/contact');
  });

  it(`toggles the scrolled state at window.scrollY > ${topShell.navScrollThresholdPx}`, () => {
    render(<TopNav />);
    const nav = screen.getByRole('navigation');
    expect(nav.className).not.toContain('scrolled');

    act(() => {
      setScrollY(topShell.navScrollThresholdPx + 1);
      fireEvent.scroll(window);
    });
    expect(nav.className).toContain('scrolled');

    act(() => {
      setScrollY(topShell.navScrollThresholdPx);
      fireEvent.scroll(window);
    });
    expect(nav.className).not.toContain('scrolled');
  });

  it('opens the mobile menu with all lower-page + contact links, locking body scroll', () => {
    render(<TopNav />);
    const button = screen.getByRole('button', { name: 'メニューを開く' });
    expect(button.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'メニューを閉じる' }).getAttribute('aria-expanded')).toBe('true');
    const menu = document.getElementById('mobile-nav-menu');
    expect(menu).not.toBeNull();
    for (const item of [...SUB_PAGE_LINKS, { name: 'お問い合わせ', href: '/contact' }]) {
      const links = screen.getAllByRole('link', { name: item.name });
      expect(links.some((l) => menu?.contains(l) && l.getAttribute('href') === item.href)).toBe(true);
    }
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes the mobile menu on Escape and releases the scroll lock', () => {
    render(<TopNav />);
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));
    expect(document.getElementById('mobile-nav-menu')).not.toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(document.getElementById('mobile-nav-menu')).toBeNull();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('closes the mobile menu when a menu link is clicked', () => {
    render(<TopNav />);
    fireEvent.click(screen.getByRole('button', { name: 'メニューを開く' }));
    const menu = document.getElementById('mobile-nav-menu');
    const link = screen
      .getAllByRole('link', { name: '哲学' })
      .find((l) => menu?.contains(l));
    expect(link).toBeDefined();

    fireEvent.click(link!);

    expect(document.getElementById('mobile-nav-menu')).toBeNull();
  });
});
