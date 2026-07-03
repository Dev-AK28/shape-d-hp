'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

/** 課題 3 行（lead + 強調）— 参照HTML L663-L666 */
const PAIN_LINES = [
  { lead: '新しい事業の構想はある。でもノウハウがなく、', strong: '構想のまま、時間だけが過ぎていく。' },
  { lead: 'HPはある。でも自社の色は伝わらず、', strong: '結局、価格で比べられている。' },
  { lead: '一度は外注した。仕様どおりの「それらしいもの」は届いた。', strong: 'でも、想いは載っていなかった。' },
] as const;

/**
 * 課題提起セクション #pain — Issue #306（参照HTML L224-L251, L659-L670, L913-L923）
 *
 * 各 pain-line が自身をトリガーに（top 78%）独立してフェードイン（y+24→0）。
 * クローズは top 82% でフェードイン。reduced-motion 時は useGsapContext が setup を
 * 実行せず、globals.css の `.top-scope` フォールバックで全行が即時表示される。
 */
export default function TopPain() {
  useGsapContext(() => {
    const { pain } = topHero;
    gsap.utils.toArray<HTMLElement>('#pain .pain-line').forEach((line) => {
      gsap.to(line, {
        opacity: 1,
        y: 0,
        duration: pain.line.duration,
        ease: pain.line.ease,
        scrollTrigger: { trigger: line, start: pain.line.start },
      });
    });
    gsap.to('#pain .pain-close', {
      opacity: 1,
      duration: pain.close.duration,
      ease: pain.close.ease,
      scrollTrigger: { trigger: '#pain .pain-close', start: pain.close.start },
    });
  });

  return (
    <section id="pain">
      <div className="stage">
        <p className="eyebrow">
          <em>REALITY</em>こんな課題はありませんか
        </p>
        <div className="pain-lines">
          {PAIN_LINES.map((line) => (
            <p key={line.strong} className="pain-line">
              {line.lead}
              <strong>{line.strong}</strong>
            </p>
          ))}
        </div>
        <p className="pain-close">足りないのは技術ではなく、想いを翻訳する相手です。</p>
      </div>
    </section>
  );
}
