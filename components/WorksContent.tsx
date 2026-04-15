'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function WorksContent() {
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

  const projects = [
    {
      id: 1,
      title: "AIアドバイザーツール",
      category: "AI Product",
      status: "Completed",
      tech: "Next.js / Supabase",
      challenge: "複雑なUI要件とリアルタイムデータ処理が必要なAIアドバイザーツールの開発。従来の開発手法では工期が長く、コストも高くなる傾向がありました。",
      solution: "最新のAIスタックを活用し、コンポーネントベースの高速構築を実現。Next.jsとSupabaseの組み合わせで、バックエンド開発を大幅に短縮し、フロントエンドの複雑なUIも迅速に実装。",
      result: "開発期間：通常の1/3、コスト：相場の半額程度で実現。リアルタイム処理と複雑なUIを両立した高品質な製品を短期間で納品。",
      imagePlaceholder: "AIアドバイザーツール"
    },
    {
      id: 2,
      title: "Scopa",
      category: "OS Application",
      status: "In Development",
      tech: "Next.js / TypeScript",
      challenge: "構造的思考をサポートするOS的アプリの開発。従来のノートアプリやタスク管理ツールとは異なる、思考の構造化を促進する新しいパラダイムが必要。",
      solution: "最新のAIスタックを活用したアジャイル開発手法でプロトタイプから実装まで迅速に進行。ユーザーの思考プロセスを可視化・構造化する独自のアルゴリズムとUI設計を実装。",
      result: "現在開発中。プロトタイプ段階で高いユーザー満足度を獲得。2026年リリース予定。",
      imagePlaceholder: "Scopa"
    }
  ];

  const conceptWorks = [
    {
      id: 1,
      title: "Identity Design",
      category: "Branding",
      status: "Concept",
      tech: "Psychology / Design",
      challenge: "ブランドの本質的な価値を視覚的に表現する必要がある。従来のデザイン手法では、表面的なアイデンティティに留まりがち。",
      solution: "心理学の知見を活用し、ターゲットの無意識的な価値観と感情に響くロゴ・ブランディングを構築。科学的なアプローチでブランドの本質を抽出。",
      result: "ブランド認知度と感情的な愛着を同時に向上。ターゲットの深層心理に響く、記憶に残るアイデンティティを確立。",
      image: "/image_4.png",
      alt: "Identity Design - 心理学的知見を用いたロゴ・ブランディング"
    },
    {
      id: 2,
      title: "Platform UI/UX",
      category: "Product Design",
      status: "Concept",
      tech: "UX Research / Prototyping",
      challenge: "高機能なダッシュボードでありながら、情報過負荷を避け、直感的な操作性を維持する必要がある。",
      solution: "ミニマルなデザイン原則とユーザー行動分析を組み合わせ、情報の階層構造を最適化。必要な情報を適切なタイミングで提示するインタラクション設計。",
      result: "機能性と直感性を両立したダッシュボードを実現。ユーザーの学習コストを大幅に削減し、操作効率を向上。",
      image: "/image_6.png",
      alt: "Platform UI/UX - 高機能かつミニマルなダッシュボード設計"
    },
    {
      id: 3,
      title: "Marketing Web",
      category: "Web Design",
      status: "Concept",
      tech: "Psychology / Copywriting",
      challenge: "単なる情報提供ではなく、訪問者の感情を動かし、行動へと導くLPの制作が必要。",
      solution: "心理学の感情導線理論を応用し、訪問者の認知プロセスに沿ったコンテンツ構造とタイポグラフィを設計。無意識のレベルで共感を生むストーリーテリング。",
      result: "コンバージョン率の大幅な向上。訪問者の感情に寄り添い、自然な流れで行動へと誘導する効果的なLPを構築。",
      image: "/image_8.png",
      alt: "Marketing Web - 感情の導線を設計したLP制作"
    }
  ];

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

      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            WORKS
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
        </motion.div>

        {/* PROJECTS Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '160px' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: '#93c5fd', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.1em' }}>
            PROJECTS
          </h3>
          {projects.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              style={{ marginBottom: index < projects.length - 1 ? '160px' : '0' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '64px', alignItems: 'center' }}>
                {/* Image Placeholder */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: index * 0.2 + 0.2, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-100px" }}
                  style={{
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ textAlign: 'center', color: '#60a5fa' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>□</div>
                    <p style={{ fontSize: '14px', letterSpacing: '0.1em', fontFamily: 'serif' }}>{work.imagePlaceholder}</p>
                  </div>
                </motion.div>

                {/* Content */}
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {work.category}
                      </span>
                      <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {work.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif', lineHeight: 1.3 }}>
                      {work.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em', fontFamily: 'serif' }}>
                      {work.tech}
                    </p>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      背景・課題
                    </h4>
                    <p style={{ color: '#d1d5db', lineHeight: 2, fontSize: '16px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                      {work.challenge}
                    </p>
                  </div>

                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      解決策
                    </h4>
                    <p style={{ color: '#d1d5db', lineHeight: 2, fontSize: '16px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                      {work.solution}
                    </p>
                  </div>

                  <div style={{ padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08))', backdropFilter: 'blur(10px)' }}>
                    <h4 style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      結果
                    </h4>
                    <p style={{ color: '#d1d5db', lineHeight: 2, fontSize: '16px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                      {work.result}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CONCEPT WORKS Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '120px' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: '#93c5fd', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.1em' }}>
            CONCEPT WORKS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
            {conceptWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                style={{ padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
              >
                {/* Image */}
                <motion.div
                  style={{
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '32px'
                  }}
                >
                  <img
                    src={work.image}
                    alt={work.alt}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </motion.div>

                {/* Content */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      {work.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {work.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 300, color: 'white', marginBottom: '12px', fontFamily: 'serif', lineHeight: 1.3 }}>
                    {work.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em', fontFamily: 'serif' }}>
                    {work.tech}
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    背景・課題
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.9, fontSize: '14px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                    {work.challenge}
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    解決策
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.9, fontSize: '14px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                    {work.solution}
                  </p>
                </div>

                <div style={{ padding: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08))' }}>
                  <h4 style={{ fontSize: '12px', color: '#93c5fd', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    結果
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.9, fontSize: '14px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                    {work.result}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* GoDD Footer */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', paddingTop: '64px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          <p style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em', fontFamily: 'serif' }}>
            Technology powered by{' '}
            <a
              href="https://www.getgodd.dev/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid rgba(96, 165, 250, 0.3)' }}
            >
              GoDD
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
