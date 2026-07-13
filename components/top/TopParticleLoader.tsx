'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { detectWebGLSupport } from '@/lib/webgl/support';
import {
  LOADER_FALLBACK_MS,
  LOADER_LOGO_SRC,
  LOADER_TIMELINE_MS,
  LOGO_DISPLAY_WIDTH_MAX_PX,
  LOGO_DISPLAY_WIDTH_RATIO,
  PARTICLE_STAGGER_MS,
  PARTICLE_TRAVEL_MS,
  sampleLogoParticles,
} from '@/lib/loader/particle-logo';

/** マウス反発が届く半径と最大変位（CSS px）。ロゴ完成後のみ有効。 */
const REPEL_RADIUS_PX = 110;
const REPEL_STRENGTH_PX = 46;
/** 反発の立ち上がり時間。gather 完了直後にいきなり弾けないよう滑らかに入れる。 */
const INTERACT_RAMP_MS = 250;

const VERT_SRC = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aColor;
attribute float aDelay;
attribute float aSize;
attribute float aRand;

uniform float uTime;      // 演出開始からの経過 ms
uniform float uTravel;    // 粒子 1 個の移動時間 ms
uniform vec2 uMouse;      // ワールド座標（CSS px・中心原点・y 上向き）
uniform float uInteract;  // 0..1 ロゴ完成後に 1 へ

varying vec3 vColor;
varying float vAlpha;

void main() {
  float t = clamp((uTime - aDelay) / uTravel, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 3.0); // easeOutCubic
  vec3 pos = mix(aStart, position, e);

  // 収束後も粒子がわずかに揺らぎ続ける（参照 CodePen の質感）
  pos.x += sin(uTime * 0.0013 + aRand * 6.2832) * 0.7 * e;
  pos.y += cos(uTime * 0.0011 + aRand * 12.566) * 0.7 * e;

  vec2 d = pos.xy - uMouse;
  float dist = length(d) + 0.0001;
  float force = smoothstep(${REPEL_RADIUS_PX.toFixed(1)}, 0.0, dist)
    * uInteract * ${REPEL_STRENGTH_PX.toFixed(1)};
  pos.xy += (d / dist) * force;

  vColor = aColor;
  vAlpha = e * (0.85 + 0.15 * aRand);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize;
}
`;

const FRAG_SRC = /* glsl */ `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.18, d) * vAlpha;
  if (a < 0.01) {
    discard;
  }
  gl_FragColor = vec4(vColor, a);
}
`;

/**
 * トップページ パーティクルローダー — Issue #412
 *
 * 散らばった粒子が集まりロゴ（public/loader/logo-particle-source.png）を形成し、
 * 約 1 秒の静止（この間のみマウス反発が有効）を経てフェードアウトする。
 * three.js はこのモジュールごと dynamic import されるためトップページ表示時のみロードされる。
 *
 * - #312 の「トップはローダーなし」決定を変更（2026-07-13 確定・Issue #412）。
 *   下層ページの PageLoader / SubPageEffects には手を入れない。
 * - e2e（e2e/helpers.ts ほか）が data-testid="page-loader" の消滅を 5000ms 以内で
 *   待つため、演出合計 + フォールバックはその予算内に収める（lib/loader/particle-logo.ts）。
 * - prefers-reduced-motion 時と WebGL 非対応時は描画しない。
 */
export default function TopParticleLoader() {
  const reduceMotion = useReducedMotion();
  // WebGL 非対応環境では最初から描画しない（detectWebGLSupport はキャッシュ付きで冪等）
  const [visible, setVisible] = useState(() => detectWebGLSupport());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduceMotion || !visible) {
      return;
    }

    const fallback = window.setTimeout(() => setVisible(false), LOADER_FALLBACK_MS);
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
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        -10,
        10,
      );

      // 目標座標（画像 px）を表示サイズへスケール
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
        positions[i * 3 + 2] = 0;
        const angle = Math.random() * Math.PI * 2;
        const dist = spread * (0.35 + Math.random() * 0.65);
        starts[i * 3] = Math.cos(angle) * dist;
        starts[i * 3 + 1] = Math.sin(angle) * dist;
        starts[i * 3 + 2] = 0;
        delays[i] = Math.random() * PARTICLE_STAGGER_MS;
        sizes[i] = (1.7 + Math.random() * 1.7) * dpr;
        rands[i] = Math.random();
      }

      const geometry = new THREE.BufferGeometry();
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
          uTravel: { value: PARTICLE_TRAVEL_MS },
          // 初期値は画面外に置き、ポインタが動くまで反発を発生させない
          uMouse: { value: new THREE.Vector2(1e6, 1e6) },
          uInteract: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      scene.add(new THREE.Points(geometry, material));

      const handlePointerMove = (event: PointerEvent) => {
        material.uniforms.uMouse.value.set(
          event.clientX - width / 2,
          height / 2 - event.clientY,
        );
      };
      window.addEventListener('pointermove', handlePointerMove);

      const startedAt = performance.now();
      const draw = (now: number) => {
        const elapsed = now - startedAt;
        material.uniforms.uTime.value = elapsed;
        material.uniforms.uInteract.value = THREE.MathUtils.smoothstep(
          elapsed,
          LOADER_TIMELINE_MS.gather,
          LOADER_TIMELINE_MS.gather + INTERACT_RAMP_MS,
        );
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(draw);
      };
      rafId = window.requestAnimationFrame(draw);

      dispose = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
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
      .catch(() => setVisible(false));

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.cancelAnimationFrame(rafId);
      dispose?.();
    };
  }, [reduceMotion, visible]);

  if (reduceMotion || !visible) {
    return null;
  }

  return (
    <m.div
      data-testid="page-loader"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2000]"
      style={{ background: 'var(--background)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{
        duration: LOADER_TIMELINE_MS.fade / 1000,
        delay: (LOADER_TIMELINE_MS.gather + LOADER_TIMELINE_MS.hold) / 1000,
      }}
      onAnimationComplete={() => setVisible(false)}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </m.div>
  );
}
