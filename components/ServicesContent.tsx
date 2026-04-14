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
      description: "機械学習、自然言語処理、データ分析を活用したAIソリューションの開発。ビジネス課題に合わせた最適なAI製品を設計・実装します。",
      features: [
        "機械学習モデルの統合",
        "自然言語処理（NLP）",
        "データ分析・可視化",
        "AIチャットボット・RAG",
        "予測モデル・推薦システム"
      ],
      price: "お見積り"
    },
    {
      id: 2,
      title: "業務自動化・DX支援",
      category: "Automation",
      description: "既存業務プロセスの自動化とデジタルトランスフォーメーション。効率化を実現し、人間本来の創造的な作業に集中できる環境を構築します。",
      features: [
        "社内業務システムDX",
        "SaaSプラットフォーム開発",
        "API連携・データ連携",
        "ワークフロー自動化",
        "レガシーモダナイゼーション"
      ],
      price: "お見積り"
    },
    {
      id: 3,
      title: "Webアプリ・モバイルアプリ開発",
      category: "Application",
      description: "モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。ユーザー体験を重視した直感的で美しい製品を作成します。",
      features: [
        "React/Next.js開発",
        "モバイルアプリ+API",
        "ECサイト構築",
        "IoTダッシュボード",
        "ゲーム開発"
      ],
      price: "お見積り"
    },
    {
      id: 4,
      title: "自己表現コーチング",
      category: "Consulting",
      description: "心理学の専門的知見と実践的経験に基づき、自己表現力の向上を支援。個人のキャリア構築からビジネスにおけるコミュニケーション改善まで、あなた本来の表現力を引き出します。",
      features: [
        "キャリア構築支援",
        "コミュニケーション改善",
        "自己表現力向上",
        "ビジネススキル習得",
        "メンタルヘルスケア"
      ],
      price: "個人・有料"
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              style={{ padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {service.category}
                </span>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
                {service.title}
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: '32px', fontSize: '16px' }}>
                {service.description}
              </p>
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
              <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                  料金: <span style={{ color: '#93c5fd', fontFamily: 'serif' }}>{service.price}</span>
                </span>
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
