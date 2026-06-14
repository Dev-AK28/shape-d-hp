/** Shared typography class strings for home scroll sections — Issue #15 */

import { typographyFontClasses, typographySizeClasses } from '@/lib/design/tokens';

export const sectionAccentDividerClass = 'h-px w-16 bg-[var(--accent)]';

export const sectionHeadingClass = `mb-[var(--space-2)] ${typographyFontClasses.serif} ${typographySizeClasses.heading} font-light text-[color:var(--foreground)] tracking-[0.05em]`;

export const sectionCaptionClass = `mb-[var(--space-2)] ${typographySizeClasses.caption} text-[color:var(--muted)] tracking-[0.15em] uppercase`;

export const sectionHistoryCaptionClass = `mb-[var(--space-4)] ${typographySizeClasses.caption} text-[color:var(--muted)] tracking-[0.12em] uppercase`;

export const pillarTextClass = `max-w-[36em] ${typographyFontClasses.serifJp} ${typographySizeClasses.subheading} font-light leading-[1.85] text-[color:var(--foreground)]`;

export const visualWordClass = `pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap ${typographyFontClasses.serif} ${typographySizeClasses.visualWord} font-light tracking-[0.08em] text-[color:var(--foreground)] opacity-[0.04]`;

export const visionLeadClass = `mb-[var(--space-8)] ${typographyFontClasses.serifJp} ${typographySizeClasses.subheading} font-light tracking-[0.06em] text-[color:var(--accent)]`;

export const visionQuoteClass = `mb-[var(--space-6)] max-w-[36em] border-none p-0 ${typographyFontClasses.serifJp} ${typographySizeClasses.quote} font-light leading-[1.85] text-balance text-[color:var(--foreground)]`;

export const timelineIndexClass = `mb-[var(--space-1)] block ${typographyFontClasses.serif} ${typographySizeClasses.caption} text-[color:var(--muted)]`;

export const timelineBodyClass = `m-0 ${typographyFontClasses.serifJp} ${typographySizeClasses.body} leading-[1.8] text-[color:var(--foreground)]`;
