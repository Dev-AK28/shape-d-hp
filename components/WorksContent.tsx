'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { colors, layout, spacing } from '@/lib/design/tokens';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { useFocusRestore } from '@/lib/hooks/useFocusRestore';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { OPTIMIZED_PUBLIC_IMAGES } from '@/lib/performance/image-assets';

export default function WorksContent() {
  const { reduceMotion, staticReveal, profile } = useStaticReveal();
  const focusGuardRef = useFocusRestore(staticReveal);
  const isTouchDevice = isTouchInputDevice(profile);
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
      imagePlaceholder: "AIアドバイザーツール",
      monogram: "AI"
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
      imagePlaceholder: "Scopa",
      monogram: "SC"
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
      image: OPTIMIZED_PUBLIC_IMAGES.works.identityDesign,
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
      image: OPTIMIZED_PUBLIC_IMAGES.works.platformUiUx,
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
      image: OPTIMIZED_PUBLIC_IMAGES.works.marketingWeb,
      alt: "Marketing Web - 感情の導線を設計したLP制作"
    }
  ];

  return (
    <section
      ref={focusGuardRef}
      style={{
        position: 'relative',
        padding: `${spacing.xxl}px var(--space-3) ${spacing.section}px`,
        background: colors.background,
      }}
    >
      <div style={{ maxWidth: layout.contentWide, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* PROJECTS Section */}
        <motion.div
          key={staticReveal ? 'static-projects' : 'reveal-projects'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, isMobile: isTouchDevice })}
          style={{ marginBottom: '160px' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: '#93c5fd', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.1em' }}>
            PROJECTS
          </h3>
          {projects.map((work, index) => (
            <motion.div
              key={staticReveal ? `static-project-${work.id}` : `reveal-project-${work.id}`}
              {...getScrollRevealProps(reduceMotion, { staticReveal, staggerIndex: index, staggerStep: 0.2, isMobile: isTouchDevice })}
              style={{ marginBottom: index < projects.length - 1 ? '160px' : '0' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '64px', alignItems: 'center' }}>
                {/* Image Placeholder */}
                <motion.div
                  {...getScrollRevealProps(reduceMotion, {
                    staticReveal,
                    variant: 'scale',
                    staggerIndex: index,
                    staggerStep: 0.2,
                    delay: 0.2,
                    isMobile: isTouchDevice,
                  })}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.07) 1px, transparent 0)',
                      backgroundSize: `${spacing.md}px ${spacing.md}px`,
                    }}
                  />
                  <div style={{ position: 'relative', textAlign: 'center', color: '#60a5fa' }}>
                    <div
                      style={{
                        width: `${spacing.xxl}px`,
                        height: `${spacing.xxl}px`,
                        margin: `0 auto ${spacing.sm}px`,
                        borderRadius: '50%',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: 300,
                        fontFamily: 'serif',
                        letterSpacing: '0.05em',
                        color: '#93c5fd',
                      }}
                    >
                      {work.monogram}
                    </div>
                    <p style={{ fontSize: '14px', letterSpacing: '0.1em', fontFamily: 'serif', color: '#9ca3af' }}>{work.imagePlaceholder}</p>
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
          key={staticReveal ? 'static-concept' : 'reveal-concept'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.4, isMobile: isTouchDevice })}
          style={{ marginBottom: '120px' }}
        >
          <h3 style={{ fontSize: '24px', fontWeight: 300, color: '#93c5fd', marginBottom: '64px', fontFamily: 'serif', letterSpacing: '0.1em' }}>
            CONCEPT WORKS
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', gap: '48px' }}>
            {conceptWorks.map((work, index) => (
              <motion.div
                key={staticReveal ? `static-concept-${work.id}` : `reveal-concept-${work.id}`}
                {...getScrollRevealProps(reduceMotion, {
                  staticReveal,
                  delay: 0.5,
                  staggerIndex: index,
                  staggerStep: 'card',
                  isMobile: isTouchDevice,
                })}
                style={{ padding: '48px', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}
              >
                {/* Image */}
                <motion.div
                  className="relative mb-8 overflow-hidden rounded-lg border border-white/10"
                  style={{
                    aspectRatio: '16/10',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
                  }}
                >
                  <Image
                    src={work.image}
                    alt={work.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
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
          key={staticReveal ? 'static-footer' : 'reveal-footer'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.8, isMobile: isTouchDevice })}
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
