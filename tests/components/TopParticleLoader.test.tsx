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

/**
 * useAnimationControls のスタブ。実ロゴの立ち上がり（#421）は `set()` で開始値を
 * 補正してから `start()` する仕様なので、その呼び出しを記録して検証できるようにする。
 */
type RevealTarget = {
  opacity: number;
  transition: { delay: number; duration: number; ease?: string };
};

const { revealControls } = vi.hoisted(() => ({
  revealControls: {
    set: vi.fn<(values: { opacity: number }) => void>(),
    start: vi.fn<(target: RevealTarget) => Promise<void>>(() => Promise.resolve()),
  },
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
  useAnimationControls: () => revealControls,
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
    // three.js の動的 import は fake timers の仮想時刻とは独立した「本物の」非同期処理
    // （Promise 解決）のため、固定 ms の advanceTimersByTimeAsync だけでは
    // start() が実行済みかどうかを保証できない（CI 環境ではフレーク要因になっていた）。
    // コンストラクタ呼び出しをスパイし、`vi.waitFor` で実際に start() が three.js の
    // 初期化まで到達したことを確認してから後続の検証に進む。
    rendererConstructed: vi.fn(),
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
      constructor() {
        threeSpies.rendererConstructed();
      }
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
import {
  handoffRevealOpacity,
  LOADER_CSS_FAILSAFE_MS,
  LOADER_FALLBACK_MS,
  LOADER_HANDOFF_END_MS,
  LOADER_SNAP_END_MS,
  LOGO_GHOST_OPACITY,
} from '@/lib/loader/particle-logo';

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
  revealControls.set.mockClear();
  revealControls.start.mockClear();
});

afterEach(() => {
  delete (window.Image.prototype as { decode?: () => Promise<void> }).decode;
  // defineProperty は restoreAllMocks では戻らないため明示的に消す（prototype 汚染防止）
  delete (window.Image.prototype as { naturalWidth?: number }).naturalWidth;
  delete (window.Image.prototype as { naturalHeight?: number }).naturalHeight;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * 「初回ロード」（＝ SSR 済みオーバーレイが初期 HTML にある）状況を再現する。
 * コンポーネントはこの有無でタイムラインの起点を切り替える（ナビ起点 / マウント起点）ため、
 * これが無いと jsdom では常に soft nav 扱いになり、遅延ハイドレーションを再現できない。
 */
function mountSsrOverlay() {
  const ssrOverlay = document.createElement('div');
  ssrOverlay.setAttribute('data-top-loader', '');
  document.body.appendChild(ssrOverlay);
  return ssrOverlay;
}

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

  it('通常のハイドレーション（handoff 前）では実ロゴを 0 から立ち上げる（#421）', () => {
    // Given: 初回ロード（SSR 済みオーバーレイが DOM にある = ナビゲーション起点）で、
    // ハイドレーションが handoff（8.0〜9.0 秒）より前に完了する通常のケース
    const ssrOverlay = mountSsrOverlay();
    vi.spyOn(performance, 'now').mockReturnValue(1_000);
    render(<TopParticleLoader />);

    // Then: 開始値の補正は不要（従来どおり 0 から）で、残りの delay を待って立ち上げる
    expect(revealControls.set).toHaveBeenCalledWith({ opacity: LOGO_GHOST_OPACITY });
    const [target] = revealControls.start.mock.calls[0];
    expect(target.opacity).toBe(1);
    expect(target.transition.delay).toBeCloseTo((LOADER_SNAP_END_MS - 1_000) / 1000, 3);
    ssrOverlay.remove();
  });

  it('ハイドレーションが handoff 途中に食い込んでも「両方薄い」谷を作らない（#421）', () => {
    // Given: 初回ロード（ナビゲーション起点）で、低速回線のためハイドレーションが
    // handoff のちょうど中間（8.5 秒）にずれ込む
    const ssrOverlay = mountSsrOverlay();
    const midHandoff = (LOADER_SNAP_END_MS + LOADER_HANDOFF_END_MS) / 2;
    vi.spyOn(performance, 'now').mockReturnValue(midHandoff);

    // When: ローダーがマウントされる
    render(<TopParticleLoader />);

    // Then: 実ロゴは 0 ではなく「その時刻にあるべき不透明度」から立ち上がる。
    // 粒子は既に (1 - uHandoff) まで減衰しているため、0 から始めると合計が 1 を割り込む
    expect(revealControls.set).toHaveBeenCalledWith({
      opacity: handoffRevealOpacity(midHandoff),
    });
    expect(handoffRevealOpacity(midHandoff)).toBeGreaterThan(0);

    // 残り時間（0.5 秒）だけで 1 まで到達する
    const [target] = revealControls.start.mock.calls[0];
    expect(target.transition.delay).toBe(0);
    expect(target.transition.duration).toBeCloseTo(
      (LOADER_HANDOFF_END_MS - midHandoff) / 1000,
      3,
    );
    ssrOverlay.remove();
  });

  it('initial には固定値のみを渡す（クロック依存だとハイドレーション不一致になる・#421）', () => {
    // 開始値の補正は effect（ハイドレーション後）で行う必要がある。initial に入れると
    // SSR HTML にも出力され、サーバー（0）とクライアント（補正値）が食い違う
    const ssrOverlay = mountSsrOverlay();
    vi.spyOn(performance, 'now').mockReturnValue(
      (LOADER_SNAP_END_MS + LOADER_HANDOFF_END_MS) / 2,
    );
    const { getByTestId } = render(<TopParticleLoader />);
    // スタブは initial を DOM に流さないため、style に opacity が焼き付いていないこと＝
    // 「initial は固定値（0）のまま」であることを確認する
    expect(getByTestId('loader-logo').style.opacity).toBe('');
    ssrOverlay.remove();
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
    // three.js の動的 import と image.decode() の解決は fake timers の仮想時刻とは
    // 独立した「本物の」Promise 解決であるため、固定 ms の advanceTimersByTimeAsync
    // だけでは start() が実際に到達したか保証できない（CI 負荷時にフレークしていた
    // 原因）。vi.waitFor はレンダラのコンストラクタ呼び出し（= start() 到達）を
    // 実際に観測できるまでポーリングするため、実行環境の速度に依存しない。
    await vi.waitFor(() => {
      expect(threeSpies.rendererConstructed).toHaveBeenCalled();
    });
    expect(threeSpies.rendererDispose).not.toHaveBeenCalled();

    // 演出終了（フォールバック）→ unmount されないが、リソースは解放されること
    await vi.advanceTimersByTimeAsync(LOADER_FALLBACK_MS + 100);
    await waitFor(() => expect(queryByTestId('page-loader')).toBeNull());

    // #429: `page-loader` の DOM 消滅（state 更新による再レンダー）と
    // useEffect クリーンアップ（dispose 系呼び出し）は同一トリックで完全同期する
    // 保証がない。CI 高負荷時は前者の waitFor 解決直後にまだ後者が反映されて
    // いないことがあり、直後の同期 expect がフレークしていた。dispose 系の
    // アサーションも waitFor でポーリングし、実行環境の速度に依存しないようにする。
    await waitFor(() => {
      expect(threeSpies.rendererDispose).toHaveBeenCalled();
      expect(threeSpies.forceContextLoss).toHaveBeenCalled();
      expect(threeSpies.geometryDispose).toHaveBeenCalled();
      expect(threeSpies.materialDispose).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});
