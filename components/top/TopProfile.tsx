'use client';

import { useGsapContext } from '@/lib/hooks/useGsapContext';
import { gsap } from '@/lib/scroll/gsap-config';
import { topHero } from '@/lib/design/tokens';

/** 二つの思想カード — 参照HTML L768-L777 */
const THOUGHTS = [
  {
    id: 'th-psy',
    tag: '01 — PSYCHOLOGY',
    quote: ['人と会社は、同じ。', '本来の形に還るとき、いちばん強く語れる。'],
    desc: '心理学のアカデミックなバックグラウンドと、カール・ロジャーズの自己一致理論。「こうありたい姿」に一致した会社は、無理に売り込まなくても伝わり、選ばれる — この視点を、事業とシステムづくりに持ち込んでいます。',
  },
  {
    id: 'th-eng',
    tag: '02 — AI ENGINEERING',
    quote: ['AIで日々を軽くし、', '人は、本来の創造へ。'],
    desc: '技術は目的ではなく、想いを翻訳する手段。日々の業務に追われて本来やりたい創造に時間を使えない — その状態をAIエンジニアリングで解き、人が「その会社にしかできないこと」に集中できる環境をつくります。',
  },
] as const;

/**
 * Profile セクション #profile — Issue #310（参照HTML L435-L535, L756-L789, L970-L999）
 *
 * profile-head / 二つの思想カード（時差フェード）/ 収束 SVG（左右パスを scrub で描画、中央
 * ドット点灯）/ 理念（creed）を構成。reduced-motion 時は useGsapContext が setup を実行せず、
 * CSS フォールバックでカード・ドット・理念を即時表示（パスは dasharray 未設定のため全描画）。
 */
export default function TopProfile() {
  useGsapContext(() => {
    const p = topHero.profile;

    gsap.to('#profile .profile-head', {
      opacity: 1,
      y: 0,
      duration: p.head.duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#profile .profile-head', start: p.head.start },
    });

    gsap.utils.toArray<HTMLElement>('#profile .thought').forEach((thought, i) => {
      gsap.to(thought, {
        opacity: 1,
        y: 0,
        duration: p.thought.duration,
        ease: 'power2.out',
        delay: i * p.thought.staggerDelay,
        scrollTrigger: { trigger: '#profile .thoughts', start: p.thought.start },
      });
    });

    // 収束 SVG: 各パスを全長 dashoffset から 0 へ scrub 描画
    (['#profile #cv-l', '#profile #cv-r'] as const).forEach((sel) => {
      const path = document.querySelector<SVGPathElement>(sel);
      if (!path) {
        return;
      }
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#profile .converge',
          start: p.converge.start,
          end: p.converge.end,
          scrub: p.converge.scrub,
        },
      });
    });

    gsap.to('#profile #cv-dot', {
      opacity: 1,
      duration: p.dot.duration,
      scrollTrigger: { trigger: '#profile .converge', start: p.dot.start },
    });

    gsap.to('#profile .creed', {
      opacity: 1,
      y: 0,
      duration: p.creed.duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: '#profile .converge', start: p.creed.start },
    });
  });

  return (
    <section id="profile">
      <div className="stage">
        <p className="eyebrow">
          <em>PROFILE</em>代表者紹介
        </p>
        <div className="profile-head">
          <b>明石 康汰</b>
          <small>
            SHAPE∞D 代表 / エンジニア
            <br />
            <span>AutoDevJapan — BRM（ビジネスリレーションシップマネージャー）兼 CBO</span>
          </small>
        </div>
        <div className="thoughts">
          {THOUGHTS.map((thought) => (
            <div key={thought.id} className="thought" id={thought.id}>
              <span className="thought-tag">{thought.tag}</span>
              <p className="thought-quote">
                {thought.quote[0]}
                <br />
                {thought.quote[1]}
              </p>
              <p className="thought-desc">{thought.desc}</p>
            </div>
          ))}
        </div>
        <svg className="converge" viewBox="0 0 880 150" aria-hidden="true">
          <path id="cv-l" d="M 220 0 C 220 80, 440 60, 440 130" />
          <path id="cv-r" d="M 660 0 C 660 80, 440 60, 440 130" />
          <circle id="cv-dot" cx="440" cy="130" r="3" />
        </svg>
        <p className="creed">
          <small>二つの思想は、一つの理念へ</small>
          <b>商品・サービスは、自己表現のツールである。</b>
        </p>
      </div>
    </section>
  );
}
