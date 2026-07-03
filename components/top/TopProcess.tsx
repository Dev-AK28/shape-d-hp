'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

/** 4 ステップ — 参照HTML L732-L751 */
const STEPS = [
  { num: '01 — LISTEN', title: '聴く', desc: '専門用語は要りません。事業への想い、こだわり、理想の姿を、そのままの言葉で聴かせてください。' },
  { num: '02 — TRANSLATE', title: '翻訳する', desc: '聴いた想いを、要件・設計・デザインに翻訳します。「何をつくるべきか」が曖昧なまま、開発は始めません。' },
  { num: '03 — BUILD', title: 'かたちにする', desc: 'AIを活用した開発で、速度と品質を両立。進捗は常に見える状態で進め、途中の軌道修正も歓迎します。' },
  { num: '04 — GROW', title: '育てる', desc: 'リリースは始まりです。数字と現場の声を見ながら、事業の成長に合わせて改善を続けます。' },
] as const;

/**
 * プロセスセクション #process — Issue #309（参照HTML L391-L433, L727-L754, L962-L968）
 *
 * 縦タイムライン 4 ステップが各 step を個別トリガー（top 82%）に、時差（delay i×0.12）で
 * y+20→0 フェードイン。reduced-motion 時は useGsapContext が setup を実行せず、
 * globals.css の `.top-scope` フォールバックで全ステップが即時表示される。
 */
export default function TopProcess() {
  useGsapContext(() => {
    // `process` は Node グローバルと衝突するため step 設定のみ取り出す
    const step = topHero.process.step;
    gsap.utils.toArray<HTMLElement>('#process .step').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: step.duration,
        ease: step.ease,
        delay: i * step.staggerDelay,
        scrollTrigger: { trigger: el, start: step.start },
      });
    });
  });

  return (
    <section id="process">
      <div className="stage">
        <p className="eyebrow">
          <em>PROCESS</em>つくり方
        </p>
        <div className="steps">
          {STEPS.map((step) => (
            <div key={step.num} className="step">
              <span className="step-num">{step.num}</span>
              <span className="step-title">{step.title}</span>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
