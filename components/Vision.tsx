'use client';

import { motion } from 'framer-motion';
import StarBackground from '@/components/StarBackground';

export default function Vision() {
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
    <section style={{ position: 'relative', padding: '160px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <StarBackground config={{ count: 100 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            理念
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: '#93c5fd', marginBottom: '32px', fontFamily: 'serif' }}>
            SHAPE∞D（シェイプディー）
          </h3>
          <p style={{ fontSize: '16px', color: '#d1d5db', maxWidth: '64rem', margin: '0 auto', lineHeight: 1.6, fontFamily: 'serif' }}>
            事務的表記：SHAPE-D
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '120px' }}>
          {visionPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
            >
              <div style={{ fontSize: '48px', fontWeight: 300, color: '#60a5fa', fontFamily: 'serif', lineHeight: 1 }}>
                {point.title}
              </div>
              <div>
                <p style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: '16px' }}>
                  {point.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            開発中プロジェクト
          </h3>
          <p style={{ fontSize: '24px', color: '#93c5fd', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6, marginBottom: '16px', fontFamily: 'serif' }}>
            Scopa
          </p>
          <p style={{ fontSize: '16px', color: '#d1d5db', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6, fontFamily: 'serif' }}>
            構造的思考OSアプリ／日本語対応
          </p>
        </motion.div>
      </div>
    </section>
  );
}
