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

  const works = [
    {
      id: 1,
      title: "AIアドバイザーツール",
      category: "AI Product",
      status: "Completed",
      tech: "Next.js / Supabase",
      challenge: "複雑なUI要件とリアルタイムデータ処理が必要なAIアドバイザーツールの開発。従来の開発手法では工期が長く、コストも高くなる傾向がありました。",
      solution: "GoDDの開発手法を活用し、コンポーネントベースの高速構築を実現。Next.jsとSupabaseの組み合わせで、バックエンド開発を大幅に短縮し、フロントエンドの複雑なUIも迅速に実装。",
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
      solution: "GoDDのアジャイル開発手法でプロトタイプから実装まで迅速に進行。ユーザーの思考プロセスを可視化・構造化する独自のアルゴリズムとUI設計を実装。",
      result: "現在開発中。プロトタイプ段階で高いユーザー満足度を獲得。2026年リリース予定。",
      imagePlaceholder: "Scopa"
    },
    {
      id: 3,
      title: "SaaSプラットフォーム",
      category: "Platform",
      status: "Completed",
      tech: "Next.js / PostgreSQL",
      challenge: "複数のテナント対応、高度な権限管理、リアルタイムデータ同期が必要なSaaSプラットフォームの開発。セキュリティ要件も厳格。",
      solution: "GoDDのモジュラー開発手法で、各機能を独立して開発・統合。セキュリティ要件を満たす堅牢なアーキテクチャを短期間で構築。",
      result: "開発期間：通常の1/2、コスト：相場の40%程度で実現。複数テナント対応と高度な権限管理を備えたセキュアなプラットフォームを納品。",
      imagePlaceholder: "SaaSプラットフォーム"
    },
    {
      id: 4,
      title: "社内業務システムDX",
      category: "DX Solution",
      status: "Completed",
      tech: "React / Node.js",
      challenge: "レガシーシステムからの移換と業務フローの完全デジタル化。既存データの移行と社員のトレーニングも必要。",
      solution: "GoDDの段階的移行手法で、業務停止を最小限に抑えつつスムーズな移行を実現。直感的なUI設計で社員のトレーニング時間を大幅短縮。",
      result: "移換期間：通常の1/2、業務効率：約3倍向上。レガシーシステムからの完全移行と業務フローのデジタル化を成功。",
      imagePlaceholder: "社内業務システムDX"
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

        {works.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ marginBottom: index < works.length - 1 ? '200px' : '0' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
              {/* Image Placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: index * 0.2 + 0.2, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                style={{
                  aspectRatio: '16/10',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ textAlign: 'center', color: '#60a5fa' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>○</div>
                  <p style={{ fontSize: '16px', letterSpacing: '0.1em' }}>{work.imagePlaceholder}</p>
                </div>
              </motion.div>

              {/* Content */}
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                      {work.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {work.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
                    {work.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                    {work.tech}
                  </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    背景・課題
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: '16px' }}>
                    {work.challenge}
                  </p>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    解決策（GoDD）
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: '16px' }}>
                    {work.solution}
                  </p>
                </div>

                <div style={{ padding: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', backdropFilter: 'blur(10px)' }}>
                  <h4 style={{ fontSize: '16px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    結果
                  </h4>
                  <p style={{ color: '#d1d5db', lineHeight: 1.8, fontSize: '16px', fontFamily: 'serif' }}>
                    {work.result}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
