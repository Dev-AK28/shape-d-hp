'use client';

type PhilosophyProgressDotsProps = {
  letters: readonly string[];
  activeIndex: number;
  /**
   * Whether the panelled section is still in view. When false (scrolled past
   * the last panel, e.g. the closing CTA / footer is showing) the dots fade
   * out and are removed from the hit-testing tree via visibility:hidden so
   * they never overlap the footer content (#365).
   */
  visible: boolean;
};

export default function PhilosophyProgressDots({
  letters,
  activeIndex,
  visible,
}: PhilosophyProgressDotsProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="philosophy-progress-dots"
      className={`pointer-events-none fixed top-1/2 right-[max(var(--space-3),env(safe-area-inset-right,0px))] z-50 flex -translate-y-1/2 flex-col gap-[var(--space-2)] transition-[opacity,visibility] duration-[var(--duration-base)] ease-[var(--ease-base)] ${
        visible ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      {letters.map((letter, index) => (
        <span
          key={letter}
          data-active={activeIndex === index}
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
