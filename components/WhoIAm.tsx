'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function WhoIAm() {
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
            自己紹介
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
            <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 300, color: '#93c5fd', marginBottom: '24px', fontFamily: 'serif' }}>
              あかし / Kota Akashi
            </h3>
            <p style={{ color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px', fontFamily: 'serif' }}>
              AIエンジニア / 事業家
            </p>
            <p style={{ color: '#9ca3af', lineHeight: 1.6, marginBottom: '24px' }}>
              心理学専攻で学士号を取得。学術的な人間理解の素地を持ち、コカコーラボトラーズジャパンベンディングに入社。その後、SNS起業で独立し、売上数百万円を達成。自己表現力向上事業の立ち上げを試み、現在はAIエンジニアとしての活動に注力している。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 300, color: '#93c5fd', marginBottom: '12px', fontFamily: 'serif' }}>Career Path</h4>
              <ul style={{ color: '#9ca3af', lineHeight: 1.6, listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '12px' }}>心理学専攻で学士号を取得</li>
                <li style={{ marginBottom: '12px' }}>コカコーラボトラーズジャパンベンディング入社</li>
                <li style={{ marginBottom: '12px' }}>SNS起業で独立、売上数百万円を達成</li>
                <li style={{ marginBottom: '12px' }}>自己表現力向上事業を個人事業として立ち上げ</li>
                <li>AIエンジニアとしての活動を開始</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
