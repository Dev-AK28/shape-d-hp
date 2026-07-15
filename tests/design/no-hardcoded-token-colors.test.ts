/**
 * トークンと同値のhexハードコード回帰ガード（Issue #441）
 *
 * `lib/design/tokens.ts` の `colors.blue` / `colors.blueLight` / `colors.purple` / `colors.muted`
 * と同じ hex 値が、対応するトークン参照ではなくリテラル文字列としてソースに直接
 * 埋め込まれていないことを検証する。将来これらのファイルを編集する際、
 * `colors.*` 経由の参照に戻すことを強制する回帰テスト。
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { colors } from '@/lib/design/tokens';

function src(relPath: string): string {
  return readFileSync(join(process.cwd(), relPath), 'utf8');
}

const TARGET_FILES = [
  'components/WorksContent.tsx',
  'components/ServicesContent.tsx',
  'components/ConsultingContent.tsx',
  'components/DevelopmentContent.tsx',
  'components/PhilosophyContent.tsx',
];

// tokens.ts に対応物がある色のみ対象（#d1d5db 等、対応トークンが無い色は対象外 — #441 本文参照）
const TOKEN_HEX_VALUES = [colors.blue, colors.blueLight, colors.purple, colors.muted];

describe('hardcoded hex literals matching design tokens (#441)', () => {
  for (const file of TARGET_FILES) {
    it(`${file} does not hardcode colors.{blue,blueLight,purple,muted} hex literals`, () => {
      const s = src(file);
      for (const hex of TOKEN_HEX_VALUES) {
        // クォート付きリテラル（'#60a5fa' 等）としての埋め込みのみを禁止する。
        // CSS変数経由（var(--section-blue) 等）や rgba() 由来の同色は対象外。
        expect(s).not.toContain(`'${hex}'`);
        expect(s).not.toContain(`"${hex}"`);
      }
    });
  }

  it('token values used by this guard are the expected SSOT hex codes', () => {
    expect(colors.blue).toBe('#60a5fa');
    expect(colors.blueLight).toBe('#93c5fd');
    expect(colors.purple).toBe('#a78bfa');
    expect(colors.muted).toBe('#9ca3af');
  });
});
