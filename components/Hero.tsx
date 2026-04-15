'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 300 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.5 + 0.1
    }));
    setStars(newStars);

    // Animate stars
    const interval = setInterval(() => {
      setStars(prevStars => prevStars.map(star => {
        const newX = star.x + (Math.random() - 0.5) * 0.2;
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
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      {/* Stars */}
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
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)`
          }}
        />
      ))}

      {/* Nebula effect */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        filter: 'blur(150px)',
        left: '5%',
        top: '10%',
        animation: 'nebula1 30s infinite ease-in-out'
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 60%)',
        filter: 'blur(120px)',
        right: '10%',
        bottom: '15%',
        animation: 'nebula2 25s infinite ease-in-out'
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '120px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ marginBottom: '80px' }}
        >
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 300, letterSpacing: '0.1em', color: 'white' }}>
            SHAPE<span style={{ display: 'inline-block' }}>
              <motion.span
                style={{ display: 'inline-block', color: '#60a5fa' }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                &infin;
              </motion.span>
            </span>D
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1vw, 16px)', color: '#9ca3af', letterSpacing: '0.2em', marginTop: '16px', fontWeight: 300 }}>
            SHAPE-D
          </p>
        </motion.div>

        {/* Main copy */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          style={{ textAlign: 'center', zIndex: 20, position: 'relative', maxWidth: '900px', margin: '0 auto' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontFamily: 'serif', color: 'white', marginBottom: '48px', lineHeight: 1.3, fontWeight: 300, letterSpacing: '0.05em' }}
          >
            AIで効率化し、本来の創造に集中する環境を作る。
          </motion.h1>

          {/* Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
            style={{ display: 'flex', justifyContent: 'center', gap: '64px', marginBottom: '64px', flexWrap: 'wrap' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#60a5fa', fontFamily: 'serif', marginBottom: '8px' }}>
                爆速
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                SPEED
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#60a5fa', fontFamily: 'serif', marginBottom: '8px' }}>
                安全
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                SAFE
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#60a5fa', fontFamily: 'serif', marginBottom: '8px' }}>
                低コスト
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                COST
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#93c5fd', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.8, fontFamily: 'serif', fontWeight: 300, marginBottom: '48px', letterSpacing: '0.05em' }}
          >
            最新のAIスタックによる、安全かつ圧倒的な開発速度の実現。
          </motion.p>

          <motion.a
            href="/contact"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 1.0, ease: "easeOut" }}
            whileHover={{ scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-block', padding: '20px 64px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '18px', fontFamily: 'serif', textDecoration: 'none' }}
          >
            お問い合わせ
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
          style={{ position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)' }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '24px', height: '40px', border: '2px solid rgba(156, 163, 175, 0.5)', borderRadius: '9999px', display: 'flex', justifyContent: 'center' }}
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: '4px', height: '12px', background: 'rgba(156, 163, 175, 0.5)', borderRadius: '9999px', marginTop: '8px' }}
            />
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes nebula1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, -50px) scale(1.1); }
        }
        @keyframes nebula2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-80px, 60px) scale(1.15); }
        }
      `}</style>
    </section>
  );
}
