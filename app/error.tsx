'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Root-level error boundary — Issue #458.
 *
 * Catches errors thrown outside the (site) route group (in practice, the
 * top page at app/page.tsx, which uses components/top/TopShell instead of
 * Navigation/Footer). Kept minimal and dependency-light on purpose: this
 * boundary may render when something in the page's own rendering pipeline
 * failed, so it avoids pulling in the same components/hooks that could be
 * implicated in the failure.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error in root route', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[var(--background)] to-black px-6 py-24 text-center">
      <h1 className="font-serif text-3xl font-light tracking-wider text-white sm:text-4xl">
        問題が発生しました
      </h1>
      <p className="mx-auto mt-6 max-w-md font-serif text-base leading-relaxed text-gray-400">
        ページの表示中にエラーが発生しました。時間をおいて再度お試しください。
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-blue-400 px-10 py-4 font-serif text-blue-300 transition-colors duration-300 hover:border-blue-300 hover:text-blue-200"
        >
          再読み込み
        </button>
        <Link
          href="/services"
          className="rounded-full border border-white/20 px-10 py-4 font-serif text-gray-300 no-underline transition-colors duration-300 hover:border-white/40 hover:text-white"
        >
          サービス紹介へ
        </Link>
      </div>
    </main>
  );
}
