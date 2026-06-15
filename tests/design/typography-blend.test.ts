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
const heroSource = readFileSync(join(process.cwd(), 'components/Hero.tsx'), 'utf8');

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

  it('hides hero logo instantly at copy reveal start for cosmic typography blend', () => {
    expect(heroSource).toContain('timeline.set');
    expect(heroSource).toContain('logoOpacityHideAt * timelineDuration');
    expect(heroSource).toContain('logoScrollHidden');
  });

  it('applies cosmic blend to Hero heading and lead copy', () => {
    expect(pageSource).toContain('typographyBlend.classCosmic');
    expect(pageSource).toContain('typographyBlend.testIdCosmic');
    // className に typographyBlend.classCosmic が含まれ、リード文が存在することを確認
    // テンプレートリテラル／単独属性どちらの形式でも成立するよう汎化
    expect(heroSource).toMatch(
      /typographyBlend\.classCosmic[\s\S]{0,200}爆速・安全・低コスト/,
    );
  });

  it('enables cosmic blend on PageHeader when starBackground is set', () => {
    expect(pageHeaderSource).toContain("blend={starBackground ? 'cosmic' : 'solid'}");
    expect(pageHeaderSource).toContain('starBackground ? typographyBlend.classCosmic');
  });
});
