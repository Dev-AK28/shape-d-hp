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
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '24px', maxWidth: '960px', margin: '0 auto' }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ marginBottom: '48px' }}
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
          initial={{ opacity: 1, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          style={{ textAlign: 'center', zIndex: 20, position: 'relative' }}
        >
          <motion.h1
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontFamily: 'serif', color: 'white', marginBottom: '24px', lineHeight: 1.2, fontWeight: 300, textShadow: '0 0 30px rgba(96, 165, 250, 0.3)' }}
          >
            AIに代替不可能な、あなただけの"輪郭"を。 
          </motion.h1>
          <motion.p
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#d1d5db', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.6, fontFamily: 'serif', fontWeight: 300 }}
          >
            効率化の果てに、なお残る人間社会の価値と豊かさを再定義する。
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}
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
