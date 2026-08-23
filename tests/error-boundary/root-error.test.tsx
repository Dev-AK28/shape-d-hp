/**
 * @vitest-environment jsdom
 *
 * ルートエラーバウンダリ app/error.tsx — Issue #474
 * - app/(site) 配下の外（実質 app/page.tsx）で発生したエラーを捕捉
 * - Navigation/Footer は直接 import していないため jsdom でのハング要因はない
 * - エラーメッセージの描画 / reset の button 接続 / /services への導線 / console.error 呼び出しを検証
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootError from '@/app/error';

describe('RootError', () => {
  const error = Object.assign(new Error('root boom'), { digest: 'root-digest' });
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
    render(<RootError error={error} reset={reset} />);
    expect(screen.getByText('問題が発生しました')).toBeTruthy();
    expect(
      screen.getByText('ページの表示中にエラーが発生しました。時間をおいて再度お試しください。')
    ).toBeTruthy();
  });

  it('connects the reset button to the reset callback', () => {
    render(<RootError error={error} reset={reset} />);
    const button = screen.getByRole('button', { name: '再読み込み' });
    button.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('links to /services as a recovery path', () => {
    render(<RootError error={error} reset={reset} />);
    const link = screen.getByRole('link', { name: 'サービス紹介へ' });
    expect(link.getAttribute('href')).toBe('/services');
  });

  it('logs the caught error via useEffect', () => {
    render(<RootError error={error} reset={reset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error in root route', error);
  });
});
