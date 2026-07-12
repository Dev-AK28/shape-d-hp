'use client';

import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { useStaticReveal } from '@/lib/hooks/useStaticReveal';
import { useFocusRestore } from '@/lib/hooks/useFocusRestore';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import { ANIMATION_DURATION } from '@/lib/scroll/animation-tokens';
import Link from 'next/link';

const MotionLink = motion.create(Link);

const processCardLinkClass =
  'inline-block px-12 py-4 rounded-full bg-transparent cursor-pointer text-base font-serif no-underline';

const developmentCardClass =
  'rounded-xl border border-[color:color-mix(in_srgb,var(--section-blue)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--section-blue)_5%,transparent)] p-16 backdrop-blur-[10px]';

const consultingCardClass =
  'rounded-xl border border-[color:color-mix(in_srgb,var(--section-purple)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--section-purple)_5%,transparent)] p-16 backdrop-blur-[10px]';

export default function ProcessNavigation() {
  const { reduceMotion, staticReveal } = useStaticReveal();
  const focusGuardRef = useFocusRestore<HTMLDivElement>(staticReveal);

  return (
    <PageHeader
      title="PROCESS"
      subtitle="開発とコンサルティング、それぞれのプロフェッショナルなプロセス"
      starBackground
      className="pb-32"
    >
      <div
        ref={focusGuardRef}
        className="mx-auto mt-[120px] grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-16"
      >
        <motion.div
          key={staticReveal ? 'static-dev' : 'reveal-dev'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.2 })}
          whileHover={reduceMotion ? undefined : { y: -12, transition: { duration: ANIMATION_DURATION.cardHover } }}
          className={developmentCardClass}
        >
          <h2 className="mb-6 font-serif text-[32px] font-light text-[color:var(--section-blue)]">
            Development Process
          </h2>
          <p className="mb-8 font-serif text-base leading-8 tracking-[0.02em] text-gray-300">
            AIスタックを指揮した「要件定義→プロトタイプ→品質担保→実装」の4ステップ。技術者としての高い視座から、プロフェッショナルな開発プロセスを提供します。
          </p>
          <MotionLink
            href="/process/development"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className={`${processCardLinkClass} border border-[color:var(--section-blue)] text-[color:var(--section-blue)]`}
          >
            詳細を見る
          </MotionLink>
        </motion.div>

        <motion.div
          key={staticReveal ? 'static-cons' : 'reveal-cons'}
          {...getScrollRevealProps(reduceMotion, { staticReveal, delay: 0.4 })}
          whileHover={reduceMotion ? undefined : { y: -12, transition: { duration: ANIMATION_DURATION.cardHover } }}
          className={consultingCardClass}
        >
          <h2 className="mb-6 font-serif text-[32px] font-light text-[color:var(--section-purple)]">
            Consulting Process
          </h2>
          <p className="mb-8 font-serif text-base leading-8 tracking-[0.02em] text-gray-300">
            「自覚→言語化→表現」の3ステップによるスキル習得。AI時代に代替不可能な『個』の価値を最大化し、自己一致した生き方を支援します。
          </p>
          <MotionLink
            href="/process/consulting"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className={`${processCardLinkClass} border border-[color:var(--section-purple)] text-[color:var(--section-purple)]`}
          >
            詳細を見る
          </MotionLink>
        </motion.div>
      </div>
    </PageHeader>
  );
}
