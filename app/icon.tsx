import { ImageResponse } from 'next/og';
import { FaviconImage } from '@/lib/brand/favicon-image';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<FaviconImage size={size.width} />, {
    ...size,
  });
}
