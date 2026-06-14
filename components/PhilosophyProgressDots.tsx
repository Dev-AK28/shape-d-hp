'use client';

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
      className="pointer-events-none fixed top-1/2 right-[max(var(--space-3),env(safe-area-inset-right,0px))] z-50 flex -translate-y-1/2 flex-col gap-[var(--space-2)]"
    >
      {letters.map((letter, index) => (
        <span
          key={letter}
          className={`size-2 rounded-full transition-[background,opacity] duration-[var(--duration-base)] ease-[var(--ease-base)] ${
            activeIndex === index
              ? 'bg-[var(--accent)] opacity-100'
              : 'bg-[var(--muted)] opacity-[0.35]'
          }`}
        />
      ))}
    </div>
  );
}
