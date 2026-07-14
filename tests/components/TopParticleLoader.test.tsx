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

/**
 * three.js の実ロードは jsdom では不要かつ重い。描画に必要な最小 API だけをスタブし、
 * 「演出終了時に WebGL リソースが解放されるか」（PR #419 レビューで見つかったリーク）を
 * 検証できるようにする。
 */
const { threeSpies } = vi.hoisted(() => ({
  threeSpies: {
    rendererDispose: vi.fn(),
    forceContextLoss: vi.fn(),
    geometryDispose: vi.fn(),
    materialDispose: vi.fn(),
  },
}));

vi.mock('three', () => {
  class Vector2 {
    x = 0;
    y = 0;
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }
  return {
    WebGLRenderer: class {
      setPixelRatio = vi.fn();
      setSize = vi.fn();
      render = vi.fn();
      dispose = threeSpies.rendererDispose;
      forceContextLoss = threeSpies.forceContextLoss;
    },
    Scene: class {
      add = vi.fn();
    },
    PerspectiveCamera: class {
      position = { z: 0 };
      aspect = 1;
      far = 0;
      updateProjectionMatrix = vi.fn();
    },
    BufferGeometry: class {
      attributes: Record<string, { needsUpdate: boolean }> = {};
      setAttribute = vi.fn((name: string) => {
        this.attributes[name] = { needsUpdate: false };
      });
      dispose = threeSpies.geometryDispose;
    },
    BufferAttribute: class {},
    ShaderMaterial: class {
      uniforms: Record<string, { value: unknown }>;
      constructor({ uniforms }: { uniforms: Record<string, { value: unknown }> }) {
        this.uniforms = uniforms;
      }
      dispose = threeSpies.materialDispose;
    },
    Points: class {
      rotation = { x: 0, y: 0 };
    },
    Vector2,
    MathUtils: {
      degToRad: (deg: number) => (deg * Math.PI) / 180,
      smoothstep: (x: number, min: number, max: number) =>
        Math.min(Math.max((x - min) / (max - min), 0), 1),
    },
    AdditiveBlending: 2,
  };
});

import TopParticleLoader from '@/components/top/TopParticleLoader';
import { LOADER_CSS_FAILSAFE_MS, LOADER_FALLBACK_MS } from '@/lib/loader/particle-logo';

/** 粒子演出が実際に走る（three.js 初期化まで到達する）ようスタブを整える。 */
function enableParticles() {
  (window.Image.prototype as { decode?: () => Promise<void> }).decode = () =>
    Promise.resolve();
  Object.defineProperty(window.Image.prototype, 'naturalWidth', {
    configurable: true,
    get: () => 360,
  });
  Object.defineProperty(window.Image.prototype, 'naturalHeight', {
    configurable: true,
    get: () => 286,
  });
  // probe canvas（サンプリング用）: 高輝度ピクセルを 1 つだけ返す
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
    getImageData: () => ({
      data: new Uint8ClampedArray([255, 255, 255, 255]),
      width: 1,
      height: 1,
    }),
  } as unknown as CanvasRenderingContext2D);
}

