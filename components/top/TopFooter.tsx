import Link from 'next/link';

/** 下層ページ導線（#314 暫定方針 — フッター最終構成は #311 で確定） */
const FOOTER_LINKS = [
  { name: 'サービス', href: '/services' },
  { name: '実績', href: '/works' },
  { name: 'プロセス', href: '/process' },
  { name: '哲学', href: '/philosophy' },
  { name: 'お問い合わせ', href: '/contact' },
] as const;

/**
 * トップページ専用フッター — Issue #303（参照HTML L585-L598, L805-L808）
 */
export default function TopFooter() {
  return (
    <footer className="top-footer">
      <p className="top-footer-mark">
        SHAPE<span>∞</span>D
      </p>
      <ul className="top-footer-links">
        {FOOTER_LINKS.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>
      <p className="top-footer-copy">© 2026 Kota Akashi. All rights reserved.</p>
    </footer>
  );
}
