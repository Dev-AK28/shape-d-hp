export type LogoSamplePoint = { x: number; y: number };

export const LOGO_SAMPLE_STEP = 6;
export const LOGO_MAX_PARTICLES = 900;
export const LOGO_ALPHA_THRESHOLD = 140;

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
