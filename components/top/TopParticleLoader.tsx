'use client';

import { m, useReducedMotion } from 'framer-motion';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { detectWebGLSupport } from '@/lib/webgl/support';
import {
  CONVERGE_PROGRESS_SHARE,
  DRIFT_AMPLITUDE_PX,
  getLoaderTimeScale,
  LOADER_CSS_FAILSAFE_MS,
  LOADER_FADE_START_MS,
  LOADER_FALLBACK_MS,
  LOADER_HANDOFF_END_MS,
  LOADER_LOGO_REVEAL_SRC,
  LOADER_LOGO_SRC,
  LOADER_SNAP_END_MS,
  LOADER_TIMELINE_MS,
  LOADER_TOTAL_MS,
  LOGO_DEPTH_PX,
  LOGO_DISPLAY_HEIGHT_RATIO,
  LOGO_DISPLAY_WIDTH_CSS,
  LOGO_DISPLAY_WIDTH_MAX_PX,
  LOGO_DISPLAY_WIDTH_RATIO,
  LOGO_GHOST_OPACITY,
  LOGO_SOURCE_HEIGHT_PX,
  LOGO_SOURCE_WIDTH_PX,
  PARTICLE_STAGGER_MS,
  sampleLogoParticles,
} from '@/lib/loader/particle-logo';

/** マウス反発が届く半径と最大変位（CSS px）。ロゴ完成後のみ有効。 */
const REPEL_RADIUS_PX = 110;
const REPEL_STRENGTH_PX = 46;
/** 反発・視差の立ち上がり時間。snap 完了直後にいきなり弾けないよう滑らかに入れる。 */
const INTERACT_RAMP_MS = 300;

/** PerspectiveCamera の視野角。z=0 平面で 1 world unit = 1 CSS px になる距離に置く。 */
const CAMERA_FOV_DEG = 35;

/** hold 中のマウス視差（ラジアン）。板厚（LOGO_DEPTH_PX）を知覚させる程度に留める。 */
const PARALLAX_MAX_RAD = { x: 0.06, y: 0.12 } as const;
/** 視差の追従率（フレームごとの lerp 係数）。 */
const PARALLAX_LERP = 0.06;

/**
 * 頂点シェーダ — 6 フェーズ演出（Issue #414 / #418）
 *
 * 収束進捗 p は converge（緩・easeInOutSine）が CONVERGE_PROGRESS_SHARE まで、
 * snap（急・easeOutQuart）が残りを受け持つ 2 段合成。drift 中は p=0 のまま
 * 出発位置の周囲を漂う（振幅は p が進むほど減衰）。
 * handoff（uHandoff 0→1）では粒子を薄れさせ、実ロゴ <img> にバトンタッチする。
 * z 方向は目標座標が ±LOGO_DEPTH_PX/2 の板厚を持ち、奥の粒子ほど暗くする。
 */
const VERT_SRC = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aColor;
attribute float aDelay;
attribute float aSize;
attribute float aRand;

uniform float uTime;        // 演出開始からの経過（タイムスケール補正済み・基準 ms）
uniform float uDrift;       // drift フェーズ長 ms
uniform float uConverge;    // converge フェーズ長 ms
uniform float uSnap;        // snap フェーズ長 ms
uniform float uStagger;     // converge 内の出発ばらつき幅 ms
uniform float uHalfDepth;   // 板厚の半分（CSS px）
uniform float uHandoff;     // 0..1 実ロゴへのバトンタッチ進捗（1 で粒子は消える）
uniform vec2 uMouse;        // ワールド座標（CSS px・中心原点・y 上向き）
uniform float uInteract;    // 0..1 ロゴ完成後に 1 へ
uniform float uPointScale;  // 遠近サイズ減衰の係数（カメラ距離）

varying vec3 vColor;
varying float vAlpha;

