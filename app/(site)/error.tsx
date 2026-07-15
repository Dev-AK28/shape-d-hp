'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import SectionShell from '@/components/ui/SectionShell';

/**
 * Error boundary for the (site) route group (/contact, /philosophy,
 * /process, /services, /works) — Issue #458.
 *
 * Next.js requires error.tsx to be a Client Component. It replaces only the
 * page content on error; app/(site)/layout.tsx (Navigation/Footer) stays
 * mounted around it, so no need to render them here.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error in (site) route group', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-black">
      <SectionShell
        padding="lg"
        className="flex min-h-[70svh] flex-col items-center justify-center text-center"
      >
        <h1 className="font-serif text-3xl font-light tracking-wider text-white sm:text-4xl">
          問題が発生しました
        </h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-base leading-relaxed text-gray-400">
          ページの表示中にエラーが発生しました。時間をおいて再度お試しいただくか、
          解決しない場合はお問い合わせください。
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
            href="/"
            className="rounded-full border border-white/20 px-10 py-4 font-serif text-gray-300 no-underline transition-colors duration-300 hover:border-white/40 hover:text-white"
          >
            トップページへ戻る
          </Link>
        </div>
      </SectionShell>
    </main>
  );
}
