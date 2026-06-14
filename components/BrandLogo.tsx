import Image from 'next/image';
import { backgroundAssets } from '@/lib/design/background-assets';

const LOGO_WIDTH = 1536;
const LOGO_HEIGHT = 1024;

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
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        className={`relative z-[1] h-auto w-[min(88vw,560px)] object-contain ${className}`}
      />
    );
  }

  const width = Math.round(height * (LOGO_WIDTH / LOGO_HEIGHT));

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
