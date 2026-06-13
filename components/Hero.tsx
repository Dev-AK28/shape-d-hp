'use client';

import { motion, useReducedMotion } from 'framer-motion';
import StarBackground from '@/components/StarBackground';

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <StarBackground config={{ count: 300, maxSize: 3.5, minOpacity: 0.2, maxOpacity: 1, maxSpeed: 0.6, minSpeed: 0.1, drift: 0.2, glowMultiplier: 2 }} />

      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
        filter: 'blur(150px)',
        left: '5%',
        top: '10%',
        animation: reduceMotion ? undefined : 'nebula1 30s infinite ease-in-out',
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 60%)',
        filter: 'blur(120px)',
        right: '10%',
        bottom: '15%',
        animation: reduceMotion ? undefined : 'nebula2 25s infinite ease-in-out',
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '120px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.5, ease: 'easeOut' }}
          style={{ marginBottom: '80px' }}
        >
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 300, letterSpacing: '0.1em', color: 'white' }}>
            SHAPE<span style={{ display: 'inline-block' }}>
              <motion.span
                style={{ display: 'inline-block', color: '#60a5fa' }}
                animate={
                  reduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                &infin;
              </motion.span>
            </span>D
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1vw, 16px)', color: '#9ca3af', letterSpacing: '0.2em', marginTop: '16px', fontWeight: 300 }}>
            SHAPE-D
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          style={{ textAlign: 'center', zIndex: 20, position: 'relative', maxWidth: '900px', margin: '0 auto' }}
        >
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontFamily: 'serif', color: 'white', marginBottom: '48px', lineHeight: 1.3, fontWeight: 300, letterSpacing: '0.05em' }}
          >
            AIで効率化し、本来の創造に集中する環境を作る。
          </motion.h1>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
            style={{ display: 'flex', justifyContent: 'center', gap: '64px', marginBottom: '64px', flexWrap: 'wrap' }}
          >
            {[
              { label: '爆速', sub: 'SPEED' },
              { label: '安全', sub: 'SAFE' },
              { label: '低コスト', sub: 'COST' },
            ].map((item) => (
              <div key={item.sub} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#60a5fa', fontFamily: 'serif', marginBottom: '8px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.9, ease: 'easeOut' }}
            style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#93c5fd', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.8, fontFamily: 'serif', fontWeight: 300, marginBottom: '48px', letterSpacing: '0.05em' }}
          >
            技術の余白に、創造性を。<br />
            AIを指揮し、本来の事業価値を形にする環境を創ります。
          </motion.p>

          <motion.a
            href="/contact"
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 1.0, ease: 'easeOut' }}
            whileHover={reduceMotion ? undefined : { scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            style={{ display: 'inline-block', padding: '20px 64px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '18px', fontFamily: 'serif', textDecoration: 'none' }}
          >
            お問い合わせ
          </motion.a>
        </motion.div>

        {!reduceMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: '48px', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '24px', height: '40px', border: '2px solid rgba(156, 163, 175, 0.5)', borderRadius: '9999px', display: 'flex', justifyContent: 'center' }}
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '4px', height: '12px', background: 'rgba(156, 163, 175, 0.5)', borderRadius: '9999px', marginTop: '8px' }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>

    </section>
  );
}
