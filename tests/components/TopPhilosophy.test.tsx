/**
 * @vitest-environment jsdom
 *
 * PHILOSOPHY セクション TopPhilosophy — Issue #305
 * - eyebrow / タグライン（1文字 span 分割）/ ノートを描画
 * - 通常モード: ScrollTrigger scrub でタグラインを opacity 0.08→1 に文字送り
 * - reduced-motion: GSAP を初期化しない（CSS フォールバックで表示）
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { topHero } from '@/lib/design/tokens';

const { mockUseGsapContext, mockGsapTo } = vi.hoisted(() => ({
  mockUseGsapContext: vi.fn<(setup: () => void, deps?: ReadonlyArray<unknown>) => void>(),
  mockGsapTo: vi.fn(),
}));

vi.mock('@/lib/hooks/useGsapContext', () => ({ useGsapContext: mockUseGsapContext }));
vi.mock('@/lib/scroll/gsap-config', () => ({ gsap: { to: mockGsapTo } }));

import TopPhilosophy from '@/components/top/TopPhilosophy';

const TAGLINE = '商品・サービスは、自己表現のツールである。';

beforeEach(() => {
  mockGsapTo.mockClear();
  mockUseGsapContext.mockReset();
  mockUseGsapContext.mockImplementation((setup) => setup());
});

describe('TopPhilosophy', () => {
  it('renders the eyebrow, tagline split into per-character spans, and note', () => {
    render(<TopPhilosophy />);

    expect(screen.getByText('PHILOSOPHY')).toBeTruthy();
    const tagline = document.querySelector('.vision-tagline');
    expect(tagline?.getAttribute('aria-label')).toBe(TAGLINE);
    const chars = document.querySelectorAll('.vision-tagline .w');
    expect(chars).toHaveLength([...TAGLINE].length);
    expect(Array.from(chars).map((c) => c.textContent).join('')).toBe(TAGLINE);
    // 分割 span は装飾（aria-hidden）で、読み上げは aria-label に集約
    expect(chars[0].getAttribute('aria-hidden')).toBe('true');

    expect(document.querySelector('.vision-note')?.textContent).toContain('らしさ');
  });

  it('scrubs the tagline chars opacity→1 with reference stagger/scrub config', () => {
    render(<TopPhilosophy />);

    expect(mockGsapTo).toHaveBeenCalledTimes(1);
    const [target, vars] = mockGsapTo.mock.calls[0] as [
      string,
      { opacity: number; duration: number; stagger: number; ease: string; scrollTrigger: Record<string, unknown> },
    ];
    expect(target).toBe('#vision .vision-tagline .w');
    expect(vars.opacity).toBe(1);
    expect(vars.duration).toBe(topHero.taglineScrub.tweenDuration);
    expect(vars.stagger).toBe(topHero.taglineScrub.stagger);
    expect(vars.ease).toBe('none');
    expect(vars.scrollTrigger).toMatchObject({
      trigger: '#vision',
      start: topHero.taglineScrub.start,
      end: topHero.taglineScrub.end,
      scrub: topHero.taglineScrub.scrub,
    });
  });

  it('does not animate when useGsapContext skips setup (reduced-motion)', () => {
    mockUseGsapContext.mockImplementation(() => {
      /* reduced-motion: setup は呼ばれない */
    });
    render(<TopPhilosophy />);
    expect(mockGsapTo).not.toHaveBeenCalled();
  });
});
