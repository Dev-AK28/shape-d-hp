'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DevelopmentContent() {
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

  const steps = [
    {
      id: 1,
      title: "要件定義",
      subtitle: "Requirements Definition",
      description: "明確な要件定義と技術選定。",
      detail: "プロジェクトの目標と範囲を明確に定義し、最適な技術スタックを選定します。ビジネス要件を技術仕様に落とし込み、開発の方向性を確立します。技術的観点から実現可能性を検証し、リスクを早期に特定します。",
      duration: "1〜2週間",
      output: "要件定義書・技術仕様書"
    },
    {
      id: 2,
      title: "AI指揮による爆速試作",
      subtitle: "AI-Powered Rapid Prototyping",
      description: "最新AIを指揮し、数日〜数週間でメイン機能を実装。",
      detail: "GoDD（God-like Development）の手法を用い、AIを効果的に活用して開発を加速します。従来の開発プロセスでは数ヶ月かかる機能も、最適な技術選定とアーキテクチャ設計により、数週間で実装可能です。AIアシストによりコード品質を維持しつつ、開発速度を最大化します。",
      duration: "2〜4週間",
      output: "動作するプロトタイプ・MVP"
    },
    {
      id: 3,
      title: "品質担保",
      subtitle: "Quality Assurance",
      description: "厳格なテストとコードレビュー。",
      detail: "「早い＝雑」という懸念は不要です。品質管理とコードレビューを厳格に行い、堅牢で保守性の高いコードを実現します。自動テスト、手動テスト、コードレビューを通じて品質を担保します。パフォーマンス最適化とセキュリティ対策も同時に実施します。",
      duration: "1〜2週間",
      output: "品質担保されたコード・テストレポート"
    },
    {
      id: 4,
      title: "実装・公開",
      subtitle: "Implementation & Launch",
      description: "Vercel/Supabase等による堅牢な公開。",
      detail: "最新のクラウドインフラを活用し、安全かつスケーラブルな環境で製品を公開します。Vercelによる高速なデプロイメント、Supabaseによる堅牢なデータベース管理、セキュリティ対策を万全に行い、安心して運用できる環境を構築します。継続的なモニタリングと保守サポートも提供します。",
      duration: "1週間",
      output: "公開・運用開始・保守サポート"
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            Development Process
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
          <p style={{ color: '#9ca3af', marginTop: '32px', maxWidth: '48rem', margin: '32px auto 0', lineHeight: 1.8, fontSize: '16px', fontFamily: 'serif' }}>
            技術者としての高い視座から、AIスタックを指揮したプロフェッショナルな開発プロセス
          </p>
        </motion.div>

        <div style={{ marginBottom: '120px' }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              style={{ marginBottom: index < steps.length - 1 ? '100px' : '0' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'start' }}>
                {/* Step Number */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: index * 0.15 + 0.1, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-100px" }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '2px solid rgba(96, 165, 250, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    fontWeight: 300,
                    color: '#60a5fa',
                    fontFamily: 'serif',
                    background: 'rgba(96, 165, 250, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '120px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '2px',
                      height: '100px',
                      background: 'linear-gradient(to bottom, rgba(96, 165, 250, 0.4), transparent)'
                    }} />
                  )}
                </motion.div>

                {/* Step Content */}
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {step.subtitle}
                    </h4>
                    <h3 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif', lineHeight: 1.3 }}>
                      {step.title}
                    </h3>
                  </div>

                  <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: 2, marginBottom: '24px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                    {step.description}
                  </p>

                  <div style={{ padding: '32px', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.05)', backdropFilter: 'blur(10px)', marginBottom: '24px' }}>
                    <p style={{ color: '#9ca3af', lineHeight: 2, fontSize: '15px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                      {step.detail}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '32px', fontSize: '14px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>所要時間: </span>
                      <span style={{ color: '#d1d5db', marginLeft: '8px' }}>{step.duration}</span>
                    </div>
                    <div>
                      <span style={{ color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>成果物: </span>
                      <span style={{ color: '#d1d5db', marginLeft: '8px' }}>{step.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'center', padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(96, 165, 250, 0.1), rgba(96, 165, 250, 0.2))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            「早い＝雑」ではありません
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', maxWidth: '48rem', margin: '0 auto', lineHeight: 2, marginBottom: '32px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
            GoDDの手法は、AIを効果的に活用しつつ、厳格な品質管理とコードレビューを行います。スピードと品質の両立を可能にする、論理的で丁寧な開発プロセスです。
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 48px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
          >
            <img
              src="/image_13.png"
              alt="Logo"
              style={{ width: '16px', height: 'auto' }}
            />
            爆速でプロトタイプを試す（初回相談）
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
