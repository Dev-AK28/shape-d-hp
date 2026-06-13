import { ImageResponse } from 'next/og';
import { FaviconImage } from '@/lib/brand/favicon-image';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(<FaviconImage size={180} />, {
    ...size,
  });
}
