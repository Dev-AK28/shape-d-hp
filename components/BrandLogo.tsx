import Image from 'next/image';

type BrandLogoProps = {
  height?: number;
  className?: string;
  priority?: boolean;
};

const LOGO_WIDTH = 1380;
const LOGO_HEIGHT = 752;

export default function BrandLogo({
  height = 48,
  className = '',
  priority = false,
}: BrandLogoProps) {
  const width = Math.round(height * (LOGO_WIDTH / LOGO_HEIGHT));

  return (
    <Image
      src="/image_13.png"
      alt="SHAPE∞D Logo"
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto max-w-[200px] object-contain ${className}`}
      style={{ width, height }}
    />
  );
}