void main() {
  // converge: aDelay ずつ遅れて出発し、全粒子が converge 終了までに share へ到達
  float tc = clamp((uTime - uDrift - aDelay) / (uConverge - uStagger), 0.0, 1.0);
  float pc = 0.5 - 0.5 * cos(3.14159265 * tc); // easeInOutSine
  // snap: 残り距離を一気に詰める
  float ts = clamp((uTime - uDrift - uConverge) / uSnap, 0.0, 1.0);
  float ps = 1.0 - pow(1.0 - ts, 4.0); // easeOutQuart
  // 補数は GLSL 側で計算する — JS で 2 値を別々に丸めて埋め込むと合計が 1.0 に
  // ならず p が 1.0 に届かない（ロゴが完成しない）恐れがあるため（PR #415 レビュー対応）
  float share = ${CONVERGE_PROGRESS_SHARE.toFixed(4)};
  float p = share * pc + (1.0 - share) * ps;

  vec3 pos = mix(aStart, position, p);

  // drift: 出発位置の周囲をゆっくり漂う（収束が進むほど減衰し、完成後は微小ゆらぎになる）
  float wobble = mix(${DRIFT_AMPLITUDE_PX.toFixed(1)}, 0.9, p);
  pos.x += sin(uTime * 0.0004 + aRand * 6.2832) * wobble;
  pos.y += cos(uTime * 0.00033 + aRand * 12.566) * wobble;
  pos.z += sin(uTime * 0.00047 + aRand * 9.4248) * wobble * 0.5;

  // マウス反発（ロゴ完成後のみ）。smoothstep は edge0 < edge1 のみ定義（PR #413 レビュー対応）。
  // 視差回転（最大 0.12rad）はこの後段の modelViewMatrix で掛かるため、反発中心は
  // スクリーンから最大数 px ずれる近似（半径 110px に対し誤差 ~7px で許容）
  vec2 d = pos.xy - uMouse;
  float dist = length(d) + 0.0001;
  float force = (1.0 - smoothstep(0.0, ${REPEL_RADIUS_PX.toFixed(1)}, dist))
    * uInteract * ${REPEL_STRENGTH_PX.toFixed(1)};
  pos.xy += (d / dist) * force;

  // 深度シェーディング: 手前（+z）ほど明るく、奥ほど暗い — 板厚の立体感。
  // 下限を上げすぎると立体感が消え、下げすぎるとロゴ全体が沈む（0.72 は実写確認値）
  float shade = 0.72 + 0.28 * smoothstep(-uHalfDepth, uHalfDepth, pos.z);
  vColor = aColor * shade;

  // 序盤でフェードイン → handoff で退場（実ロゴに主役を譲る）
  float fadeIn = clamp(uTime / 250.0, 0.0, 1.0);
  vAlpha = fadeIn * (1.0 - uHandoff) * (0.55 + 0.45 * p) * (0.85 + 0.15 * aRand);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // 遠近サイズ減衰: z=0 で等倍
  gl_PointSize = aSize * (uPointScale / -mvPosition.z);
}
`;

const FRAG_SRC = /* glsl */ `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.18, 0.5, d)) * vAlpha;
  if (a < 0.01) {
    discard;
  }
  gl_FragColor = vec4(vColor, a);
}
`;

/**
 * トップページ パーティクルローダー — Issue #412 / #414 / #416 / #418 / #420
 *
 * 6 フェーズ・合計約 10 秒: 粒子が漂い（drift）→ 波状に緩収束（converge）→
 * 一気に吸着（snap）してロゴを板厚付きで形成 → 実ロゴ画像へバトンタッチ（handoff）→
 * 実ロゴを見せて（hold）→ フェードアウト（fade）。
 *
 * 構成と、その理由:
 * - **オーバーレイは SSR される**（`ssr: false` をやめ、three.js だけを `import('three')` で
 *   遅延ロード）。初期 HTML にオーバーレイが存在するため、低速回線でも
 *   「ヒーローが見えてから覆われる」逆順フラッシュが起きない（#416）。
 * - **背景は --ink で完全不透明**。ヒーローは透けない（#418）。
 * - **開始時は実ロゴも不可視**（#420 で LOGO_GHOST_OPACITY = 0）。粒子が集まって初めて
 *   ロゴが浮かび上がる。⚠️ この結果トップの FCP/LCP は演出の尺そのもの（約 10 秒）になり
 *   Performance は 55 前後に落ちる — 意図的なトレードオフで、CI の性能ゲートは下層ページ
 *   （/services）で担保する（詳細: documents/spec/top-particle-loader.md）。
 * - `prefers-reduced-motion` はハイドレーション前から効かせる必要があるため CSS
 *   （globals.css の `[data-top-loader]`）で非表示にする。JS 側でも unmount する。
 * - **JS が動かない場合の二重の保険**: JS 無効なら `app/page.tsx` の `<noscript>` が消し、
 *   JS 有効なのに死んだ場合（チャンク 404 等）は CSS アニメーション（globals.css の
 *   `top-loader-failsafe` / LOADER_CSS_FAILSAFE_MS）が消す。
 */
export default function TopParticleLoader() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  // e2e 高速化フラグ（実ユーザーは常に 1）。timeScale は framer の transition にしか
  // 使われず SSR HTML に出力されないためハイドレーション不一致は起きない。
  // setState で後から変えると effect が再実行され three.js の初期化が 2 周するため、
  // 初期化時に一度だけ固定する（PR #419 レビュー対応）
  const [timeScale] = useState(() => getLoaderTimeScale());
  // SSR では 0（performance.now() はプロセス起動起点の巨大な値になるため使わない）
  const [elapsedAtMount] = useState(() =>
    typeof window === 'undefined' ? 0 : performance.now(),
  );
  /**
   * タイムラインの起点（PR #419 レビュー対応）。
   *
   * - **初回ロード（SSR された HTML がトップ）**: ナビゲーション起点（0）。オーバーレイは
   *   SSR で早く描かれているため、ハイドレーションの遅れ分だけ暗転が伸びないよう
   *   残り時間を切る（低速回線対策）。
   * - **soft nav（下層 → `<Link href="/">` でトップへ）**: マウント起点。`performance.now()` は
   *   ドキュメントの timeOrigin 起点でクライアント遷移ではリセットされないため、ナビ起点の
   *   ままだと「下層を 11 秒以上見てから戻る」と残り時間が全て 0 になり、**オーバーレイが
   *   1 フレームだけ描かれて即消える黒フラッシュ**になる（演出も一度も走らない）。
   * - **e2e 高速モード**: マウント起点。全予算が 1.65 秒しかなく、ナビ起点だとハイドレーションが
   *   それを超えた瞬間に演出が一度も走らないままテストだけ緑になる。
   */
  const [originMs] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }
    const isInitialTopLoad =
      getLoaderTimeScale() === 1 && !!document.querySelector('[data-top-loader]');
    return isInitialTopLoad ? 0 : performance.now();
  });
  const remaining = (budgetMs: number) =>
    Math.max(0, budgetMs * timeScale - (elapsedAtMount - originMs));
  /** framer の duration も delay と同じ物差しで導く（切り詰めた分だけ縮める）。 */
  const spanMs = (fromMs: number, toMs: number) => remaining(toMs) - remaining(fromMs);

  useEffect(() => {
    if (reduceMotion || !detectWebGLSupport()) {
      // reduced-motion は CSS でも隠しているが、DOM からも外して rAF を回さない
      setVisible(false);
      return;
    }
    // 演出が終わって消えたあとの再実行では何もしない（visible は true → false の
    // 一方向にしか遷移しないので二重初期化にはならない）。deps に visible を含めるのは
    // 「消滅時にクリーンアップを走らせて WebGL / リスナーを解放する」ため（PR #419 レビュー対応）
    if (!visible) {
      return;
    }

    const fallback = window.setTimeout(
      () => setVisible(false),
      remaining(LOADER_FALLBACK_MS),
    );
    const canvas = canvasRef.current;
    if (!canvas) {
      return () => window.clearTimeout(fallback);
    }

    // レンダラ / カメラ / 粒子スケールをリサイズ・画面回転に追従させるため let。
    // 実値は start() 冒頭で取る（three.js のロード完了後でないと古い寸法になるため）
    let width = 0;
    let height = 0;
    let cancelled = false;
    let rafId = 0;
    let dispose: (() => void) | undefined;

    const start = (THREE: typeof THREE_NS, image: HTMLImageElement) => {
      // 寸法を取り直す — width/height を捕捉したのはハイドレーション直後だが、ここへ来るのは
      // three.js チャンクのロード後。低速回線ではその間に画面回転が起こり得て、resize
      // リスナーもまだ張られていない（下で登録する）ため、そのイベントは失われる。
      // 取り直さないとレンダラ寸法・カメラ・散開半径が旧寸法のまま演出が最後まで走る
      // （PR #419 レビュー対応）
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;

      const probe = document.createElement('canvas');
      probe.width = image.naturalWidth;
      probe.height = image.naturalHeight;
      const probeCtx = probe.getContext('2d', { willReadFrequently: true });
      if (!probeCtx) {
        return;
      }
      probeCtx.drawImage(image, 0, 0);
      const { targets, colors, count } = sampleLogoParticles(
        probeCtx.getImageData(0, 0, probe.width, probe.height),
      );
      if (count === 0) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      // 確保したリソースは即 disposers に積む — 以降のどの時点で失敗しても解放漏れしない
      // （PR #413 レビュー対応。forceContextLoss で GL コンテキストも即時返却する）。
      // 非破壊コピーを逆順に回し、冪等にする — reverse() を直接呼ぶと二度目の dispose が
      // 元順で再実行され forceContextLoss が二重発火する（PR #419 レビュー対応）
      const disposers: Array<() => void> = [];
      let disposed = false;
      dispose = () => {
        if (disposed) {
          return;
        }
        disposed = true;
        [...disposers].reverse().forEach((run) => run());
      };
      disposers.push(() => {
        renderer.dispose();
        renderer.forceContextLoss();
      });

      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      const scene = new THREE.Scene();

      // z=0 平面で 1 world unit = 1 CSS px になる距離に PerspectiveCamera を置く
      const fovRad = THREE.MathUtils.degToRad(CAMERA_FOV_DEG);
      const cameraDistance = height / 2 / Math.tan(fovRad / 2);
      const camera = new THREE.PerspectiveCamera(
        CAMERA_FOV_DEG,
        width / height,
        1,
        cameraDistance * 3,
      );
      camera.position.z = cameraDistance;

      // 粒子の目標サイズは、実際にレイアウトされた実ロゴ <img> の実測値から導く。
      // CSS（LOGO_DISPLAY_WIDTH_CSS）を SSOT にすることで handoff の位置ズレを原理的に防ぐ
      // — 式を JS 側にも書くと `vh` と window.innerHeight の非等価（モバイルの URL バー）で
      // 2 割ほど食い違う（PR #419 レビュー対応）。<img> 未測定時のみ式でフォールバックする
      const measureDisplayWidth = () =>
        logoRef.current?.getBoundingClientRect().width ||
        Math.min(
          width * LOGO_DISPLAY_WIDTH_RATIO,
          LOGO_DISPLAY_WIDTH_MAX_PX,
          (height * LOGO_DISPLAY_HEIGHT_RATIO * image.naturalWidth) / image.naturalHeight,
        );

      const positions = new Float32Array(count * 3);
      const starts = new Float32Array(count * 3);
      const delays = new Float32Array(count);
      const sizes = new Float32Array(count);
      const rands = new Float32Array(count);
      const spread = Math.max(width, height) * 0.75;
      // targets（画像中心原点・画像 px）→ ワールド座標。リサイズでも同じ変換を掛け直す
      const applyScale = () => {
        const scale = measureDisplayWidth() / image.naturalWidth;
        for (let i = 0; i < count; i += 1) {
          positions[i * 3] = targets[i * 3] * scale;
          positions[i * 3 + 1] = targets[i * 3 + 1] * scale;
        }
      };
      for (let i = 0; i < count; i += 1) {
        positions[i * 3 + 2] = (Math.random() - 0.5) * LOGO_DEPTH_PX;
        const angle = Math.random() * Math.PI * 2;
        const dist = spread * (0.35 + Math.random() * 0.65);
        starts[i * 3] = Math.cos(angle) * dist;
        starts[i * 3 + 1] = Math.sin(angle) * dist;
        starts[i * 3 + 2] = (Math.random() - 0.5) * LOGO_DEPTH_PX * 4.0;
        delays[i] = Math.random() * PARTICLE_STAGGER_MS;
        sizes[i] = (1.7 + Math.random() * 1.7) * dpr;
        rands[i] = Math.random();
      }
      applyScale();

      const geometry = new THREE.BufferGeometry();
      disposers.push(() => geometry.dispose());
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aStart', new THREE.BufferAttribute(starts, 3));
      geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aRand', new THREE.BufferAttribute(rands, 1));

      const material = new THREE.ShaderMaterial({
        vertexShader: VERT_SRC,
        fragmentShader: FRAG_SRC,
        uniforms: {
          uTime: { value: 0 },
          uDrift: { value: LOADER_TIMELINE_MS.drift },
          uConverge: { value: LOADER_TIMELINE_MS.converge },
          uSnap: { value: LOADER_TIMELINE_MS.snap },
          uStagger: { value: PARTICLE_STAGGER_MS },
          uHalfDepth: { value: LOGO_DEPTH_PX / 2 },
          uHandoff: { value: 0 },
          // 初期値は画面外に置き、ポインタが動くまで反発を発生させない
          uMouse: { value: new THREE.Vector2(1e6, 1e6) },
          uInteract: { value: 0 },
          uPointScale: { value: cameraDistance },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      disposers.push(() => material.dispose());
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // 視差用に正規化マウス座標（-1..1）も保持する
      const mouseNdc = new THREE.Vector2(0, 0);
      const shaderUniforms = material.uniforms;
      const handlePointerMove = (event: PointerEvent) => {
        shaderUniforms.uMouse.value.set(
          event.clientX - width / 2,
          height / 2 - event.clientY,
        );
        mouseNdc.set((event.clientX / width) * 2 - 1, (event.clientY / height) * 2 - 1);
      };
      window.addEventListener('pointermove', handlePointerMove);
      disposers.push(() => window.removeEventListener('pointermove', handlePointerMove));

      // リサイズ・画面回転への追従: レンダラ・カメラ・uMouse の座標基準に加え、
      // 粒子の目標座標も <img> の新しい実測値で組み直す — <img> は vw/vh で
      // 追従するので、粒子を固定したままだと handoff でズレる（PR #419 レビュー対応）
      const handleResize = () => {
        width = canvas.clientWidth || window.innerWidth;
        height = canvas.clientHeight || window.innerHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        // カメラ距離も追従させ「z=0 で 1 world unit = 1 CSS px」を維持する
        const distance = height / 2 / Math.tan(fovRad / 2);
        camera.position.z = distance;
        camera.far = distance * 3;
        camera.updateProjectionMatrix();
        shaderUniforms.uPointScale.value = distance;
        applyScale();
        geometry.attributes.position.needsUpdate = true;
        // handoff 完了後は draw() が rAF を止めているため、ここで描き直さないと更新が
        // 画面に反映されない。今は uHandoff=1 で粒子が全て discard されるので見た目は
        // 変わらないが、handoff の終端を前倒しすると「hold 中の回転で粒子が固まる」形で
        // 表面化する。1 フレーム分のコストなので常に描いておく（PR #419 2 巡目レビュー対応）
        renderer.render(scene, camera);
      };
      window.addEventListener('resize', handleResize);
      disposers.push(() => window.removeEventListener('resize', handleResize));

      const draw = () => {
        // クロックの起点は framer 側（remaining）と同じ originMs に揃える。
        // 等倍ではナビゲーション起点なので、three.js のロードが遅れた場合は演出を
        // 「途中から」始めて 10 秒の予算内に収める（マウント起点にすると低速回線ほど
        // 暗転が伸びる — PR #419 レビュー対応）。timeScale で割ることで高速化時も
        // シェーダは基準 ms で動く
        const elapsed = (performance.now() - originMs) / timeScale;
        shaderUniforms.uTime.value = elapsed;
        const interact = THREE.MathUtils.smoothstep(
          elapsed,
          LOADER_SNAP_END_MS,
          LOADER_SNAP_END_MS + INTERACT_RAMP_MS,
        );
        shaderUniforms.uInteract.value = interact;
        // handoff: 粒子を薄れさせ、実ロゴ <img>（framer 側でフェードイン）へ主役を渡す
        shaderUniforms.uHandoff.value = THREE.MathUtils.smoothstep(
          elapsed,
          LOADER_SNAP_END_MS,
          LOADER_HANDOFF_END_MS,
        );
        // 視差: ロゴ完成後、マウス位置に向けて緩やかに傾けて板厚を見せる。
        // PARALLAX_LERP はフレームレート依存（30fps では追従が約半分）だが演出品質のみの影響
        points.rotation.y +=
          (mouseNdc.x * PARALLAX_MAX_RAD.y * interact - points.rotation.y) * PARALLAX_LERP;
        points.rotation.x +=
          (mouseNdc.y * PARALLAX_MAX_RAD.x * interact - points.rotation.x) * PARALLAX_LERP;
        renderer.render(scene, camera);
        // handoff 完了後は粒子が完全に消えている（uHandoff=1）。以降は実ロゴだけが
        // 主役なので rAF を止める（PR #419 レビュー対応）
        if (elapsed >= LOADER_HANDOFF_END_MS) {
          rafId = 0;
          return;
        }
        rafId = window.requestAnimationFrame(draw);
      };
      rafId = window.requestAnimationFrame(draw);
    };

    // three.js はここで初めてロードする（トップページ表示時のみ・#402 バンドル配慮）。
    // 失敗してもオーバーレイと実ロゴは SSR 済みで、fade / フォールバックで必ず消える
    const image = new Image();
    image.src = LOADER_LOGO_SRC;
    Promise.all([import('three'), image.decode()])
      .then(([three]) => {
        if (!cancelled) {
          start(three, image);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            'TopParticleLoader: 粒子演出を開始できません（実ロゴのみ表示して終了します）',
            error,
          );
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.cancelAnimationFrame(rafId);
      dispose?.();
    };
    // timeScale / elapsedAtMount / originMs / remaining はマウント時に固定される。
    // visible は「false になったらクリーンアップで解放する」ために依存させている
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, visible]);

  // a11y: 演出中はヒーローが不可視なので、キーボードのフォーカスリングも
  // クリック対象も見えない（WCAG 2.4.7）。ユーザー操作を検知したら演出を即スキップして
  // 本体を見せる。オーバーレイは pointer-events-none のままなので操作自体は背後に通る
  // （PR #419 レビュー対応）
  useEffect(() => {
    if (!visible) {
      return;
    }
    const skip = () => setVisible(false);
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });

    /**
     * bfcache 復帰でも演出を打ち切る（PR #419 2 巡目レビュー対応）。
     *
     * シェーダの時計は performance.now()（＝ timeOrigin 起点の実時間）で進むのに対し、
     * 消滅経路 3 つ（framer の WAAPI / LOADER_FALLBACK_MS の setTimeout / CSS の最終防衛線）は
     * **すべて bfcache 凍結中に停止する**。そのため「演出中に戻る → しばらくして進む」と、
     * 復帰直後の rAF 1 発目で elapsed が跳ねて uHandoff=1 となり粒子だけ即座に全消滅する一方、
     * framer と setTimeout は残り時間を待つため、**粒子もロゴも無い不透明な黒画面**が数秒残る
     * （LOGO_GHOST_OPACITY = 0 のためロゴも見えない）。復帰を検知したら即座に畳む。
     */
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setVisible(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <m.div
      data-testid="page-loader"
      data-top-loader
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2000] flex items-center justify-center"
      style={
        {
          // #418: トップページ背景色で完全に塞ぐ（ヒーローを透けさせない）
          background: 'var(--ink)',
          // JS が死んでもオーバーレイを必ず消す CSS 専用の最終防衛線（globals.css の
          // top-loader-failsafe）。この style は SSR されるので JS の実行を一切必要としない。
          // animation-delay を直接ではなく CSS 変数で渡すのは、この style が失われても
          // globals.css 側のフォールバック（10 年）が効いて「保険が演出を殺す」事故を
          // 防ぐため（PR #419 2 巡目レビュー対応）
          '--top-loader-failsafe-delay': `${LOADER_CSS_FAILSAFE_MS}ms`,
        } as CSSProperties
      }
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        // duration も delay と同じ物差しで導く — 固定にすると、ハイドレーションが遅れて
        // delay だけ切り詰められたとき粒子（シェーダ時計）と食い違う（PR #419 レビュー対応）
        duration: spanMs(LOADER_FADE_START_MS, LOADER_TOTAL_MS) / 1000,
        // ハイドレーションが遅れた分を差し引く（低速回線で暗転が伸びないように）
        delay: remaining(LOADER_FADE_START_MS) / 1000,
      }}
      onAnimationComplete={() => setVisible(false)}
    >
      {/* 実ロゴ。粒子は <img> の実測幅からスケールを導くので位置ズレなく重なる。
          #420 で LOGO_GHOST_OPACITY = 0 になったため開始時は完全に不可視で、handoff で
          初めて立ち上がる（＝ Lighthouse から見える contentful paint は演出終了まで無い）。
          next/image ではなく素の <img>: SSR 時点で DOM に載せたく、最適化も不要な小サイズのため */}
      <m.img
        ref={logoRef}
        src={LOADER_LOGO_REVEAL_SRC}
        alt=""
        width={LOGO_SOURCE_WIDTH_PX}
        height={LOGO_SOURCE_HEIGHT_PX}
        fetchPriority="high"
        decoding="sync"
        data-testid="loader-logo"
        className="absolute h-auto"
        style={{ width: LOGO_DISPLAY_WIDTH_CSS }}
        initial={{ opacity: LOGO_GHOST_OPACITY }}
        animate={{ opacity: 1 }}
        transition={{
          // 粒子の uHandoff（シェーダ時計）と同じ区間を共有する
          duration: spanMs(LOADER_SNAP_END_MS, LOADER_HANDOFF_END_MS) / 1000,
          delay: remaining(LOADER_SNAP_END_MS) / 1000,
          ease: 'easeInOut',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </m.div>
  );
}
