'use client';

import dynamic from 'next/dynamic';

const PageLoader = dynamic(() => import('@/components/scroll/PageLoader'), {
  ssr: false,
});

export default function DeferredPageLoader() {
  return <PageLoader />;
}
