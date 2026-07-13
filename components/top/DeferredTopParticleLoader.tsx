'use client';

import dynamic from 'next/dynamic';

// three.js を含むチャンクをトップページ表示時のみロードする — Issue #412（#402 バンドル配慮）
const TopParticleLoader = dynamic(() => import('@/components/top/TopParticleLoader'), {
  ssr: false,
});

export default function DeferredTopParticleLoader() {
  return <TopParticleLoader />;
}
