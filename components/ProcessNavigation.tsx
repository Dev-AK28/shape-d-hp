'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProcessNavigation() {
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
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            PROCESS
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
          <p style={{ color: '#9ca3af', marginTop: '32px', maxWidth: '48rem', margin: '32px auto 0', lineHeight: 1.8, fontSize: '16px', fontFamily: 'serif' }}>
            開発とコンサルティング、それぞれのプロフェッショナルなプロセス
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '64px', maxWidth: '900px', margin: '0 auto' }}>
          {/* Development Process Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            style={{ padding: '64px', border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.05)', backdropFilter: 'blur(10px)' }}
          >
            <h3 style={{ fontSize: '32px', fontWeight: 300, color: '#60a5fa', marginBottom: '24px', fontFamily: 'serif' }}>
              Development Process
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 2, marginBottom: '32px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
              AIスタックを指揮した「要件定義→プロトタイプ→品質担保→実装」の4ステップ。技術者としての高い視座から、プロフェッショナルな開発プロセスを提供します。
            </p>
            <Link href="/process/development">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: 'inline-block', padding: '16px 48px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#60a5fa', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
              >
                詳細を見る
              </motion.div>
            </Link>
          </motion.div>

          {/* Consulting Process Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            style={{ padding: '64px', border: '1px solid rgba(167, 139, 250, 0.3)', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.05)', backdropFilter: 'blur(10px)' }}
          >
            <h3 style={{ fontSize: '32px', fontWeight: 300, color: '#a78bfa', marginBottom: '24px', fontFamily: 'serif' }}>
              Consulting Process
            </h3>
            <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 2, marginBottom: '32px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
              「自覚→言語化→表現」の3ステップによるスキル習得。AI時代に代替不可能な『個』の価値を最大化し、自己一致した生き方を支援します。
            </p>
            <Link href="/process/consulting">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: 'inline-block', padding: '16px 48px', border: '1px solid #a78bfa', borderRadius: '9999px', color: '#a78bfa', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
              >
                詳細を見る
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
