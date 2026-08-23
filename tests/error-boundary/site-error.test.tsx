/**
 * @vitest-environment jsdom
 *
 * (site) ルートグループのエラーバウンダリ app/(site)/error.tsx — Issue #474
 * - app/(site)/layout.tsx の Navigation/Footer はマウントされたまま維持される想定のため、
 *   このコンポーネント自体は Navigation/Footer を直接 import していない
 *   （依存する SectionShell も同様に依存なし）— jsdom でのハング要因はない
 * - エラーメッセージの描画 / reset の button 接続 / トップページへの導線 / console.error 呼び出しを検証
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SiteError from '@/app/(site)/error';

describe('SiteError', () => {
  const error = Object.assign(new Error('site boom'), { digest: 'site-digest' });
  let reset: ReturnType<typeof vi.fn<() => void>>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    reset = vi.fn<() => void>();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders the error message', () => {
    render(<SiteError error={error} reset={reset} />);
    expect(screen.getByText('問題が発生しました')).toBeTruthy();
    expect(
      screen.getByText(
        'ページの表示中にエラーが発生しました。時間をおいて再度お試しいただくか、 解決しない場合はお問い合わせください。'
      )
    ).toBeTruthy();
  });

  it('connects the reset button to the reset callback', () => {
    render(<SiteError error={error} reset={reset} />);
    const button = screen.getByRole('button', { name: '再読み込み' });
    button.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links back to the top page as a recovery path', () => {
    render(<SiteError error={error} reset={reset} />);
    const link = screen.getByRole('link', { name: 'トップページへ戻る' });
    expect(link.getAttribute('href')).toBe('/');
  });

  it('logs the caught error via useEffect', () => {
    render(<SiteError error={error} reset={reset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error in (site) route group', error);
  });
});
