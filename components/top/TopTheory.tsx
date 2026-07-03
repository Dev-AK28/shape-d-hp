'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

const CIRCLES_ARIA = 'こうありたい姿といまの姿が、システムというかたちで重なっていく図';

/**
 * 自己一致セクション #theory — Issue #307（参照HTML L253-L324, L672-L692, L925-L936）
 *
 * セクションを pin した状態で scrub（end +=120%）により 2 円が中央へ移動して重なる。
 * 進行 0.72 で「一致」ラベルがフェードイン、円ボーダーが --rain 系に強調、円ラベルは減光。
 * pinType='transform': velocity-skew の transform 祖先下でも position:fixed 破綻を避ける。
 * reduced-motion 時は useGsapContext が setup を実行せず、CSS フォールバックで収束状態を静的表示。
 */
export default function TopTheory() {
  useGsapContext(() => {
    const { theory } = topHero;
    gsap
      .timeline({
        // 既定 duration を 0.5 に固定（グローバル 1.4 の影響を打ち消し、参照HTMLの尺比を再現）
        defaults: { duration: theory.tweenDuration },
        scrollTrigger: {
          trigger: '#theory',
          start: theory.pin.start,
          end: theory.pin.end,
          pin: true,
          pinType: theory.pin.pinType,
          scrub: theory.pin.scrub,
        },
      })
      .to('#c-ideal', { xPercent: theory.idealXPercent, ease: 'none' }, 0)
      .to('#c-real', { xPercent: theory.realXPercent, ease: 'none' }, 0)
      .to('#c-ideal, #c-real', { borderColor: theory.borderColor }, theory.borderAt)
      .to('#c-label', { opacity: 1 }, theory.labelAt)
      .to('#c-ideal, #c-real', { color: theory.dimColor }, theory.dimAt);
  });

  return (
    <section id="theory">
      <div className="theory-stage">
        <p className="eyebrow">
          <em>APPROACH</em>差別化の核
        </p>
        <h2 className="theory-title">自己一致 &times; AIエンジニアリング</h2>
        <div className="circles" role="img" aria-label={CIRCLES_ARIA}>
          <div className="circle ideal" id="c-ideal">
            こうありたい姿
          </div>
          <div className="circle real" id="c-real">
            いまの姿
          </div>
          <span className="congruence-label" id="c-label" aria-hidden="true">
            <b>一致</b>
            <small>SYSTEM AS SELF-EXPRESSION</small>
          </span>
        </div>
        <p className="theory-desc">
          心理学者カール・ロジャーズは、「ありたい自分」と「いまの自分」の重なりを
          <strong>自己一致</strong>と呼びました。
          一致している人の言葉が自然と伝わるように、
          <strong>一致している会社は、説明しなくても選ばれます。</strong>
          SHAPE∞Dは、会社の「こうありたい」と「いまの姿」のギャップを、
          AIエンジニアリングの力でシステムというかたちに体現する — 選ばれる理由を、実装します。
        </p>
      </div>
    </section>
  );
}
