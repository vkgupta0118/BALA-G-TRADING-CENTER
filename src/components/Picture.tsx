import { withBase } from '@/config/env';
import { type GeneratedImageSlug, generatedImages } from '@/config/images.generated';

/**
 * A photograph of the shop, served as AVIF → WebP → JPEG.
 *
 * Every instance reserves its exact box before the bytes arrive (width/height
 * attributes plus an aspect-ratio style), so photographs can never push the page
 * around while they load. Only the hero passes `priority`; everything else is
 * lazy and low-priority, which keeps the largest contentful paint to one request.
 */
export function Picture({
  slug,
  alt,
  sizes,
  className,
  priority = false,
}: {
  slug: GeneratedImageSlug;
  alt: string;
  /** Matches the CSS box the image occupies, so the browser picks the smallest useful file. */
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const image = generatedImages[slug];
  const srcSet = (ext: string) =>
    image.widths.map((w) => `${withBase(`/images/${slug}/${slug}-${w}.${ext}`)} ${w}w`).join(', ');
  // Largest generated width is the safest <img src> fallback for very old browsers.
  const fallbackWidth = image.widths[image.widths.length - 1] ?? image.width;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={withBase(`/images/${slug}/${slug}-${fallbackWidth}.jpg`)}
        srcSet={srcSet('jpg')}
        sizes={sizes}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'low'}
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      />
    </picture>
  );
}

/**
 * Stands in for a category the owner has not photographed yet. It says so plainly
 * rather than borrowing a stock photograph of someone else's shop.
 */
export function PhotoPending({ label }: { label: string }) {
  return (
    <div className="photo-pending" role="img" aria-label={label} data-testid="photo-pending">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="icon">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10.5" r="1.5" />
        <path d="m21 16-5-5L5 19" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
