/**
 * @vitest-environment jsdom
 *
 * グローバルエラーバウンダリ app/global-error.tsx — Issue #474
 * - app/layout.tsx（ルートレイアウト）自体が throw した場合にのみ使われる、
 *   自前で <html>/<body> を描画する特殊なバウンダリ
 * - globals.css / フォント / 他の app コンポーネントを一切 import しないため
 *   jsdom でのハング要因はない
 * - エラーメッセージの描画 / reset の button 接続 / <html lang="ja">・<body> の自前描画 /
 *   console.error 呼び出しを検証
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalError from '@/app/global-error';

describe('GlobalError', () => {
  const error = Object.assign(new Error('global boom'), { digest: 'global-digest' });
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
    render(<GlobalError error={error} reset={reset} />);
    expect(screen.getByText('問題が発生しました')).toBeTruthy();
    expect(screen.getByText('時間をおいて再度お試しください。')).toBeTruthy();
  });

  it('renders its own <html lang="ja"> and <body>', () => {
    render(<GlobalError error={error} reset={reset} />);
    const html = document.querySelector('html[lang="ja"]');
    expect(html).toBeTruthy();
    expect(html?.querySelector('body')).toBeTruthy();
  });

  it('connects the reset button to the reset callback', () => {
    render(<GlobalError error={error} reset={reset} />);
    const button = screen.getByRole('button', { name: '再読み込み' });
    button.click();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('logs the caught error via useEffect', () => {
    render(<GlobalError error={error} reset={reset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error in root layout', error);
  });
});
