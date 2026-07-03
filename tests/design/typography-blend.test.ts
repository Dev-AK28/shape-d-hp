import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { typographyBlend } from '@/lib/design/tokens';

const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');
const textRevealSource = readFileSync(
  join(process.cwd(), 'components/scroll/TextReveal.tsx'),
  'utf8',
);
const pageSource = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
const pageHeaderSource = readFileSync(
  join(process.cwd(), 'components/ui/PageHeader.tsx'),
  'utf8',
);

describe('typographyBlend tokens (Issue #101)', () => {
  it('defines screen blend for cosmic backgrounds', () => {
    expect(typographyBlend.cosmic).toBe('screen');
    expect(typographyBlend.solid).toBe('normal');
    expect(typographyBlend.classCosmic).toBe('type-blend-cosmic');
    expect(typographyBlend.classSolid).toBe('type-blend-solid');
    expect(typographyBlend.testIdCosmic).toBe('type-blend-cosmic');
  });

  it('defines cosmic and solid utility classes in globals.css', () => {
    expect(globalsCss).toContain('.type-blend-cosmic');
    expect(globalsCss).toContain('.type-blend-solid');
    expect(globalsCss).toContain('mix-blend-mode: var(--type-blend-cosmic)');
  });

  it('adds subtle text-shadow on cosmic blend for legibility', () => {
    expect(globalsCss).toMatch(
      /\.type-blend-cosmic[\s\S]*text-shadow:[\s\S]*rgba\(10,\s*10,\s*10/,
    );
  });

  it('wires blend prop into TextReveal with cosmic and solid classes', () => {
    expect(textRevealSource).toContain("blend?: 'cosmic' | 'solid'");
    expect(textRevealSource).toContain('typographyBlend.classCosmic');
    expect(textRevealSource).toContain('typographyBlend.classSolid');
    expect(textRevealSource).toContain("blend = 'solid'");
  });

  it('does not use cosmic typography blend on the new top page (#316)', () => {
    // #312/#316: 旧イマーシブ Hero を撤去し、トップページは参照デザインのみ。
    // トップ（app/page.tsx）は cosmic blend を使わない。cosmic blend 自体は
    // PageHeader（starBackground 時）が引き続き保持する。
    expect(pageSource).not.toContain('typographyBlend.classCosmic');
  });

  it('enables cosmic blend on PageHeader when starBackground is set', () => {
    expect(pageHeaderSource).toContain("blend={starBackground ? 'cosmic' : 'solid'}");
    expect(pageHeaderSource).toContain('starBackground ? typographyBlend.classCosmic');
  });
});
