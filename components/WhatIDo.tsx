'use client';

import { motion, useReducedMotion } from 'framer-motion';
import StarBackground from '@/components/StarBackground';

export default function WhatIDo() {
  const reduceMotion = useReducedMotion();
  const services = [
    {
      title: "AIプロダクト開発・AI活用支援",
      description: "AI技術を活用したプロダクト開発および既存業務へのAI導入支援。機械学習モデルの統合から自然言語処理、データ分析まで、ビジネス課題に合わせた最適なAIソリューションを提供します。"
    },
    {
      title: "自己表現コーチング・相談（個人・有料）",
      description: "心理学の専門的知見と実践的経験に基づき、自己表現力の向上を支援。個人のキャリア構築からビジネスにおけるコミュニケーション改善まで、あなた本来の表現力を引き出します。"
    }
  ];

  const goddAreas = [
    "SaaSプラットフォーム",
    "社内業務システムDX",
    "ECサイト",
    "モバイルアプリ+API",
    "AIチャットボット・RAG",
    "IoTダッシュボード",
    "ゲーム開発",
    "レガシーモダナイゼーション"
  ];

  return (
    <section style={{ position: 'relative', padding: '160px 24px', background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)' }}>
      <StarBackground config={{ count: 100 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, ease: 'easeOut' }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'right', marginBottom: '120px' }}
        >
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 300, color: 'white', marginBottom: '16px', fontFamily: 'serif' }}>
            コア・バリュー
          </h2>
          <div style={{ width: '96px', height: '1px', background: 'linear-gradient(to right, transparent, #60a5fa, transparent)', marginLeft: 'auto' }}></div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '48px', marginBottom: '120px' }}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : index * 0.15, ease: 'easeOut' }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.3 } }}
              style={{ padding: '40px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
            >
              <h3 style={{ fontSize: '22px', fontWeight: 300, color: 'white', marginBottom: '20px', fontFamily: 'serif' }}>
                {service.title}
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, fontSize: '16px' }}>
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 0.3, ease: 'easeOut' }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: 'left' }}
        >
          <h3 style={{ fontSize: '28px', fontWeight: 300, color: '#93c5fd', marginBottom: '48px', fontFamily: 'serif' }}>
            GoDDによる開発可能領域
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {goddAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.4 + index * 0.05, ease: 'easeOut' }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={reduceMotion ? undefined : { scale: 1.05, borderColor: 'rgba(96, 165, 250, 0.8)', transition: { duration: 0.3 } }}
                style={{ padding: '24px 32px', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <span style={{ color: '#93c5fd', fontSize: '16px', fontWeight: 300 }}>{area}</span>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.8, ease: 'easeOut' }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ color: '#d1d5db', fontSize: '16px', maxWidth: '48rem', marginTop: '48px', lineHeight: 1.8, fontFamily: 'serif' }}
          >
            <strong style={{ color: '#93c5fd' }}>メリット:</strong> 安全性を兼ね備えた、相場の半額程度の費用での爆速開発。
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
