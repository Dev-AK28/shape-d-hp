'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { isTouchInputDevice } from '@/lib/performance/device-profile';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { useFocusRestore } from '@/lib/hooks/useFocusRestore';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';
import BrandLogo from '@/components/BrandLogo';

const MotionLink = m.create(Link);

export default function DevelopmentContent() {
  const { reduceMotion, staticReveal, profile } = useStaticReveal();
  const focusGuardRef = useFocusRestore(staticReveal);
  const isTouchDevice = isTouchInputDevice(profile);
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
    <>
      <PageHeader
        title="DEVELOPMENT"
        subtitle="技術者としての高い視座から、AIスタックを指揮したプロフェッショナルな開発プロセス"
        starBackground
        dividerVariant="blue"
        className="pb-16"
      />

      <section
        ref={focusGuardRef}
        className="relative px-6 pb-[160px] bg-[radial-gradient(ellipse_at_center,#0a0a1a_0%,#000000_100%)]"
      >
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="mb-[var(--space-section)]">
          {steps.map((step, index) => (
            <m.div
              key={staticReveal ? `static-step-${step.id}` : `reveal-step-${step.id}`}
              {...getScrollRevealProps(reduceMotion, { staticReveal, staggerIndex: index, staggerStep: 'card', isMobile: isTouchDevice })}
              className={index < steps.length - 1 ? 'mb-[100px]' : ''}
            >
              <div className="grid gap-16 items-start grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))]">
                {/* Step Number */}
                <m.div
                  {...getScrollRevealProps(reduceMotion, {
                    staticReveal,
                    variant: 'scale',
                    staggerIndex: index,
                    staggerStep: 'card',
                    delay: 0.1,
                    isMobile: isTouchDevice,
                  })}
                  className="relative flex flex-col items-center justify-center"
                >
                  <div className="w-[120px] h-[120px] rounded-full border-2 border-blue-400/40 flex items-center justify-center text-[48px] font-light text-[color:var(--section-blue)] type-font-serif bg-blue-400/10 backdrop-blur-[10px]">
                    {step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[2px] h-[100px] bg-[linear-gradient(to_bottom,rgba(96,165,250,0.4),transparent)]" />
                  )}
                </m.div>

                {/* Step Content */}
                <div>
                  <div className="mb-[var(--space-3)]">
                    <h2 className="text-[clamp(24px,3vw,32px)] font-light text-white mb-[var(--space-2)] type-font-serif leading-[1.3]">
                      {step.title}
                    </h2>
                    <h3 className="text-sm text-[color:var(--section-blue)] tracking-[0.15em] uppercase mb-[var(--space-1)]">
                      {step.subtitle}
                    </h3>
                  </div>

                  <p className="text-gray-300 text-base leading-[2] mb-[var(--space-3)] type-font-serif tracking-[0.02em]">
                    {step.description}
                  </p>

                  <div className="p-8 border border-blue-400/20 rounded-lg bg-blue-400/5 backdrop-blur-[10px] mb-[var(--space-3)]">
                    <p className="text-[color:var(--muted)] leading-[2] text-[15px] type-font-serif tracking-[0.02em]">
                      {step.detail}
                    </p>
                  </div>

                  <div className="flex gap-8 text-sm flex-wrap">
                    <div>
                      <span className="text-[color:var(--section-blue)] tracking-[0.1em] uppercase">所要時間: </span>
                      <span className="text-gray-300 ml-[var(--space-1)]">{step.duration}</span>
                    </div>
                    <div>
                      <span className="text-[color:var(--section-blue)] tracking-[0.1em] uppercase">成果物: </span>
                      <span className="text-gray-300 ml-[var(--space-1)]">{step.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <m.div
          key={staticReveal ? 'static-cta' : 'reveal-cta'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.8, isMobile: isTouchDevice })}
          className="text-center p-16 border border-white/10 rounded-lg bg-[linear-gradient(to_right,rgba(96,165,250,0.1),rgba(96,165,250,0.2))] backdrop-blur-[10px]"
        >
          <h2 className="text-[28px] font-light text-white mb-[var(--space-3)] type-font-serif">
            「早い＝雑」ではありません
          </h2>
          <p className="text-gray-300 text-base max-w-[48rem] mx-auto leading-[2] mb-[var(--space-4)] type-font-serif tracking-[0.02em]">
            GoDDの手法は、AIを効果的に活用しつつ、厳格な品質管理とコードレビューを行います。スピードと品質の両立を可能にする、論理的で丁寧な開発プロセスです。
          </p>
          <MotionLink
            href="/contact"
            whileHover={reduceMotion ? undefined : { scale: 1.05, borderColor: '#93c5fa', transition: { duration: ANIMATION_DURATION.cardHover } }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className="inline-flex items-center gap-2 px-12 py-4 border border-[color:var(--section-blue)] rounded-full text-[#93c5fd] bg-transparent cursor-pointer text-base type-font-serif no-underline"
          >
            <BrandLogo width={16} />
            爆速でプロトタイプを試す（初回相談）
          </MotionLink>
        </m.div>
        </div>
      </section>
    </>
  );
}
