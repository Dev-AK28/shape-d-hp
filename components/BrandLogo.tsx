import Image from 'next/image';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
} from '@/lib/design/brand-logo-constants';

type BrandLogoProps = {
  height?: number;
  /** Alternative to `height` for inline use — fixes the rendered width instead (height is derived to keep the aspect ratio). */
  width?: number;
  className?: string;
  priority?: boolean;
  /** Hero / brand pages — fluid width. Default: fixed height for nav and inline use. */
  variant?: 'inline' | 'hero';
};

export default function BrandLogo({
  height,
  width,
  className = '',
  priority = false,
  variant = 'inline',
}: BrandLogoProps) {
  if (variant === 'hero') {
    return (
      <Image
        src={backgroundAssets.brandLogoTransparent}
        alt="SHAPE∞D Logo"
        width={BRAND_LOGO_WIDTH}
        height={BRAND_LOGO_HEIGHT}
        priority={priority}
        className={`relative z-[1] h-auto w-full object-contain ${className}`}
      />
    );
  }

  // Exactly one of width/height drives the size; the other is derived to
  // preserve the source image's aspect ratio, so the rendered element always
  // matches the width/height passed to `next/image` (avoids the "width or
  // height modified, but not the other" aspect-ratio warning).
  const resolvedHeight =
    width != null
      ? Math.round(width * (BRAND_LOGO_HEIGHT / BRAND_LOGO_WIDTH))
      : height ?? 48;
  const resolvedWidth =
    width ?? Math.round(resolvedHeight * (BRAND_LOGO_WIDTH / BRAND_LOGO_HEIGHT));

  return (
    <Image
      src={backgroundAssets.brandLogoTransparent}
      alt="SHAPE∞D Logo"
      width={resolvedWidth}
      height={resolvedHeight}
      priority={priority}
      className={`object-contain ${className}`}
      style={{ width: resolvedWidth, height: resolvedHeight }}
    />
  );
}
