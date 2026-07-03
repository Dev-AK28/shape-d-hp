import Link from 'next/link';

/**
 * CTA セクション #cta — Issue #311（参照HTML L537-L583, L791-L803）
 *
 * 参照HTMLの `href="#"` は既存の問い合わせ導線 `/contact`（フォーム → /api/contact → Resend）
 * に接続する（2026-07-03 確定・新規実装なし）。ホバー演出は純 CSS（`.cta-button::after` の
 * rain 背景が左から scaleX で満ちる）。GSAP アニメーションはなし（参照HTMLの #cta も静的）。
 */
export default function TopCta() {
  return (
    <section id="cta">
      <div className="stage">
        <p className="eyebrow">
          <em>CONTACT</em>最初の一歩
        </p>
        <h2 className="cta-copy">
          構想の段階から、
          <br />
          話せます。
        </h2>
        <p className="cta-note">
          まだ要件になっていなくて構いません。
          <br />
          「こんなことができたら」の段階からが、いちばん良い仕事になります。
          <br />
          無料相談では、想いの言語化と、実現までの道筋の整理まで行います。売り込みはしません。
        </p>
        <Link className="cta-button" href="/contact">
          無料相談を申し込む
        </Link>
      </div>
    </section>
  );
}
