'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Contact() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.3 + 0.05
    }));
    setStars(newStars);

    const interval = setInterval(() => {
      setStars(prevStars => prevStars.map(star => {
        const newX = star.x + (Math.random() - 0.5) * 0.1;
        return {
          ...star,
          y: star.y - star.speed < 0 ? 100 : star.y - star.speed,
          x: newX < 0 ? 100 : (newX > 100 ? 0 : newX)
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const contactMethods = [
    {
      label: "Email",
      value: "hello@shape-d.com",
      href: "mailto:hello@shape-d.com"
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
    <section style={{ position: 'relative', padding: '96px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'white',
              borderRadius: '50%',
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.3)`
            }}
          />
        ))}
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px' }}>
            お問い合わせ
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 1, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: '#93c5fd', marginBottom: '24px' }}>
              お気軽にご連絡ください
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
              新しい価値を共に形作るパートナーを探しています。
            </p>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
              技術的な相談から、まだ言葉にならないビジョンの共有まで、お気軽にご連絡ください。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.href}
                initial={{ opacity: 1, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '4px' }}>{method.label}</p>
                  <p style={{ color: 'white' }}>
                    {method.value}
                  </p>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          style={{ marginTop: '64px', textAlign: 'center' }}
        >
          <div style={{ padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '16px' }}>
              共に未来を形作りませんか
            </h3>
            <p style={{ color: '#d1d5db', marginBottom: '24px' }}>
              あなたのビジョンと私の技術が融合し、新しい価値を生み出す瞬間を待っています。
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 32px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
            >
              お問い合わせ
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
