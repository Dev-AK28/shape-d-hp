'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Vision() {
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

  const visionPoints = [
    {
      title: "S",
      description: "SELF-CONGRUENCE（自己一致）"
    },
    {
      title: "H",
      description: "HUMAN EXPRESSION（人間的表現）"
    },
    {
      title: "A",
      description: "AUTHENTIC（本来性）"
    },
    {
      title: "P",
      description: "PROMOTION（促進・繋がりを広げる）"
    },
    {
      title: "E",
      description: "EXPRESSION DEVELOPMENT（表現の育成）"
    },
    {
      title: "D",
      description: "Development / Depth / Discovery / Design / Diversity / Direction"
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
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            理念
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: '#93c5fd', marginBottom: '32px', fontFamily: 'serif' }}>
            SHAPE∞D（シェイプディー）
          </h3>
          <p style={{ fontSize: '16px', color: '#d1d5db', maxWidth: '64rem', margin: '0 auto', lineHeight: 1.6, fontFamily: 'serif' }}>
            事務的表記：SHAPE-D
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '64px' }}>
          {visionPoints.map((point, index) => (
            <motion.div
              initial={{ opacity: 1, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
            >
              <div>
                <h4 style={{ fontSize: '20px', fontWeight: 300, color: 'white', marginBottom: '12px' }}>{point.title}</h4>
                <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 1, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            開発中プロジェクト
          </h3>
          <p style={{ fontSize: '20px', color: '#93c5fd', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6, marginBottom: '16px', fontFamily: 'serif' }}>
            Scopa
          </p>
          <p style={{ fontSize: '16px', color: '#d1d5db', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6 }}>
            構造的思考OSアプリ／日本語対応
          </p>
        </motion.div>
      </div>
    </section>
  );
}
