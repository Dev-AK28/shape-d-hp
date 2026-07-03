/**
 * @vitest-environment jsdom
 *
 * トップページ共通シェル（TopShell / TopThread / TopFooter）— Issue #303
 *
 * - TopShell: .top-scope + next/font 変数クラスで新フォント・新トークンをトップ限定に適用
 * - TopThread: #thread 縦糸ラインをスクロール進捗で scaleY させる GSAP 設定
 * - TopFooter: 参照HTMLのビジュアル + 下層ページ導線（#314 暫定方針）
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topShell } from '@/lib/design/tokens';

// next/font/google は Next.js ビルド外では実行できないためモック
vi.mock('next/font/google', () => ({
  Shippori_Mincho: () => ({ variable: 'font-shippori-mincho-mock' }),
  Zen_Kaku_Gothic_New: () => ({ variable: 'font-zen-kaku-mock' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains-mono-mock' }),
}));

// useGsapContext は device profile / reduced-motion を解決してから setup を呼ぶ。
// jsdom では即時実行モックにして GSAP 呼び出し内容だけを検証する。
const { mockUseGsapContext, mockGsapTo } = vi.hoisted(() => ({
  mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
  mockGsapTo: vi.fn(),
}));

vi.mock('@/lib/hooks/useGsapContext', () => ({
  useGsapContext: mockUseGsapContext,
}));

vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { to: mockGsapTo },
}));

import TopShell from '@/components/top/TopShell';
import TopThread from '@/components/top/TopThread';
import TopFooter from '@/components/top/TopFooter';

beforeEach(() => {
  mockGsapTo.mockClear();
  mockUseGsapContext.mockReset();
  // 実装同様 useLayoutEffect で setup を呼ぶ（ref がコミット後に解決されるため）
  mockUseGsapContext.mockImplementation((setup) => {
    React.useLayoutEffect(() => setup(), [setup]);
  });
});

describe('TopShell', () => {
  it('wraps children in the .top-scope with next/font variable classes', () => {
    render(
      <TopShell>
        <main>content</main>
      </TopShell>,
    );

    const scope = document.querySelector(`.${topShell.scopeClass}`);
    expect(scope).not.toBeNull();
    expect(scope?.className).toContain('font-shippori-mincho-mock');
    expect(scope?.className).toContain('font-zen-kaku-mock');
    expect(scope?.className).toContain('font-jetbrains-mono-mock');
    expect(scope?.textContent).toContain('content');
  });

  it('renders nav, thread, and footer around the page content', () => {
    render(
      <TopShell>
        <main>content</main>
      </TopShell>,
    );

    expect(screen.getByRole('navigation')).toBeTruthy();
    expect(screen.getByTestId('top-thread')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });
});

describe('TopThread', () => {
  it('renders the #thread line as decorative (aria-hidden)', () => {
    render(<TopThread />);
    const thread = screen.getByTestId('top-thread');
    expect(thread.id).toBe('thread');
    expect(thread.getAttribute('aria-hidden')).toBe('true');
  });

  it('animates scaleY over full-page scroll progress (scrub 1.2)', () => {
    render(<TopThread />);

    expect(mockGsapTo).toHaveBeenCalledTimes(1);
    const [target, vars] = mockGsapTo.mock.calls[0] as [
      Element,
      { scaleY: number; ease: string; scrollTrigger: Record<string, unknown> },
    ];
    expect((target as HTMLElement).id).toBe('thread');
    expect(vars.scaleY).toBe(1);
    expect(vars.ease).toBe('none');
    expect(vars.scrollTrigger.start).toBe('top top');
    expect(vars.scrollTrigger.end).toBe('bottom bottom');
    expect(vars.scrollTrigger.scrub).toBe(topShell.threadScrub);
  });
});

describe('TopFooter', () => {
  it('renders the brand mark and copyright per the reference HTML', () => {
    render(<TopFooter />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toContain('SHAPE');
    expect(footer.textContent).toMatch(/©\s*\d{4}/);
  });

  it('keeps lower-page links (#314 暫定方針 — #311 で最終化)', () => {
    render(<TopFooter />);
    const footer = screen.getByRole('contentinfo');
    for (const href of ['/services', '/works', '/process', '/philosophy', '/contact']) {
      const link = footer.querySelector(`a[href="${href}"]`);
      expect(link, `footer link to ${href}`).not.toBeNull();
    }
  });
});
