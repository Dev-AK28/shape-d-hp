'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function About() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }, (_, i) => ({
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

  const career = [
    "心理学専攻で学士号を取得。学術的な人間理解の素地を築く。",
    "コカコーラボトラーズジャパンベンディングに入社。",
    "SNS起業で独立し、売上数百万円を達成。",
    "自己表現力向上事業の立ち上げを試み。",
    "現在はAIエンジニアとしての活動に注力。"
  ];

  return (
    <section style={{ position: 'relative', padding: '200px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
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

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-200px" }}
          style={{ marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(48px, 6vw, 64px)', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            ABOUT
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)' }}></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-200px" }}
          style={{ marginBottom: '80px' }}
        >
          <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: '#93c5fd', marginBottom: '48px', fontFamily: 'serif' }}>
            Kota Akashi
          </h3>
          <p style={{ fontSize: '18px', color: '#d1d5db', lineHeight: 1.8, marginBottom: '24px', fontFamily: 'serif' }}>
            事業家 / 表現者 / 心理学士
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-200px" }}
        >
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '16px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
              経歴
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {career.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-200px" }}
                  style={{ marginBottom: '24px', paddingLeft: '24px', position: 'relative', color: '#d1d5db', fontSize: '16px', lineHeight: 1.8 }}
                >
                  <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>—</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-200px" }}
            style={{ marginBottom: '80px', padding: '64px', border: '2px solid rgba(96, 165, 250, 0.3)', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(96, 165, 250, 0.02) 100%)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)' }} />
            <p style={{ color: '#60a5fa', lineHeight: 2.4, fontSize: '18px', fontFamily: 'serif', letterSpacing: '0.05em', fontWeight: 400, textAlign: 'center', textShadow: '0 0 30px rgba(96, 165, 250, 0.2)' }}>
              技術（AI）による圧倒的な<span style={{ fontWeight: 600, fontSize: '20px' }}>『速度』</span>と、心理学による深い<span style={{ fontWeight: 600, fontSize: '20px' }}>『人間理解』</span>。この両極端な手段を指揮し、事業の本質を形にする<span style={{ fontWeight: 600, fontSize: '20px' }}>『環境』</span>を創り出すことが、私の表現です。
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)' }} />
          </motion.div>

          <div style={{ padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
            <p style={{ fontSize: '16px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px' }}>
              ストーリー
            </p>
            <p style={{ color: '#d1d5db', lineHeight: 2, fontSize: '16px', fontFamily: 'serif' }}>
              心理学で学んだ人間理解の深淵と、エンジニアリングで身につけた具現化の技術。この二つが融合し、自己表現を支援するという使命に至る。効率化が進む現代において、なお残る人間固有の価値を形にする。それが、私のビジョン。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
