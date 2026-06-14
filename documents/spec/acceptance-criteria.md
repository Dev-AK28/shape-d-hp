# 受け入れ基準（Given-When-Then）

## お問い合わせフォーム

```gherkin
Given ユーザーがお問い合わせページにいる
When 必須項目を入力して送信する
Then 成功メッセージが表示される
```

```gherkin
Given ユーザーがお問い合わせページにいる
When 不正なメールアドレスで送信する
Then API は 400 を返す
```

```gherkin
Given ユーザーがお問い合わせページにいる
When 60秒以内に6回以上送信する
Then API は 429 を返す
```

## ナビゲーション

```gherkin
Given ユーザーがサイトにアクセスする
When 各ナビゲーションリンクをクリックする
Then 対応するページが表示される
```

## スクロールアニメーション

```gherkin
Given ユーザーがトップページにアクセスする
When ページが読み込まれる
Then ローディング体験または Hero 入場アニメーションが表示される
```

```gherkin
Given ユーザーがページをスクロールする
When 各セクションがビューポートに入る
Then テキスト・要素が段階的にリビールされる
```

```gherkin
Given ユーザーが prefers-reduced-motion を有効にしている
When ページを閲覧する
Then アニメーションは無効化または最小限に抑えられる
```

## Philosophy ページ（#81）

```gherkin
Given ユーザーが /philosophy を開く
When ページが読み込まれる
Then 6 つの full-screen SHAPE-D パネルとオーバーレイ文字が表示される
```

```gherkin
Given ユーザーが Philosophy ページをスクロールする
When 各パネルがビューポートに入る
Then 進捗ドットが対応セクションに追従する
```

## テスト対応

| 基準 | テスト |
|------|--------|
| フォームバリデーション | `tests/contact/schema.test.ts` |
| 未知フィールド（`to` 等）無視 | `tests/contact/schema.test.ts` |
| レート制限（429） | `tests/contact/rate-limit.test.ts`, `tests/contact/route.test.ts` |
| 不正 JSON / 空ボディ → 400 | `tests/contact/route.test.ts` |
| 413 / Content-Length 過小申告 | `tests/contact/route.test.ts`, `tests/contact/read-body.test.ts` |
| 413 / 枠非消費 | `tests/contact/route.test.ts` |
| メール形式 | `tests/contact/email-format.test.ts` |
| Redis フォールバック | `tests/contact/rate-limit-service.test.ts` |
| E2E（お問い合わせ） | `e2e/contact.spec.ts`（Playwright） |
| E2E（ファビコン） | `e2e/favicon.spec.ts` |
| E2E（トップ Hero） | `e2e/home.spec.ts` |
| E2E（全ナビリンク） | `e2e/navigation.spec.ts` |
| E2E（スクロールアニメーション） | `e2e/scroll-animation.spec.ts` |
| E2E（Philosophy） | `e2e/philosophy.spec.ts` |
| Philosophy 構造 / パネル追従 | `tests/philosophy/content.test.ts` |
| スクロールリビール props | `tests/scroll/reveal-props.test.ts` |
| Lighthouse Performance >= 70 | `npm run lighthouse:check` + CI `lighthouse` job |
| Redis Lua acquire/release | `tests/contact/rate-limit-redis.test.ts` |
