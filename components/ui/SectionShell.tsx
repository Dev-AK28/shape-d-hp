import type { ReactNode } from 'react';

type SectionShellProps = {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingMap = {
  sm: 'py-24 px-6',
  md: 'py-32 px-6',
  lg: 'py-40 px-6',
};

export default function SectionShell({
  children,
  className = '',
  padding = 'md',
}: SectionShellProps) {
  return (
    <section
      className={`relative bg-[radial-gradient(ellipse_at_center,#0a0a1a_0%,#000000_100%)] ${paddingMap[padding]} ${className}`}
    >
      {children}
    </section>
  );
}
