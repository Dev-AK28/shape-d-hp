'use client';

import { colors } from '@/lib/design/tokens';

type PhilosophyProgressDotsProps = {
  letters: readonly string[];
  activeIndex: number;
};

export default function PhilosophyProgressDots({
  letters,
  activeIndex,
}: PhilosophyProgressDotsProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        right: 'max(var(--space-3), env(safe-area-inset-right, 0px))',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        pointerEvents: 'none',
      }}
    >
      {letters.map((letter, index) => (
        <span
          key={letter}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: activeIndex === index ? colors.accent : colors.muted,
            opacity: activeIndex === index ? 1 : 0.35,
            transition: 'background var(--duration-base) var(--ease-base), opacity var(--duration-base) var(--ease-base)',
          }}
        />
      ))}
    </div>
  );
}
