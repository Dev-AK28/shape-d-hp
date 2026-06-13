import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ padding: '64px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link href="/">
            <img
              src="/image_13.png"
              alt="SHAPE∞D Logo"
              style={{
                height: '40px',
                width: 'auto',
                maxWidth: '180px',
                objectFit: 'contain',
                opacity: 0.8
              }}
            />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              ナビゲーション
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/services" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  サービス <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>| SERVICES</span>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/works" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  実績 <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>| WORKS</span>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  プロセス <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>| PROCESS</span>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/about" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  プロフィール <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>| ABOUT</span>
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  お問い合わせ <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>| CONTACT</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              プロセス
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process/development" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em', lineHeight: 1.6 }}>
                  システム開発プロセス
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process/consulting" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em', lineHeight: 1.6 }}>
                  自己表現力向上プロセス
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              テクノロジー
            </h4>
            <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
              AIによる超速開発（<a
                href="https://www.getgodd.dev/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid rgba(96, 165, 250, 0.3)' }}
              >
                GoDD
              </a>）
            </p>
          </div>
        </div>

        <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af', fontFamily: 'serif', letterSpacing: '0.02em' }}>
            © 2026 Kota Akashi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
