import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ padding: '64px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', marginBottom: '48px' }}>
          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/services" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Services
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/works" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Works
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Process
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/about" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  About
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              Process
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process/development" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Development
                </Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link href="/process/consulting" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  Consulting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px', fontFamily: 'serif' }}>
              Technology
            </h4>
            <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
              Powered by{' '}
              <a
                href="https://www.getgodd.dev/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid rgba(96, 165, 250, 0.3)' }}
              >
                GoDD
              </a>
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
