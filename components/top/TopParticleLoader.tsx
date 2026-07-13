'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { detectWebGLSupport } from '@/lib/webgl/support';
import {
  CONVERGE_PROGRESS_SHARE,
  DRIFT_AMPLITUDE_PX,
  getLoaderTimeScale,
  LOADER_FALLBACK_MS,
  LOADER_LOGO_SRC,
  LOADER_TIMELINE_MS,
  LOGO_DEPTH_PX,
  LOGO_DISPLAY_WIDTH_MAX_PX,
  LOGO_DISPLAY_WIDTH_RATIO,
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
 * 頂点シェーダ — 5 フェーズ演出（Issue #414）
 *
 * 収束進捗 p は converge（緩・easeInOutSine）が CONVERGE_PROGRESS_SHARE まで、
 * snap（急・easeOutQuart）が残りを受け持つ 2 段合成。drift 中は p=0 のまま
 * 出発位置の周囲を漂う（振幅は p が進むほど減衰）。
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
  float p = ${CONVERGE_PROGRESS_SHARE.toFixed(2)} * pc
    + ${(1 - CONVERGE_PROGRESS_SHARE).toFixed(2)} * ps;

  vec3 pos = mix(aStart, position, p);

  // drift: 出発位置の周囲をゆっくり漂う（収束が進むほど減衰し、完成後は微小ゆらぎになる）
  float wobble = mix(${DRIFT_AMPLITUDE_PX.toFixed(1)}, 0.9, p);
  pos.x += sin(uTime * 0.0004 + aRand * 6.2832) * wobble;
  pos.y += cos(uTime * 0.00033 + aRand * 12.566) * wobble;
  pos.z += sin(uTime * 0.00047 + aRand * 9.4248) * wobble * 0.5;

  // マウス反発（ロゴ完成後のみ）。smoothstep は edge0 < edge1 のみ定義（PR #413 レビュー対応）
  vec2 d = pos.xy - uMouse;
  float dist = length(d) + 0.0001;
  float force = (1.0 - smoothstep(0.0, ${REPEL_RADIUS_PX.toFixed(1)}, dist))
    * uInteract * ${REPEL_STRENGTH_PX.toFixed(1)};
  pos.xy += (d / dist) * force;

  // 深度シェーディング: 手前（+z）ほど明るく、奥ほど暗い — 板厚の立体感。
  // 下限を上げすぎると立体感が消え、下げすぎるとロゴ全体が沈む（0.72 は実写確認値）
  float shade = 0.72 + 0.28 * smoothstep(-uHalfDepth, uHalfDepth, pos.z);
  vColor = aColor * shade;

  // drift 序盤でフェードイン。長くすると初回描画が「ほぼ透明」になり
  // Lighthouse の FCP 計上が遅れる（900ms で FCP +0.9s を実測）ため短く保つ
  float fadeIn = clamp(uTime / 250.0, 0.0, 1.0);
  vAlpha = fadeIn * (0.55 + 0.45 * p) * (0.85 + 0.15 * aRand);

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
 * トップページ パーティクルローダー — Issue #412 / #414
 *
 * 5 フェーズ・合計約 10 秒: 粒子が漂い（drift）→ 波状に緩収束（converge）→
 * 一気に吸着（snap）してロゴ（public/loader/logo-particle-source.png）を板厚付きで形成し、
 * 静止（hold: マウス反発 + 視差）を経てフェードアウトする。
 * three.js はこのモジュールごと dynamic import されるためトップページ表示時のみロードされる。
 *
 * - タイムラインの SSOT は lib/loader/particle-logo.ts。e2e は LOADER_E2E_TIMEOUT_MS で
 *   消滅を待ち、一括実行時は fixtures の __SHAPE_D_LOADER_TIME_SCALE__ で短縮される
 *   （等倍の実時間検証は e2e/top-loader.spec.ts）。
 * - フェード/フォールバックはマウント起点、粒子タイムラインは画像 decode 完了起点。
 *   画像ロードが遅い場合は演出を延ばさず途中で切り上げる（時間予算優先の意図的トレードオフ）。
 * - prefers-reduced-motion 時と WebGL 非対応時は描画しない。
 */
export default function TopParticleLoader() {
  const reduceMotion = useReducedMotion();
  // WebGL 非対応環境では最初から描画しない（detectWebGLSupport はキャッシュ付きで冪等）
  const [visible, setVisible] = useState(() => detectWebGLSupport());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // e2e 高速化フラグ（実ユーザーは常に 1）。レンダー中に読むため ref ではなく初期化時に固定
  const [timeScale] = useState(() => getLoaderTimeScale());

  useEffect(() => {
    if (reduceMotion || !visible) {
      return;
    }

    const fallback = window.setTimeout(
      () => setVisible(false),
      LOADER_FALLBACK_MS * timeScale,
    );
    const canvas = canvasRef.current;
    if (!canvas) {
      return () => window.clearTimeout(fallback);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    let cancelled = false;
    let rafId = 0;
    let dispose: (() => void) | undefined;

    const start = (image: HTMLImageElement) => {
      const probe = document.createElement('canvas');
      probe.width = image.naturalWidth;
      probe.height = image.naturalHeight;
      const probeCtx = probe.getContext('2d', { willReadFrequently: true });
      if (!probeCtx) {
        setVisible(false);
        return;
      }
      probeCtx.drawImage(image, 0, 0);
      const { targets, colors, count } = sampleLogoParticles(
        probeCtx.getImageData(0, 0, probe.width, probe.height),
      );
      if (count === 0) {
        setVisible(false);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      // 確保したリソースは即 disposers に積む — 以降のどの時点で失敗しても解放漏れしない
      // （PR #413 レビュー対応。forceContextLoss で GL コンテキストも即時返却する）
      const disposers: Array<() => void> = [];
      dispose = () => disposers.reverse().forEach((run) => run());
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

      // 目標座標（画像 px）を表示サイズへスケールし、z に板厚を与える
      const scale =
        Math.min(width * LOGO_DISPLAY_WIDTH_RATIO, LOGO_DISPLAY_WIDTH_MAX_PX) /
        image.naturalWidth;
      const positions = new Float32Array(count * 3);
      const starts = new Float32Array(count * 3);
      const delays = new Float32Array(count);
      const sizes = new Float32Array(count);
      const rands = new Float32Array(count);
      const spread = Math.max(width, height) * 0.75;
      for (let i = 0; i < count; i += 1) {
        positions[i * 3] = targets[i * 3] * scale;
        positions[i * 3 + 1] = targets[i * 3 + 1] * scale;
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

      // hold 中の視差用に正規化マウス座標（-1..1）も保持する
      const mouseNdc = new THREE.Vector2(0, 0);
      const shaderUniforms = material.uniforms;
      const handlePointerMove = (event: PointerEvent) => {
        shaderUniforms.uMouse.value.set(
          event.clientX - width / 2,
          height / 2 - event.clientY,
        );
        mouseNdc.set(
          (event.clientX / width) * 2 - 1,
          (event.clientY / height) * 2 - 1,
        );
      };
      window.addEventListener('pointermove', handlePointerMove);
      disposers.push(() => window.removeEventListener('pointermove', handlePointerMove));

      const formationEndMs =
        LOADER_TIMELINE_MS.drift + LOADER_TIMELINE_MS.converge + LOADER_TIMELINE_MS.snap;
      const startedAt = performance.now();
      const draw = (now: number) => {
        // タイムスケール補正: 高速化時もシェーダは基準 ms で動く
        const elapsed = (now - startedAt) / timeScale;
        shaderUniforms.uTime.value = elapsed;
        const interact = THREE.MathUtils.smoothstep(
          elapsed,
          formationEndMs,
          formationEndMs + INTERACT_RAMP_MS,
        );
        shaderUniforms.uInteract.value = interact;
        // 視差: ロゴ完成後、マウス位置に向けて緩やかに傾けて板厚を見せる
        points.rotation.y +=
          (mouseNdc.x * PARALLAX_MAX_RAD.y * interact - points.rotation.y) * PARALLAX_LERP;
        points.rotation.x +=
          (mouseNdc.y * PARALLAX_MAX_RAD.x * interact - points.rotation.x) * PARALLAX_LERP;
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(draw);
      };
      rafId = window.requestAnimationFrame(draw);
    };

    const image = new Image();
    image.src = LOADER_LOGO_SRC;
    image
      .decode()
      .then(() => {
        if (!cancelled) {
          start(image);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('TopParticleLoader: 演出を開始できないため即時終了します', error);
        }
        setVisible(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.cancelAnimationFrame(rafId);
      dispose?.();
    };
  }, [reduceMotion, visible, timeScale]);

  if (reduceMotion || !visible) {
    return null;
  }

  const formationStartMs = LOADER_TIMELINE_MS.drift + LOADER_TIMELINE_MS.converge;
  const holdEndMs = formationStartMs + LOADER_TIMELINE_MS.snap + LOADER_TIMELINE_MS.hold;

  return (
    <m.div
      data-testid="page-loader"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2000]"
      // 不透明にするとページ本体のペイントが演出終了まで Lighthouse に計上されず
      // FCP/LCP が約 10 秒になる（Performance 55 まで低下・#414 で実測）。
      // 半透明スクリムなら背後のヒーローが描画として成立し、粒子の視認性も保てる。
      style={{ background: 'rgba(7, 9, 13, 0.6)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        duration: (LOADER_TIMELINE_MS.fade * timeScale) / 1000,
        delay: (holdEndMs * timeScale) / 1000,
      }}
      onAnimationComplete={() => setVisible(false)}
    >
      {/* 「snap 以降だけ背景を濃くする」方式は試したが、Lighthouse のシミュレーション
          （lantern）が FCP/SI を演出終了側（9.4s）へ倒し 54 点まで低下したため断念（#414 実測）。
          スクリムは一定の 0.6 に保つこと */}
      <canvas ref={canvasRef} className="relative h-full w-full" />
    </m.div>
  );
}
