/**
 * @vitest-environment jsdom
 *
 * CTA セクション TopCta — Issue #311
 * - eyebrow / copy / note / CTA ボタンを描画
 * - CTA ボタンは既存の /contact 導線へ接続（2026-07-03 確定）
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopCta from '@/components/top/TopCta';

describe('TopCta', () => {
  it('renders eyebrow, copy and note', () => {
    render(<TopCta />);
    expect(screen.getByText('CONTACT')).toBeTruthy();
    expect(document.querySelector('.cta-copy')?.textContent).toContain('構想の段階から');
    expect(document.querySelector('.cta-note')?.textContent).toContain('売り込みはしません');
  });

  it('connects the CTA button to the existing /contact flow', () => {
    render(<TopCta />);
    const button = screen.getByRole('link', { name: '無料相談を申し込む' });
    expect(button.getAttribute('href')).toBe('/contact');
    expect(button.className).toContain('cta-button');
  });
});
