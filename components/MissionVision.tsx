'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function MissionVision() {
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
            VISION
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
          <h3 style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 300, color: '#93c5fd', marginBottom: '48px', fontFamily: 'serif' }}>
            自己一致（SELF-CONGRUENCE）への道
          </h3>
          <p style={{ fontSize: '18px', color: '#d1d5db', lineHeight: 2, marginBottom: '48px', fontFamily: 'serif' }}>
            カール・ロジャースが提唱した「自己一致」理論。内なる価値観と外なる行動が一致する状態こそが、真の自己実現である。心理学で学んだこの概念が、エンジニアリングという具現化の技術と融合し、新たな価値を生み出す。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-200px" }}
          style={{ padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
        >
          <p style={{ fontSize: '16px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
            事業家としての信念
          </p>
          <p style={{ color: '#d1d5db', lineHeight: 2, fontSize: '18px', fontFamily: 'serif', marginBottom: '32px' }}>
            AIによる効率化は、人間本来の創造性を解放するための手段に過ぎない。技術が代替不可能な、あなただけの「輪郭」を形にする。それが、SHAPE∞Dの存在意義。
          </p>
          <p style={{ color: '#9ca3af', lineHeight: 2, fontSize: '16px', fontFamily: 'serif' }}>
            心理学の人間理解とエンジニアリングの具現化技術。この二つが融合し、自己表現を支援する。効率化の果てに、なお残る人間社会の価値と豊かさを再定義する。それが、私のビジョンであり、使命。
          </p>
        </motion.div>
      </div>
    </section>
  );
}
