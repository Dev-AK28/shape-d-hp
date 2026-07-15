import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import SectionShell from '@/components/ui/SectionShell';

/**
 * Root 404 page — Issue #458
 *
 * Next.js renders this for any URL that matches no route (it is not wrapped
 * by app/(site)/layout.tsx, since that layout only applies to routes inside
 * the (site) route group), so Navigation/Footer are imported directly here
 * to keep the same look as the rest of the site instead of falling back to
 * Next.js's unstyled default 404 page.
 */
export const metadata: Metadata = {
  title: 'ページが見つかりません | SHAPE∞D',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="type-font-serif-jp contents">
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
        <SectionShell
          padding="lg"
          className="flex min-h-[70svh] flex-col items-center justify-center text-center"
        >
          <p className="font-serif text-sm tracking-[0.3em] text-blue-300">404</p>
          <h1 className="mt-4 font-serif text-3xl font-light tracking-wider text-white sm:text-4xl">
            ページが見つかりません
          </h1>
          <p className="mx-auto mt-6 max-w-md font-serif text-base leading-relaxed text-gray-400">
            お探しのページは移動または削除された可能性があります。
            URLをご確認いただくか、トップページからお探しください。
          </p>
          <Link
            href="/"
            className="mt-10 inline-block rounded-full border border-blue-400 px-10 py-4 font-serif text-blue-300 no-underline transition-colors duration-300 hover:border-blue-300 hover:text-blue-200"
          >
            トップページへ戻る
          </Link>
        </SectionShell>
      </main>
      <Footer />
    </div>
  );
}
