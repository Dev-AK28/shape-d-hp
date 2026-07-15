import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Issue #440 回帰ガード
 *
 * ServicesContent / ConsultingContent / DevelopmentContent / PhilosophyContent の
 * 同一オリジン内リンク（/contact, service.processUrl 等）はフルページ遷移になる
 * 生の `<a>`（framer-motion の `m.a`）ではなく、`next/link` の `Link` による
 * クライアントサイドナビゲーションを使う（components/ProcessNavigation.tsx の
 * `MotionLink = m.create(Link)` パターンに統一）。
 *
 * 外部リンク（例: ServicesContent の toolUrl、target="_blank" 付き）は対象外。
 */
const targetFiles = [
  'components/ServicesContent.tsx',
  'components/ConsultingContent.tsx',
  'components/DevelopmentContent.tsx',
  'components/PhilosophyContent.tsx',
];

describe('Content components use next/link for internal navigation (#440)', () => {
  for (const relativePath of targetFiles) {
    const source = readFileSync(join(process.cwd(), relativePath), 'utf8');

    it(`${relativePath} imports next/link and defines MotionLink = m.create(Link)`, () => {
      expect(source).toMatch(/import Link from ['"]next\/link['"]/);
      expect(source).toMatch(/const MotionLink = m\.create\(Link\);/);
    });

    it(`${relativePath} no longer uses <m.a> for internal navigation`, () => {
      expect(source).not.toMatch(/<m\.a\b/);
    });

    it(`${relativePath} renders /contact (and any processUrl link) via MotionLink`, () => {
      const contactLinkCount = (source.match(/<MotionLink\b/g) ?? []).length;
      expect(contactLinkCount).toBeGreaterThan(0);
    });
  }

  it('ServicesContent keeps the external tool link (target="_blank") as a plain <a> (out of scope for #440)', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/ServicesContent.tsx'),
      'utf8',
    );
    expect(source).toMatch(/<a\s*\n\s*href=\{service\.toolUrl\}/);
    expect(source).toContain('target="_blank"');
  });
});
