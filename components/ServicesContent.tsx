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

  const digitalServices = [
    {
      id: 1,
      title: "AIプロダクト開発",
      category: "Digital Solution",
      description: "着想を、鮮度を保ったまま形にする。最新のAIスタックを指揮し、事業の核を最短距離でプロダクトへと昇華させます。",
      benefit: "着想の鮮度を保ち、市場投入のリードタイムを短縮",
      connection: "技術の余白に、創造性を。",
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
      processUrl: "/process",
      isCoaching: false
    },
    {
      id: 2,
      title: "業務自動化・DX支援",
      category: "Digital Solution",
      description: "思考のノイズを削ぎ落とし、本来の創造性に没頭できる環境を構築。ルーティンをAIに委ね、淀みのないワークフローを実現します。",
      benefit: "創造的業務への集中時間を最大化",
      connection: "技術の余白に、創造性を。",
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
      processUrl: "/process",
      isCoaching: false
    },
    {
      id: 3,
      title: "Webアプリ・モバイルアプリ開発",
      category: "Digital Solution",
      description: "最新のAI活用手法による圧倒的な納期短縮。モダンな技術スタックを使用したWebアプリおよびモバイルアプリの開発。",
      benefit: "ユーザー体験の最適化とスケーラビリティの確保",
      connection: "技術の余白に、創造性を。",
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
      processUrl: "/process",
      isCoaching: false
    }
  ];

  const humanServices = [
    {
      id: 4,
      title: "自己表現コーチング",
      category: "Human Solution",
      description: "AI時代に代替不可能な『個』の価値を最大化。心理学士の視点から、自覚・言語化・表現の3スキルを習得し、自己一致した生き方を支援します。",
      benefit: "個の資本化と自己一致した生き方の実現",
      connection: "内なる価値観と言語化の技術を融合し、本来の創造性を解放する。",
      features: [
        "本音の自覚力の習得",
        "適切な言語化力の構築",
        "相手に伝える表現力の向上",
        "ビジネスコミュニケーション改善",
        "体系的スキル習得"
      ],
      price: "初回無料相談",
      processUrl: "/process",
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

        {/* Digital Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '160px' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#60a5fa', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            Digital Solution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
            {digitalServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: index * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                style={{ padding: '48px', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.05)', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', color: '#60a5fa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {service.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
                  {service.title}
                </h3>
                <p style={{ color: '#d1d5db', lineHeight: 2, marginBottom: '24px', fontSize: '16px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  {service.description}
                </p>
                <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(96, 165, 250, 0.08)', borderRadius: '6px', border: '1px solid rgba(96, 165, 250, 0.15)' }}>
                  <p style={{ color: '#60a5fa', lineHeight: 1.6, fontSize: '14px', fontFamily: 'serif', fontWeight: 300, letterSpacing: '0.05em' }}>
                    {service.benefit}
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
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                      料金: <span style={{ color: '#93c5fd', fontFamily: 'serif' }}>{service.price}</span>
                    </span>
                  </div>
                  <motion.a
                    href={service.processUrl}
                    whileHover={{ scale: 1.05, borderColor: '#93c5fa' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'inline-block', padding: '10px 24px', border: '1px solid rgba(96, 165, 250, 0.4)', borderRadius: '9999px', color: '#60a5fa', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontFamily: 'serif', textDecoration: 'none' }}
                  >
                    Process Details
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Human Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginBottom: '120px' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#a78bfa', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.05em' }}>
            Human Solution
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px' }}>
            {humanServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                style={{ padding: '48px', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.05)', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '12px', color: '#a78bfa', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {service.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
                  {service.title}
                </h3>
                <p style={{ color: '#d1d5db', lineHeight: 2, marginBottom: '24px', fontSize: '16px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
                  {service.description}
                </p>
                <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(167, 139, 250, 0.08)', borderRadius: '6px', border: '1px solid rgba(167, 139, 250, 0.15)' }}>
                  <p style={{ color: '#a78bfa', lineHeight: 1.6, fontSize: '14px', fontFamily: 'serif', fontWeight: 300, letterSpacing: '0.05em' }}>
                    {service.benefit}
                  </p>
                </div>
                <div style={{ marginBottom: '32px' }}>
                  <h4 style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    提供内容
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {service.features.map((feature, idx) => (
                      <li key={idx} style={{ marginBottom: '12px', paddingLeft: '20px', position: 'relative', color: '#d1d5db', fontSize: '15px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#a78bfa' }}>›</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                      料金: <span style={{ color: '#93c5fd', fontFamily: 'serif' }}>{service.price}</span>
                    </span>
                  </div>
                  <motion.a
                    href={service.processUrl}
                    whileHover={{ scale: 1.05, borderColor: '#c4b5fd' }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'inline-block', padding: '10px 24px', border: '1px solid rgba(167, 139, 250, 0.4)', borderRadius: '9999px', color: '#a78bfa', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontFamily: 'serif', textDecoration: 'none' }}
                  >
                    Process Details
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ marginTop: '120px', textAlign: 'center', padding: '64px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'linear-gradient(to right, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1))', backdropFilter: 'blur(10px)' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: 'white', marginBottom: '24px', fontFamily: 'serif' }}>
            お見積り・ご相談
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '16px', maxWidth: '48rem', margin: '0 auto', lineHeight: 2, marginBottom: '32px', fontFamily: 'serif', letterSpacing: '0.02em' }}>
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
