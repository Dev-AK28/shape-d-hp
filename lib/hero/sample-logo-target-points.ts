import { HERO_BIGBANG_FORMATION_MS } from '@/lib/scroll/animation-tokens';

export type LogoSamplePoint = { x: number; y: number };

export const LOGO_SAMPLE_STEP = 6;
export const LOGO_MAX_PARTICLES = 900;
export const LOGO_ALPHA_THRESHOLD = 140;

/** Longest edge when rasterizing PNG for particle targets (reduces getImageData memory). */
export const LOGO_SAMPLE_MAX_DIMENSION = 768;

/**
 * Canvas particle scale vs sampled silhouette bounds.
 * 0.98 inset aligns dot cluster with `BrandLogo` object-contain padding in hero stage.
 */
export const LOGO_PARTICLE_RENDER_SCALE = 0.98;

/**
 * Hero particle formation duration (ms): the big-bang grains reach the logo
 * silhouette at this point. SSOT for the component + E2E waits. Derived from
 * `HERO_BIGBANG` phase timings (bigBang + drift + gather) in animation-tokens.
 */
export const LOGO_PARTICLE_FORMATION_MS = HERO_BIGBANG_FORMATION_MS;

export function fitSampleDimensions(
  width: number,
  height: number,
  maxDimension = LOGO_SAMPLE_MAX_DIMENSION,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longest;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export function sampleLogoTargetPointsFromImageData(
  width: number,
  height: number,
  data: Uint8ClampedArray | Buffer,
  step = LOGO_SAMPLE_STEP,
  maxParticles = LOGO_MAX_PARTICLES,
  alphaThreshold = LOGO_ALPHA_THRESHOLD,
): LogoSamplePoint[] {
  const points: LogoSamplePoint[] = [];

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        points.push({
          x: x - width / 2,
          y: y - height / 2,
        });
      }
    }
  }

  if (points.length <= maxParticles) {
    return points;
  }

  const stride = Math.ceil(points.length / maxParticles);
  return points.filter((_, index) => index % stride === 0);
}
