'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ServicesContent() {
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

  const services = [
    {
      id: 1,
      title: "AIプロダクト開発",
      category: "Development",
      description: "最新のAI活用手法による圧倒的な納期短縮。機械学習、自然言語処理、データ分析を活用したAIソリューションの開発。",
      connection: "AIで効率化し、本来の創造に集中する環境を作る。",
      features: [
        "機械学習モデルの統合",
        "自然言語処理（NLP）",
        "データ分析・可視化",
        "AIチャットボット・RAG",
        "予測モデル・推薦システム"
      ],
      tool: "GoDD",
      toolUrl: "https://www.getgodd.dev/",
      price: "個別見積もり",
      isCoaching: false
    },
    {
      id: 2,
      title: "業務自動化・DX支援",
      category: "Automation",
      description: "最新のAI活用手法による圧倒的な納期短縮。既存業務プロセスの自動化とデジタルトランスフォーメーション。",
      connection: "AIで効率化し、本来の創造に集中する環境を作る。",
      features: [
        "社内業務システムDX",
        "SaaSプラットフォーム開発",
        "API連携・データ連携",
        "ワークフロー自動化",
        "レガシーモダナイゼーション"
      ],
      tool: "GoDD",
      toolUrl: "https://www.getgodd.dev/",
      price: "個別見積もり",
      isCoaching: false
    },
    {
      id: 3,
      title: "Webアプリ・モバイルアプリ開発",
      category: "Application",
      description: "最新のAI活用手法による圧倒的な納期短縮。モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。",
      connection: "AIで効率化し、本来の創造に集中する環境を作る。",
      features: [
        "React/Next.js開発",
        "モバイルアプリ+API",
        "ECサイト構築",
        "IoTダッシュボード",
        "ゲーム開発"
      ],
      tool: "GoDD",
      toolUrl: "https://www.getgodd.dev/",
      price: "個別見積もり",
      isCoaching: false
    },
    {
      id: 4,
      title: "自己表現コーチング",
      category: "Consulting",
      description: "自己表現力を「本音の自覚力・適切な言語化力・相手に伝える表現力」の3要素を磨くスキル習得プログラム。心理学の専門的知見に基づき、体系的なスキル構築を支援します。",
      connection: "内なる価値観と言語化の技術を融合し、本来の創造性を解放する。",
      features: [
        "本音の自覚力の習得",
        "適切な言語化力の構築",
        "相手に伝える表現力の向上",
        "ビジネスコミュニケーション改善",
        "体系的スキル習得"
      ],
      price: "初回無料相談",
      isCoaching: true
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
            商品・サービス
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', margin: '0 auto' }}></div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: index * 0.2, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              style={{ padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {service.category}
                </span>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
                {service.title}
              </h3>
              <p style={{ color: '#d1d5db', lineHeight: 1.8, marginBottom: '32px', fontSize: '16px', fontFamily: 'serif' }}>
                {service.description}
              </p>
              <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <p style={{ color: '#9ca3af', lineHeight: 1.6, fontSize: '14px', fontFamily: 'serif', fontStyle: 'italic' }}>
                  {service.connection}
                </p>
              </div>
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  提供内容
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {service.features.map((feature, idx) => (
                    <li key={idx} style={{ marginBottom: '12px', paddingLeft: '20px', position: 'relative', color: '#d1d5db', fontSize: '15px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#60a5fa' }}>›</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {service.tool && (
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '0.1em' }}>
                    活用ツール:{' '}
                    <a
                      href={service.toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid rgba(96, 165, 250, 0.3)' }}
                    >
                      {service.tool}
                    </a>
                  </span>
                </div>
              )}
              <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {service.isCoaching ? (
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.05, borderColor: '#93c5fa' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'inline-block', padding: '12px 32px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontFamily: 'serif', textDecoration: 'none' }}
                  >
                    無料で初回相談をする
                  </motion.a>
                ) : (
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                    料金: <span style={{ color: '#93c5fd', fontFamily: 'serif' }}>{service.price}</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginTop: '120px', textAlign: 'center', padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            お見積り・ご相談
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '18px', maxWidth: '48rem', margin: '0 auto', lineHeight: 1.8, marginBottom: '32px', fontFamily: 'serif' }}>
            プロジェクトの規模や要件に合わせて、最適なソリューションをご提案します。まずはお気軽にご相談ください。
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05, borderColor: '#93c5fa', transition: { duration: 0.3 } }}
            whileTap={{ scale: 0.95 }}
            style={{ display: 'inline-block', padding: '16px 48px', border: '1px solid #60a5fa', borderRadius: '9999px', color: '#93c5fd', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontFamily: 'serif', textDecoration: 'none' }}
          >
            お問い合わせ
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
