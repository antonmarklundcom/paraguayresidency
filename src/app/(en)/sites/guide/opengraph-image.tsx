import { ogImage, ogImageSize, ogImageContentType } from '@/lib/og-image';

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = 'Paraguay Residency Group';

export default function Image() {
  return ogImage('guide');
}
