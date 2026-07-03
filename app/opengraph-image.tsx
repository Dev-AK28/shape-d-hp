import { ImageResponse } from 'next/og';

/**
 * トップページの OGP 画像 — Issue #313
 *
 * 参照デザインの配色（ink 背景 / moon 文字 / rain アクセント）で SHAPE∞D を描画する。
 * Satori（ImageResponse）は日本語グリフ用にフォント読込が必要なため、堅牢性を優先して
 * 英字・記号のみで構成する（日本語コピーは <title> / description が担う）。
 */
export const runtime = 'nodejs';
export const alt = 'SHAPE∞D — self-congruence × ai engineering';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07090d',
          color: '#dfe3ea',
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 400, letterSpacing: 24, display: 'flex' }}>
          <span>SHAPE</span>
          <span style={{ color: '#7d9cc4' }}>∞</span>
          <span>D</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 30,
            letterSpacing: 10,
            color: '#8b93a1',
            display: 'flex',
          }}
        >
          SELF-CONGRUENCE × AI ENGINEERING
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            fontSize: 22,
            letterSpacing: 8,
            color: '#545c6a',
            display: 'flex',
          }}
        >
          SYSTEM / WEB / AI
        </div>
      </div>
    ),
    size,
  );
}
