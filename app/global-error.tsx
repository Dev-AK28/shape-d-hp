'use client';

import { useEffect } from 'react';

/**
 * Global error boundary — Issue #458.
 *
 * Only used when app/layout.tsx (the root layout) itself throws, which
 * global-error.tsx must handle by rendering its own <html>/<body> (Next.js
 * requirement) — it replaces the root layout entirely, so it deliberately
 * does not import globals.css, fonts, or any app component that could be
 * implicated in a root-layout-level failure. Inline styles only.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error in root layout', error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#f0f0f0',
          fontFamily: 'serif',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 300, letterSpacing: '0.05em' }}>
          問題が発生しました
        </h1>
        <p style={{ maxWidth: '32rem', color: '#9ca3af', lineHeight: 1.75 }}>
          時間をおいて再度お試しください。
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: '9999px',
            border: '1px solid #60a5fa',
            color: '#93c5fd',
            background: 'transparent',
            padding: '1rem 2.5rem',
            fontFamily: 'serif',
            cursor: 'pointer',
          }}
        >
          再読み込み
        </button>
      </body>
    </html>
  );
}
