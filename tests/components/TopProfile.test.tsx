/**
 * @vitest-environment jsdom
 *
 * Profile セクション TopProfile — Issue #310
 * - profile-head / 2 思想カード / 収束 SVG / 理念 を描画
 * - 通常モード: 各要素のフェード + SVG パスの scrub 描画を構成
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで表示）
 */

import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseGsapContext, mockGsapTo, mockGsapSet, mockToArray } = vi.hoisted(() => ({
  mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
  mockGsapTo: vi.fn(),
  mockGsapSet: vi.fn(),
  mockToArray: vi.fn(),
}));

vi.mock('@/lib/hooks/useGsapContext', () => ({ useGsapContext: mockUseGsapContext }));
vi.mock('@/lib/scroll/gsap-config', () => ({
  gsap: { to: mockGsapTo, set: mockGsapSet, utils: { toArray: mockToArray } },
}));

import TopProfile from '@/components/top/TopProfile';

// jsdom は SVGPathElement.getTotalLength を実装しないためスタブ
const getTotalLengthStub = vi.fn(() => 200);

beforeEach(() => {
  mockGsapTo.mockClear();
  mockGsapSet.mockClear();
  mockToArray.mockReset();
  mockToArray.mockReturnValue([{ id: 't0' }, { id: 't1' }]);
  mockUseGsapContext.mockReset();
  // 実装同様 useLayoutEffect で setup を呼ぶ（DOM コミット後に querySelector が SVG パスを解決できる）
  mockUseGsapContext.mockImplementation((setup) => {
    React.useLayoutEffect(() => setup(), [setup]);
  });
  // @ts-expect-error jsdom polyfill for test
  SVGElement.prototype.getTotalLength = getTotalLengthStub;
});

afterEach(() => {
  // @ts-expect-error cleanup polyfill
  delete SVGElement.prototype.getTotalLength;
});

describe('TopProfile', () => {
  it('renders eyebrow, profile head, two thought cards, converge SVG and creed', () => {
    render(<TopProfile />);

    expect(screen.getByText('PROFILE')).toBeTruthy();
    expect(document.querySelector('.profile-head b')?.textContent).toBe('明石 康汰');
    expect(document.querySelector('.profile-head')?.textContent).toContain('AutoDevJapan');

    const thoughts = document.querySelectorAll('#profile .thought');
    expect(thoughts).toHaveLength(2);
    expect(document.getElementById('th-psy')?.querySelector('.thought-tag')?.textContent).toBe('01 — PSYCHOLOGY');
    expect(document.getElementById('th-eng')?.querySelector('.thought-tag')?.textContent).toBe('02 — AI ENGINEERING');

    // 収束 SVG（装飾）と 2 パス + ドット
    const svg = document.querySelector('.converge');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(document.getElementById('cv-l')).not.toBeNull();
    expect(document.getElementById('cv-r')).not.toBeNull();
    expect(document.getElementById('cv-dot')).not.toBeNull();

    expect(document.querySelector('.creed b')?.textContent).toContain('自己表現のツール');
  });

  it('sets up head/thought/dot/creed fades and scrub-draws both converge paths', () => {
    render(<TopProfile />);

    // gsap.set は各パスの dasharray/offset 初期化で 2 回
    expect(mockGsapSet).toHaveBeenCalledTimes(2);
    const setVars = mockGsapSet.mock.calls[0][1] as { strokeDasharray: number; strokeDashoffset: number };
    expect(setVars).toEqual({ strokeDasharray: 200, strokeDashoffset: 200 });

    // gsap.to: head(1) + thought(2) + path scrub(2) + dot(1) + creed(1) = 7
    expect(mockGsapTo).toHaveBeenCalledTimes(7);

    const headVars = mockGsapTo.mock.calls[0][1] as { scrollTrigger: { start: string } };
    expect(headVars.scrollTrigger.start).toBe(topHero.profile.head.start);

    // パス描画は strokeDashoffset:0 + converge の scrub トリガー
    const pathCall = mockGsapTo.mock.calls.find(
      (c) => (c[1] as { strokeDashoffset?: number }).strokeDashoffset === 0,
    );
    expect(pathCall).toBeDefined();
    expect((pathCall![1] as { scrollTrigger: Record<string, unknown> }).scrollTrigger).toMatchObject({
      trigger: '#profile .converge',
      start: topHero.profile.converge.start,
      end: topHero.profile.converge.end,
      scrub: topHero.profile.converge.scrub,
    });
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopProfile />);
    expect(mockGsapTo).not.toHaveBeenCalled();
    expect(mockGsapSet).not.toHaveBeenCalled();
  });
});
