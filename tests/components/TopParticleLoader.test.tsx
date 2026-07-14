/**
 * @vitest-environment jsdom
 *
 * トップページ パーティクルローダー — Issue #412 / #414 / #418
 * WebGL 本体は jsdom で動かないため、SSR オーバーレイとフォールバック経路を検証する:
 * - reduced-motion / WebGL 非対応: DOM から外す（CSS でも隠すが JS でも unmount する）
 * - three.js のロードや画像 decode に失敗しても実ロゴは表示され、必ず消える
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn<() => boolean | null>(),
}));

/** framer 固有 prop を DOM に流さないよう剥がす最小スタブ。 */
function stripMotionProps<T extends object>(props: T): T {
  const { initial, animate, transition, onAnimationComplete, ...rest } = props as T &
    Record<string, unknown>;
  void initial;
  void animate;
  void transition;
  void onAnimationComplete;
  return rest as T;
}

vi.mock('framer-motion', () => ({
  useReducedMotion: mockUseReducedMotion,
  m: {
    div: ({ children, ...props }: { children?: ReactNode } & ComponentProps<'div'>) => (
      <div {...stripMotionProps(props)}>{children}</div>
    ),
    img: (props: ComponentProps<'img'>) => (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img {...stripMotionProps(props)} />
    ),
  },
}));

const { mockDetectWebGLSupport } = vi.hoisted(() => ({
  mockDetectWebGLSupport: vi.fn<() => boolean>(),
}));

vi.mock('@/lib/webgl/support', () => ({
  detectWebGLSupport: mockDetectWebGLSupport,
}));

// three.js の実ロードは jsdom では不要かつ重い。動的 import を軽量スタブに差し替える
vi.mock('three', () => ({}));

import TopParticleLoader from '@/components/top/TopParticleLoader';
import { LOADER_FALLBACK_MS } from '@/lib/loader/particle-logo';

beforeEach(() => {
  mockUseReducedMotion.mockReturnValue(false);
  mockDetectWebGLSupport.mockReturnValue(true);
  // jsdom の Image は decode() 未実装（spy 不可）のため直接生やす。
  // 失敗させることで「粒子演出が始まらない」経路を再現する
  (window.Image.prototype as { decode?: () => Promise<void> }).decode = () =>
    Promise.reject(new Error('decode failed (test)'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  delete (window.Image.prototype as { decode?: () => Promise<void> }).decode;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('TopParticleLoader', () => {
  it('reduced-motion 時はローダーを描画しない', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).toBeNull();
  });

  it('WebGL 非対応時はローダーを描画しない', () => {
    mockDetectWebGLSupport.mockReturnValue(false);
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).toBeNull();
  });

  it('オーバーレイは不透明背景で実ロゴを含む（#418: ヒーローを透けさせない）', () => {
    const { getByTestId } = render(<TopParticleLoader />);
    const overlay = getByTestId('page-loader');
    // 半透明スクリムではなくトップページ背景色そのもの
    expect(overlay.style.background).toContain('--ink');
    // 実ロゴが最初から DOM にある（早期 contentful paint 兼ゴースト表示）
    expect(getByTestId('loader-logo')).not.toBeNull();
  });

  it('粒子演出を開始できなくてもフォールバックで必ず消える', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(LOADER_FALLBACK_MS + 100);
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());
  });
});