beforeEach(() => {
  mockUseReducedMotion.mockReturnValue(false);
  mockDetectWebGLSupport.mockReturnValue(true);
  // タイムラインはナビゲーション起点（performance.now()）で残り時間を切るため、
  // テストの実行時間に結果が左右されないよう 0 に固定する（PR #419 レビュー対応）
  vi.spyOn(performance, 'now').mockReturnValue(0);
  // jsdom の Image は decode() 未実装（spy 不可）のため直接生やす。
  // 失敗させることで「粒子演出が始まらない」経路を再現する
  (window.Image.prototype as { decode?: () => Promise<void> }).decode = () =>
    Promise.reject(new Error('decode failed (test)'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  delete (window.Image.prototype as { decode?: () => Promise<void> }).decode;
  // defineProperty は restoreAllMocks では戻らないため明示的に消す（prototype 汚染防止）
  delete (window.Image.prototype as { naturalWidth?: number }).naturalWidth;
  delete (window.Image.prototype as { naturalHeight?: number }).naturalHeight;
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
    // 実ロゴは最初から DOM にある（#420 で開始時の opacity は 0。handoff で立ち上がる）
    expect(getByTestId('loader-logo')).not.toBeNull();
  });

  it('JS 非依存の最終防衛線を SSR する（チャンク 404 で暗幕が残らない・#419 レビュー対応）', () => {
    // globals.css の top-loader-failsafe を駆動する発火時刻。これが style 属性として
    // SSR されるからこそ、JS が一切動かなくてもオーバーレイが消える。
    // animation-delay 直書きではなく CSS 変数で渡す — この style が失われても globals.css
    // 側のフォールバック（実質無限）が効き、保険が演出を殺さない（2 巡目レビュー対応）
    const { getByTestId } = render(<TopParticleLoader />);
    const overlay = getByTestId('page-loader');
    expect(overlay.style.getPropertyValue('--top-loader-failsafe-delay')).toBe(
      `${LOADER_CSS_FAILSAFE_MS}ms`,
    );
    expect(overlay.style.animationDelay).toBe('');
  });

  it('bfcache 復帰では演出を即座に畳む（黒画面回帰ガード・#419 2 巡目レビュー対応）', async () => {
    // シェーダ時計は実時間で進むのに消滅経路（framer / setTimeout / CSS）は凍結中に止まる。
    // 復帰時にそのまま続けると「粒子もロゴも無い不透明な黒画面」が数秒残る
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).not.toBeNull();

    const pageShow = new Event('pageshow') as Event & { persisted?: boolean };
    Object.defineProperty(pageShow, 'persisted', { value: true });
    window.dispatchEvent(pageShow);

    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());
  });

  it('通常のページ表示（persisted=false）では演出を畳まない', async () => {
    const { queryByTestId } = render(<TopParticleLoader />);
    const pageShow = new Event('pageshow') as Event & { persisted?: boolean };
    Object.defineProperty(pageShow, 'persisted', { value: false });
    window.dispatchEvent(pageShow);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(queryByTestId('page-loader')).not.toBeNull();
  });

  it('粒子演出を開始できなくてもフォールバックで必ず消える', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).not.toBeNull();

    await vi.advanceTimersByTimeAsync(LOADER_FALLBACK_MS + 100);
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());
  });

  it('soft nav（下層 → トップ）でも演出が最初から走る（黒フラッシュ回帰ガード・#419）', async () => {
    // performance.now() はドキュメントの timeOrigin 起点で soft nav ではリセットされない。
    // 下層を長く見てからトップへ戻った状況を再現する
    vi.spyOn(performance, 'now').mockReturnValue(60_000);
    // soft nav では SSR されたオーバーレイが DOM にない（クライアント描画のみ）
    expect(document.querySelector('[data-top-loader]')).toBeNull();

    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { queryByTestId } = render(<TopParticleLoader />);

    // 即消え（黒フラッシュ）ではなく、演出の尺だけ表示され続けること
    await vi.advanceTimersByTimeAsync(1000);
    expect(queryByTestId('page-loader')).not.toBeNull();
  });

  it('キーボード操作で演出を即スキップする（WCAG 2.4.7 の緩和・#419 レビュー対応）', async () => {
    const { queryByTestId } = render(<TopParticleLoader />);
    expect(queryByTestId('page-loader')).not.toBeNull();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());
  });

  it('消滅時に WebGL リソースとリスナーを解放する（リーク回帰ガード・#419 レビュー対応）', async () => {
    enableParticles();
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { queryByTestId } = render(<TopParticleLoader />);
    // three.js の動的 import と decode の解決を待つ（初期化まで到達させる）
    await vi.advanceTimersByTimeAsync(50);
    expect(threeSpies.rendererDispose).not.toHaveBeenCalled();

    // 演出終了（フォールバック）→ unmount されないが、リソースは解放されること
    await vi.advanceTimersByTimeAsync(LOADER_FALLBACK_MS + 100);
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());

    expect(threeSpies.rendererDispose).toHaveBeenCalled();
    expect(threeSpies.forceContextLoss).toHaveBeenCalled();
    expect(threeSpies.geometryDispose).toHaveBeenCalled();
    expect(threeSpies.materialDispose).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
