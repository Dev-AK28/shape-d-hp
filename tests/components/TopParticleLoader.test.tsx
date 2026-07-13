/**
 * @vitest-environment jsdom
 *
 * トップページ パーティクルローダー — Issue #412 / #414（PR #413 レビュー対応）
 * WebGL 本体は jsdom で動かないため、フォールバック 3 経路のみを検証する:
 * - reduced-motion: 何も描画しない
 * - WebGL 非対応: 何も描画しない
 * - 画像ロード失敗: 表示後に自力で消える
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn<() => boolean | null>(),
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: mockUseReducedMotion,
  m: {
    div: ({ children, ...props }: { children?: ReactNode } & ComponentProps<'div'>) => {
      // framer 固有 prop を DOM に流さないよう最小限で剥がす
      const { initial, animate, transition, onAnimationComplete, ...rest } =
        props as Record<string, unknown>;
      void initial;
      void animate;
      void transition;
      void onAnimationComplete;
      return <div {...(rest as ComponentProps<'div'>)}>{children}</div>;
    },
  },
}));

const { mockDetectWebGLSupport } = vi.hoisted(() => ({
  mockDetectWebGLSupport: vi.fn<() => boolean>(),
}));

vi.mock('@/lib/webgl/support', () => ({
  detectWebGLSupport: mockDetectWebGLSupport,
}));

import TopParticleLoader from '@/components/top/TopParticleLoader';

beforeEach(() => {
  mockUseReducedMotion.mockReturnValue(false);
  mockDetectWebGLSupport.mockReturnValue(true);
  // jsdom の Image は decode() 未実装（spy 不可）のため、失敗経路として直接生やす
  (window.Image.prototype as { decode?: () => Promise<void> }).decode = () =>
    Promise.reject(new Error('decode failed (test)'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  delete (window.Image.prototype as { decode?: () => Promise<void> }).decode;
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

  it('画像ロード失敗時は表示後に自力で消える（ページを塞ぎ続けない）', async () => {
    const { queryByTestId } = render(<TopParticleLoader />);
    // マウント直後はオーバーレイが存在する
    expect(queryByTestId('page-loader')).not.toBeNull();
    // decode 失敗 → setVisible(false) で消える
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());
  });
});
