import Image from 'next/image';
import { backgroundAssets } from '@/lib/design/background-assets';
import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
} from '@/lib/design/brand-logo-constants';

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
  /** Hero / brand pages — fluid width. Default: fixed height for nav and inline use. */
  variant?: 'inline' | 'hero';
};

export default function BrandLogo({
  height = 48,
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

  const width = Math.round(height * (BRAND_LOGO_WIDTH / BRAND_LOGO_HEIGHT));

  return (
    <Image
      src={backgroundAssets.brandLogoTransparent}
      alt="SHAPE∞D Logo"
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ width, height }}
    />
  );
}
