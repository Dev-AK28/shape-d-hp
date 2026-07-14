'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

/** 4 サービスパネル — 参照HTML L697-L720 */
const PANELS = [
  {
    num: '01',
    title: '基幹システム開発',
    en: 'CORE SYSTEM DEVELOPMENT',
    desc: '「こんなサービスができたら」を、事業の主軸となるシステムに。要件定義の前、構想の言語化から伴走します。ノウハウはこちらが持ちます。あなたは、想いを持ってきてください。',
  },
  {
    num: '02',
    title: 'HP・Webサイト制作',
    en: 'WEB & BRAND EXPRESSION',
    desc: 'サイトは名刺ではなく、営業と採用の最前線です。ブランドの色、こだわり、空気感まで実装し、「なんとなく良い」ではなく「この会社に頼みたい」と思われる状態をつくります。',
  },
  {
    num: '03',
    title: 'AI活用・業務効率化',
    en: 'AI-POWERED EFFICIENCY',
    desc: '繰り返し作業に、経営者やエースの時間が溶けていないでしょうか。AIで日々の業務を軽くし、その時間を「その会社にしかできない仕事」へ返します。効率化は目的ではなく、創造のための余白づくりです。',
  },
  {
    num: '04',
    title: '継続開発・伴走',
    en: 'GROW TOGETHER',
    desc: '納品して終わりの関係は、つくりません。事業が変われば、あるべきかたちも変わる。リリース後も改善を重ね、システムを事業と一緒に育てていきます。',
  },
] as const;

/**
 * サービスセクション #services — Issue #308（参照HTML L326-L389, L694-L725, L938-L960）
 *
 * セクションを pin し、scrub で 01→04 のパネルを順次クロスフェード。プログレスドットが
 * 現在パネルに同期。pinType='transform'（#307 と同理由）。トゥイーンは全て duration 明示。
 * reduced-motion 時は useGsapContext が setup を実行せず、CSS フォールバックで 4 パネルを
 * 縦積み（各 min-height 100svh、#425: iOS URL バー伸縮対策）表示する。
 */
export default function TopServices() {
  useGsapContext(() => {
    const { services } = topHero;
    const panels = gsap.utils.toArray<HTMLElement>('#services .svc-panel');
    const dots = gsap.utils.toArray<HTMLElement>('#services .svc-dot');
    if (panels.length === 0) {
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#services',
        start: services.pin.start,
        end: `+=${panels.length * services.panelStepPercent}%`,
        pin: true,
        pinType: services.pin.pinType,
        scrub: services.pin.scrub,
        onUpdate: (self) => {
          const active = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
          dots.forEach((dot, k) => dot.classList.toggle('on', k === active));
        },
      },
    });

    panels.forEach((panel, i) => {
      if (i === 0) {
        tl.to(panel, { autoAlpha: 1, duration: services.firstRevealDuration }, 0);
      } else {
        tl.to(
          panels[i - 1],
          { autoAlpha: 0, y: services.fadeOutY, duration: services.transitionDuration },
          i,
        ).fromTo(
          panel,
          { autoAlpha: 0, y: services.fadeInYFrom },
          { autoAlpha: 1, y: 0, duration: services.transitionDuration },
          i + services.fadeInOffset,
        );
      }
      if (i === panels.length - 1) {
        tl.to({}, { duration: services.tailDuration });
      }
    });
  });

  return (
    <section id="services">
      <div className="svc-stage">
        {PANELS.map((panel) => (
          <div key={panel.num} className="svc-panel">
            <div className="svc-num" aria-hidden="true">
              {panel.num}
            </div>
            <h3 className="svc-title">{panel.title}</h3>
            <p className="svc-en">{panel.en}</p>
            <p className="svc-desc">{panel.desc}</p>
          </div>
        ))}
        <div className="svc-progress" aria-hidden="true">
          {PANELS.map((panel, i) => (
            <span key={panel.num} className={`svc-dot${i === 0 ? ' on' : ''}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
