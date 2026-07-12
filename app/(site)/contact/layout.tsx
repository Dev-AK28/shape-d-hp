import type { Metadata } from 'next';

/**
 * `app/(site)/contact/page.tsx` is a Client Component ('use client', フォーム状態管理のため)
 * のため、`metadata` export はここ（同階層の Server Component layout）に配置する — Issue #395。
 * `generateMetadata`/`metadata` は Server Component からのみ export 可能なため。
 */
const TITLE = 'お問い合わせ — SHAPE∞Dへのご相談はこちら | SHAPE∞D';
const DESCRIPTION =
  'AIエンジニアリングや自己一致コンサルティングに関するご相談・お見積もりは、こちらのフォームからお気軽にお問い合わせください。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/contact',
    siteName: 'SHAPE∞D',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
