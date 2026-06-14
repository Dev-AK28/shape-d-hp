'use client';

import { motion, useReducedMotion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { getScrollRevealProps } from '@/lib/scroll/reveal-props';
import Link from 'next/link';

const MotionLink = motion.create(Link);

const processCardLinkClass =
  'inline-block px-12 py-4 rounded-full bg-transparent cursor-pointer text-base font-serif no-underline';

export default function ProcessNavigation() {
  const reduceMotion = useReducedMotion();

  return (
    <PageHeader
      title="PROCESS"
      subtitle="開発とコンサルティング、それぞれのプロフェッショナルなプロセス"
      starBackground
      className="pb-32"
    >
      <div
        className="mx-auto mt-[120px] grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(min(400px,100%),1fr))] gap-16"
      >
        <motion.div
          {...getScrollRevealProps(reduceMotion, { delay: 0.2 })}
          whileHover={reduceMotion ? undefined : { y: -12, transition: { duration: 0.3 } }}
          className="rounded-xl border border-blue-400/30 bg-blue-400/5 p-16 backdrop-blur-[10px]"
        >
          <h2 className="mb-6 font-serif text-[32px] font-light text-blue-400">
            Development Process
          </h2>
          <p className="mb-8 font-serif text-base leading-8 tracking-[0.02em] text-gray-300">
            AIスタックを指揮した「要件定義→プロトタイプ→品質担保→実装」の4ステップ。技術者としての高い視座から、プロフェッショナルな開発プロセスを提供します。
          </p>
          <MotionLink
            href="/process/development"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className={`${processCardLinkClass} border border-blue-400 text-blue-400`}
          >
            詳細を見る
          </MotionLink>
        </motion.div>

        <motion.div
          {...getScrollRevealProps(reduceMotion, { delay: 0.4 })}
          whileHover={reduceMotion ? undefined : { y: -12, transition: { duration: 0.3 } }}
          className="rounded-xl border border-violet-400/30 bg-violet-400/5 p-16 backdrop-blur-[10px]"
        >
          <h2 className="mb-6 font-serif text-[32px] font-light text-violet-400">
            Consulting Process
          </h2>
          <p className="mb-8 font-serif text-base leading-8 tracking-[0.02em] text-gray-300">
            「自覚→言語化→表現」の3ステップによるスキル習得。AI時代に代替不可能な『個』の価値を最大化し、自己一致した生き方を支援します。
          </p>
          <MotionLink
            href="/process/consulting"
            whileHover={reduceMotion ? undefined : { scale: 1.05 }}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className={`${processCardLinkClass} border border-violet-400 text-violet-400`}
          >
            詳細を見る
          </MotionLink>
        </motion.div>
      </div>
    </PageHeader>
  );
}
