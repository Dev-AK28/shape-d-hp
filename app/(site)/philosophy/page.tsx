import type { Metadata } from 'next';
import PhilosophyContent from '@/components/PhilosophyContent';

const TITLE = '哲学 — 自己一致がもたらす、本来のあなたという強み | SHAPE∞D';
const DESCRIPTION =
  '自己一致・人間的表現・本来性——SHAPE∞Dというアクロニムに込めた哲学と、想いを実装へつなぐ考え方を紹介します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/philosophy',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/philosophy',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PhilosophyPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <h1 className="sr-only">哲学 — SHAPE∞D</h1>
      <PhilosophyContent />
    </main>
  );
}
