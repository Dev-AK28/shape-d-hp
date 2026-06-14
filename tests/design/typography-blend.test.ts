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

  it('mirrors typography blend tokens in globals.css', () => {
    expect(globalsCss).toContain(`--type-blend-cosmic: ${typographyBlend.cosmic}`);
    expect(globalsCss).toContain(`--type-blend-solid: ${typographyBlend.solid}`);
    expect(globalsCss).toContain('.type-blend-cosmic');
    expect(globalsCss).toContain('.type-blend-solid');
    expect(globalsCss).toContain('mix-blend-mode: var(--type-blend-cosmic)');
  });

  it('adds subtle text-shadow on cosmic blend for legibility', () => {
    expect(globalsCss).toMatch(
      /\.type-blend-cosmic[\s\S]*text-shadow:[\s\S]*rgba\(10,\s*10,\s*10/,
    );
  });

  it('wires blend prop into TextReveal', () => {
    expect(textRevealSource).toContain("blend?: 'cosmic' | 'solid'");
    expect(textRevealSource).toContain('typographyBlend.classCosmic');
    expect(textRevealSource).toContain("blend = 'solid'");
  });

  it('applies cosmic blend to Hero heading', () => {
    expect(pageSource).toContain('typographyBlend.classCosmic');
    expect(pageSource).toContain('typographyBlend.testIdCosmic');
  });

  it('enables cosmic blend on PageHeader when starBackground is set', () => {
    expect(pageHeaderSource).toContain("blend={starBackground ? 'cosmic' : 'solid'}");
  });
});
