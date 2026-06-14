/** Shared typography class strings for home scroll sections — Issue #15 */

import { typographyFontClasses, typographySizeClasses } from '@/lib/design/tokens';

export const sectionHeadingClass = `mb-[var(--space-2)] ${typographyFontClasses.serif} ${typographySizeClasses.heading} font-light text-[color:var(--foreground)] tracking-[0.05em]`;

export const sectionCaptionClass = `mb-[var(--space-2)] ${typographySizeClasses.caption} text-[color:var(--muted)] tracking-[0.15em] uppercase`;

export const sectionHistoryCaptionClass = `mb-[var(--space-4)] ${typographySizeClasses.caption} text-[color:var(--muted)] tracking-[0.12em] uppercase`;

export const pillarTextClass = `max-w-[36em] ${typographyFontClasses.serifJp} ${typographySizeClasses.subheading} font-light leading-[1.85] text-[color:var(--foreground)]`;
