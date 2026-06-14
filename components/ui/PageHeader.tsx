'use client';

import type { ReactNode } from 'react';
import StarBackground from '@/components/StarBackground';
import ScrollReveal from '@/components/scroll/ScrollReveal';
import TextReveal from '@/components/scroll/TextReveal';
import SectionShell from '@/components/ui/SectionShell';

export type PageHeaderProps = {
  /** English page title (h1). */
  title: string;
  /** Japanese lead copy below the divider. */
  subtitle?: string;
  /** Optional contact email line (contact page). */
  email?: string;
  /** Gradient divider accent color. */
  dividerColor?: string;
  /** Show the centered gradient divider under the title. Default: true. */
  showDivider?: boolean;
  /** Animate the title with TextReveal. Default: true. */
  animateTitle?: boolean;
  /** Render StarBackground behind the header (process pages). */
  starBackground?: boolean;
  children?: ReactNode;
  className?: string;
};

export default function PageHeader({
  title,
  subtitle,
  email,
  dividerColor = '#60a5fa',
  showDivider = true,
  animateTitle = true,
  starBackground = false,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <SectionShell
      padding="sm"
      data-testid="page-header"
      className={`flex flex-col items-center justify-center pt-[120px] ${className}`}
    >
      {starBackground ? <StarBackground config={{ count: 100 }} /> : null}

      <ScrollReveal className="relative z-10 w-full max-w-[800px] text-center">
        <h1
          aria-label={title}
          className="mb-4 font-serif text-[clamp(36px,5vw,48px)] font-light tracking-wider text-white"
        >
          {animateTitle ? (
            <TextReveal as="span" text={title} blend={starBackground ? 'cosmic' : 'solid'} />
          ) : (
            title
          )}
        </h1>

        {showDivider ? (
          <div
            aria-hidden="true"
            data-testid="page-header-divider"
            className="mx-auto h-px w-24"
            style={{
              background: `linear-gradient(to right, transparent, ${dividerColor}, transparent)`,
            }}
          />
        ) : null}

        {subtitle ? (
          <p
            data-testid="page-header-subtitle"
            className="mx-auto mt-8 max-w-3xl font-serif text-base leading-relaxed text-gray-400"
          >
            {subtitle}
          </p>
        ) : null}

        {email ? (
          <p
            data-testid="page-header-email"
            className="mt-2 font-serif text-sm text-gray-500"
          >
            {email}
          </p>
        ) : null}
      </ScrollReveal>

      {children ? <div className="relative z-10 w-full">{children}</div> : null}
    </SectionShell>
  );
}
