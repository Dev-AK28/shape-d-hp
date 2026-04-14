'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PhilosophyContent() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.4 + 0.05
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

  const acronym = [
    {
      letter: "S",
      title: "SELF-CONGRUENCE",
      subtitle: "自己一致",
      description: "心理学で学んだ人間理解の深淵。内なる声と外なる行動が響き合う瞬間を、言葉にする。",
      detail: "心理学専攻で学士号を取得した経験から、人間の心の奥底にあるものを理解する力を養いました。自己一致とは、内なる価値観と外なる行動が一致する状態。AIエンジニアとしての技術力と、心理学の人間理解が融合し、真の自己表現を支援する。",
      color: "#60a5fa"
    },
    {
      letter: "H",
      title: "HUMAN EXPRESSION",
      subtitle: "人間的表現",
      description: "効率化の果てに、なお残る人間固有の輝き。それを形にする。",
      detail: "AIが代替不可能な、あなただけの「輪郭」を。効率化が進む現代において、なお残る人間社会の価値と豊かさを再定義する。技術はあくまで手段であり、その先にある人間的な表現こそが、真の価値を生み出す。",
      color: "#93c5fd"
    },
    {
      letter: "A",
      title: "AUTHENTIC",
      subtitle: "本来性",
      description: "他者の期待に応えるのではなく、本来の自分を生きる。",
      detail: "自己表現力向上事業の立ち上げを試みた経験から、多くの人が他者の期待に応える生き方をしていることを痛感しました。本来の自分を生きる、そのための表現力を引き出す。それが、AIエンジニアとしての私のミッション。",
      color: "#a78bfa"
    },
    {
      letter: "P",
      title: "PROMOTION",
      subtitle: "促進・繋がりを広げる",
      description: "自己表現が、他者との繋がりを生み、世界を広げる。",
      detail: "自己表現は、単なる自己満足ではありません。それは他者との繋がりを生み、世界を広げるきっかけとなります。AIを活用した自己表現支援を通じて、より多くの人が本来の自分を表現し、豊かな繋がりを築ける社会を目指します。",
      color: "#60a5fa"
    },
    {
      letter: "E",
      title: "EXPRESSION DEVELOPMENT",
      subtitle: "表現の育成",
      description: "表現力は、育つもの。技術と心で、その成長を支える。",
      detail: "心理学の専門的知見と、エンジニアリングの技術力。この二つが融合し、表現力の育成を支援します。AIツールの提供だけでなく、個人の表現力を引き出すコーチングも行います。技術と心で、表現の成長を支える。",
      color: "#93c5fd"
    },
    {
      letter: "D",
      title: "Development / Depth / Discovery / Design / Diversity / Direction",
      subtitle: "多様なDの意味",
      description: "開発、深さ、発見、設計、多様性、方向性。全てが自己一致へと繋がる。",
      detail: "Development（開発）、Depth（深さ）、Discovery（発見）、Design（設計）、Diversity（多様性）、Direction（方向性）。これら全てのDが、自己一致へと繋がる。エンジニアリングの技術で具現化し、心理学の人間理解で深さを加える。それが、SHAPE∞Dの哲学。",
      color: "#a78bfa"
    }
  ];

  return (
    <section style={{ position: 'relative', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
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

      {/* Nebula effects */}
      <div style={{
        position: 'fixed',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
        filter: 'blur(200px)',
        left: '10%',
        top: '20%',
        animation: 'nebula1 40s infinite ease-in-out'
      }} />
      <div style={{
        position: 'fixed',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 60%)',
        filter: 'blur(150px)',
        right: '10%',
        bottom: '20%',
        animation: 'nebula2 35s infinite ease-in-out'
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {acronym.map((item, index) => (
          <div
            key={item.letter}
            style={{ minHeight: '100vh', padding: '120px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                viewport={{ once: true, margin: "-200px" }}
                style={{ textAlign: 'center', marginBottom: '80px' }}
              >
                <motion.div
                  style={{
                    fontSize: 'clamp(200px, 25vw, 400px)',
                    fontWeight: 200,
                    color: item.color,
                    fontFamily: 'serif',
                    lineHeight: 0.8,
                    textShadow: '0 0 100px rgba(96, 165, 250, 0.5)',
                    marginBottom: '40px'
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {item.letter}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true, margin: "-200px" }}
                style={{ textAlign: 'center', marginBottom: '64px' }}
              >
                <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif', letterSpacing: '0.1em' }}>
                  {item.title}
                </h2>
                <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#93c5fd', letterSpacing: '0.2em' }}>
                  {item.subtitle}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                viewport={{ once: true, margin: "-200px" }}
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', marginBottom: '64px' }}
              >
                <p style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#d1d5db', lineHeight: 2, fontFamily: 'serif', fontWeight: 300 }}>
                  {item.description}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
                viewport={{ once: true, margin: "-200px" }}
                style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
              >
                <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: '#9ca3af', lineHeight: 2.5, fontFamily: 'serif' }}>
                  {item.detail}
                </p>
              </motion.div>
            </div>
          </div>
        ))}

        {/* Final Section */}
        <div style={{ minHeight: '100vh', padding: '120px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-200px" }}
            style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}
          >
            <motion.h1
              style={{
                fontSize: 'clamp(48px, 6vw, 72px)',
                fontWeight: 200,
                color: 'white',
                fontFamily: 'serif',
                lineHeight: 1.4,
                marginBottom: '64px'
              }}
              animate={{
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              心理学とエンジニアリングの融合が<br />
              自己一致への道を照らす
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              viewport={{ once: true, margin: "-200px" }}
              style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#9ca3af', lineHeight: 2, fontFamily: 'serif', marginBottom: '64px' }}
            >
              人間を深く理解し、技術で具現化する。<br />
              それが、SHAPE∞Dの哲学。
            </motion.p>
            <motion.a
              href="/"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-200px" }}
              whileHover={{ scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'inline-block', padding: '16px 48px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
            >
              トップに戻る
            </motion.a>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes nebula1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(150px, -100px) scale(1.2); }
        }
        @keyframes nebula2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-120px, 80px) scale(1.3); }
        }
      `}</style>
    </section>
  );
}
