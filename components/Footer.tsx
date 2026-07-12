import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 bg-[radial-gradient(ellipse_at_center,#0a0a1a_0%,#000000_100%)] px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 text-center">
          <Link href="/">
            <BrandLogo height={40} className="mx-auto opacity-80" />
          </Link>
        </div>

        <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-12">
          <div>
            <h4 className="mb-6 font-serif text-sm tracking-[0.15em] text-blue-400 uppercase">
              ナビゲーション
            </h4>
            <ul className="m-0 list-none p-0">
              {[
                { href: '/services', label: 'サービス', sub: 'SERVICES' },
                { href: '/works', label: '実績', sub: 'WORKS' },
                { href: '/process', label: 'プロセス', sub: 'PROCESS' },
                { href: '/philosophy', label: '哲学', sub: 'PHILOSOPHY' },
                { href: '/contact', label: 'お問い合わせ', sub: 'CONTACT' },
              ].map((item) => (
                <li key={item.href} className="mb-3">
                  <Link
                    href={item.href}
                    className="inline-block font-serif text-[15px] text-gray-300 no-underline"
                    data-micro-interaction="footer"
                  >
                    {item.label}{' '}
                    <span className="ml-1 text-xs text-gray-400">| {item.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-serif text-sm tracking-[0.15em] text-blue-400 uppercase">
              プロセス
            </h4>
            <ul className="m-0 list-none p-0">
              <li className="mb-3">
                <Link href="/process/development" className="inline-block font-serif text-[15px] leading-relaxed text-gray-300 no-underline" data-micro-interaction="footer">
                  システム開発プロセス
                </Link>
              </li>
              <li className="mb-3">
                <Link href="/process/consulting" className="inline-block font-serif text-[15px] leading-relaxed text-gray-300 no-underline" data-micro-interaction="footer">
                  自己表現力向上プロセス
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-serif text-sm tracking-[0.15em] text-blue-400 uppercase">
              テクノロジー
            </h4>
            <p className="font-serif text-[15px] leading-relaxed tracking-wide text-gray-300">
              AIによる超速開発（
              <a
                href="https://www.getgodd.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-b border-blue-400/30 text-blue-400 no-underline"
                data-micro-interaction="footer"
              >
                GoDD
              </a>
              ）
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="font-serif text-sm tracking-wide text-gray-400">
            © 2026 Kota Akashi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
