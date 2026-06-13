'use client';

import { motion } from 'framer-motion';
import StarBackground from '@/components/StarBackground';
import { PUBLIC_CONTACT_EMAIL } from '@/lib/contact/constants';

export default function Contact() {
  const contactMethods = [
    {
      label: "Email",
      value: PUBLIC_CONTACT_EMAIL,
      href: `mailto:${PUBLIC_CONTACT_EMAIL}`
    },
    {
      label: "Message",
      value: "Let's connect",
      href: "#"
    },
    {
      label: "LinkedIn",
      value: "/in/shape-d",
      href: "#"
    },
    {
      label: "GitHub",
      value: "@shape-d",
      href: "#"
    }
  ];

  return (
    <section style={{ position: 'relative', padding: '160px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <StarBackground config={{ count: 100 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'left', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            お問い合わせ
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)' }}></div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center', marginBottom: '120px' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: '#93c5fd', marginBottom: '32px', fontFamily: 'serif' }}>
              お気軽にご連絡ください
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '18px', lineHeight: 1.8, marginBottom: '32px', fontFamily: 'serif' }}>
              新しい価値を共に形作るパートナーを探しています。
            </p>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: '16px' }}>
              技術的な相談から、まだ言葉にならないビジョンの共有まで、お気軽にご連絡ください。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.href}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -8, borderColor: 'rgba(96, 165, 250, 0.8)', transition: { duration: 0.3 } }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{method.label}</p>
                  <p style={{ color: 'white', fontSize: '18px', fontFamily: 'serif' }}>
                    {method.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '32px', fontFamily: 'serif' }}>
              共に未来を形作りませんか
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '18px', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.8, marginBottom: '32px', fontFamily: 'serif' }}>
              あなたのビジョンと私の技術が融合し、新しい価値を生み出す瞬間を待っています。
            </p>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '16px 48px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif' }}
            >
              対話を始める（無料）
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
