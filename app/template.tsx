import PageTransition from '@/components/ui/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {/* SmoothScrollProvider が Lenis velocity に応じて skewY を適用する対象。 */}
      <div data-velocity-content>
        {children}
      </div>
    </PageTransition>
  );
}
