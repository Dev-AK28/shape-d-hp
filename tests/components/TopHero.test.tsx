/**
 * @vitest-environment jsdom
 *
 * ヒーローセクション TopHero — Issue #304 / #326
 * - マーク（SHAPE∞D, h1）/ コピー2行 / サブ / スクロールキュー / 雨 Canvas を描画
 * - イントロは globals.css の CSS アニメーション（#326 で GSAP から移行）。
 *   JS 側にイントロ処理を持たないため、GSAP を一切初期化しないことを検証する。
 *   尺の同期は tests/design/css-token-sync.test.ts が担う。
 */

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { mockTimeline, mockContext } = vi.hoisted(() => ({
  mockTimeline: vi.fn(),
  mockContext: vi.fn(),
}));

vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { timeline: mockTimeline, context: mockContext },
  registerGsapPlugins: vi.fn(),
}));
// RainCanvas は canvas 2D を触るため描画をスタブ
vi.mock('@/components/top/RainCanvas', () => ({
  default: () => React.createElement('canvas', { 'data-testid': 'hero-rain-canvas', id: 'rain-canvas' }),
}));

import TopHero from '@/components/top/TopHero';

beforeEach(() => {
  mockTimeline.mockClear();
  mockContext.mockClear();
});

describe('TopHero', () => {
  it('renders the mark, copy lines, sub copy, scroll cue and rain canvas', () => {
    render(<TopHero />);

    const mark = screen.getByRole('heading', { level: 1 });
    expect(mark.textContent?.replace(/\s/g, '')).toBe('SHAPE∞D');
    expect(mark.querySelector('.inf')?.textContent).toBe('∞');

    const lines = document.querySelectorAll('.hero-copy .line');
    expect(lines).toHaveLength(2);
    expect(lines[0].textContent).toContain('機能だけなら');
    expect(lines[1].textContent).toContain('想いまで実装');

    expect(document.querySelector('.hero-sub')?.textContent).toContain('SELF-CONGRUENCE');
    expect(screen.getByTestId('hero-scroll-cue')).toBeTruthy();
    expect(screen.getByTestId('hero-rain-canvas')).toBeTruthy();
  });

  it('does not initialize GSAP — the intro is a pure CSS animation (#326)', () => {
    render(<TopHero />);
    expect(mockTimeline).not.toHaveBeenCalled();
    expect(mockContext).not.toHaveBeenCalled();
  });
});
