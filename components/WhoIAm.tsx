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
    <section style={{ position: 'relative', padding: '160px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'left', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            自己紹介
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)' }}></div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 300, color: '#93c5fd', marginBottom: '32px', fontFamily: 'serif' }}>
              あかし / Kota Akashi
            </h3>
            <p style={{ color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px', fontFamily: 'serif', fontSize: '18px' }}>
              AIエンジニア / 事業家
            </p>
            <p style={{ color: '#9ca3af', lineHeight: 1.6, marginBottom: '24px', fontSize: '16px' }}>
              心理学専攻で学士号を取得。学術的な人間理解の素地を持ち、コカコーラボトラーズジャパンベンディングに入社。その後、SNS起業で独立し、売上数百万円を達成。自己表現力向上事業の立ち上げを試み、現在はAIエンジニアとしての活動に注力している。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
          >
            <div style={{ padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 300, color: '#93c5fd', marginBottom: '20px', fontFamily: 'serif' }}>Career Path</h4>
              <ul style={{ color: '#9ca3af', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0, fontSize: '16px' }}>
                <li style={{ marginBottom: '16px', paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                  心理学専攻で学士号を取得
                </li>
                <li style={{ marginBottom: '16px', paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                  コカコーラボトラーズジャパンベンディング入社
                </li>
                <li style={{ marginBottom: '16px', paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                  SNS起業で独立、売上数百万円を達成
                </li>
                <li style={{ marginBottom: '16px', paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                  自己表現力向上事業の立ち上げを試み
                </li>
                <li style={{ paddingLeft: '20px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                  AIエンジニアとしての活動を開始
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
