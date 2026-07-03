/**
 * @vitest-environment jsdom
 *
 * ヒーロー雨 Canvas — Issue #304
 * - 通常モード: rAF ループで降下を描画（アンマウントで rAF/リスナ解放）
 * - reduced-motion: rAF を回さず静止描画を 1 度だけ行う
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn<() => boolean | null>(),
}));

vi.mock('framer-motion', () => ({
  useReducedMotion: mockUseReducedMotion,
}));

import RainCanvas from '@/components/top/RainCanvas';

type Ctx2D = ReturnType<HTMLCanvasElement['getContext']>;

let ctxStub: Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  ctxStub = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctxStub as unknown as Ctx2D,
  );
  // jsdom は offsetWidth/Height が 0 のため密度計算用に固定値を与える
  vi.spyOn(HTMLCanvasElement.prototype, 'offsetWidth', 'get').mockReturnValue(520);
  vi.spyOn(HTMLCanvasElement.prototype, 'offsetHeight', 'get').mockReturnValue(800);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RainCanvas', () => {
  it('renders a decorative canvas with the rain-canvas id', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { getByTestId } = render(<RainCanvas />);
    const canvas = getByTestId('hero-rain-canvas');
    expect(canvas.id).toBe('rain-canvas');
    expect(canvas.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws a static frame without scheduling rAF when reduced-motion', () => {
    mockUseReducedMotion.mockReturnValue(true);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    render(<RainCanvas />);
    // 静止描画で stroke が呼ばれ、アニメーションループは開始されない
    expect(ctxStub.stroke).toHaveBeenCalled();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('starts the rAF loop when motion is allowed and cancels it on unmount', () => {
    mockUseReducedMotion.mockReturnValue(false);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<RainCanvas />);
    expect(rafSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(cancelSpy).toHaveBeenCalledWith(42);
  });
});
