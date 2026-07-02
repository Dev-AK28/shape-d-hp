# 受け入れ基準（Given-When-Then）

## お問い合わせフォーム

```gherkin
Given ユーザーがお問い合わせページにいる
When 必須項目を入力して送信する
Then 成功メッセージが表示される
```

```gherkin
Given ユーザーがお問い合わせページにいる
When 必須項目（お名前・メールアドレス・メッセージ）を空のまま送信ボタンを押す
Then ブラウザの HTML5 バリデーションが発火し、フォームは送信されない
And 空の必須フィールドが :invalid 状態になる
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
Given モバイル幅（375px / 390px）で /services・/works・/process 系・/philosophy・/contact を開く（#151）
When ページ読み込み完了後、まだスクロールしていない
Then メインコンテンツが opacity 1 で描画され、フッター手前まで非表示にならない
```

```gherkin
Given デスクトップ幅（1280px）で /services・/works へ SPA 遷移した後（#155）
When リロードなしで 768px 未満（390px）にリサイズする
Then framer-motion リビール要素が staticReveal=true で remount され opacity ≈ 1 で描画される
```

```gherkin
Given デスクトップ幅（1280px）で /services・/works・/philosophy・/process ページを開き、フォーカス可能なリンクにキーボードフォーカスがある（#175）
When 768px 未満にリサイズして staticReveal が false→true に変化する
Then motion.div が remount されても、フォーカスが document.body にリセットされず、等価なリンク要素にフォーカスが復元される
```

```gherkin
Given ユーザーが prefers-reduced-motion を有効にしている
When ページを閲覧する
Then アニメーションは無効化または最小限に抑えられる
```

```gherkin
Given デスクトップ環境でトップページにアクセスし、粒子形成アニメーション（2400ms）進行中である（#135 B案）
When ユーザーが粒子形成完了前にスクロール操作を行う
Then GSAP pin が進行し、コピー・CTA が出現する（スクロールをブロックしない）
And 形成完了後もスクロールインジケーターは表示されない（`scrollRevealed` ガードにより抑制）
```

## Hero 深度通過（#100）

```gherkin
Given デスクトップでトップページ Hero を表示
When ユーザーが Hero セクションをスクロールする
Then nebula / 粒子 / ロゴが深度方向に移動し「通過」感が生まれる
And ブランドのダーク・ミニマルなトーンを維持している
And reduced-motion / 低性能デバイスでは静的または簡略化フォールバックになる
```

## Cosmic Grade（#102 / #227）

```gherkin
Given トップページ Hero を表示
When クール宇宙トーン（Cosmic Grade）overlay が適用されている
Then 宇宙/nebula 背景に subtle な深宇宙の depth が加わり高級感が向上する
And 背景の暗さ・ミニマルさは維持される
And モバイル・reduced-motion では overlay のみ（nebula filter 省略）
```

## Typography Blend（#101）

```gherkin
Given nebula / 宇宙背景の上にテキストが表示される
When mix-blend-mode が適用された見出しを表示する
Then 文字が背景に自然に溶け込みつつ WCAG 相当の可読性を維持する
And 単色背景セクションでは blend が無効化され可読性が保たれる
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
| 必須項目空のまま → ブラウザバリデーション発火 | `e2e/contact.spec.ts`（`shows browser validation for empty required fields`） |
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
| E2E（トップ Hero） | `e2e/home.spec.ts`（粒子 Canvas 描画・形成後ロゴの hero ステージ内センター整合: `expectHeroBrandLogoAfterFormation`、スクロールインジケータ `bottom` の `safe-area-inset-bottom` 補正式の存在確認（#165）、粒子形成中スクロール時インジケーター非表示（#135）: `does not show scroll indicator when user scrolls before particle formation completes`） |
| E2E（下層ページ見出し） | `e2e/page-headers.spec.ts`（`PageHeader` 中央配置・h1・リード文・divider/email/starBackground のページ別断言、safe-area-inset-top 補正式の存在確認（#167）） |
| 粒子ロゴ PNG サンプリング | `tests/hero/sample-logo-target-points.test.ts` |
| E2E（全ナビリンク） | `e2e/navigation.spec.ts`（375/390px ハンバーガー → `/services`・`/works` SPA 遷移後の `expectPainted` 含む） |
| E2E（スクロールアニメーション） | `e2e/scroll-animation.spec.ts`（About / Vision リビール、reduced-motion タイムライン即時表示） |
| E2E（モバイル初期表示・#151） | `e2e/mobile-pages.spec.ts`（375px / 390px でページ読み込み直後の累積 opacity ≈ 1 を `expectPainted()` で検証） |
| E2E（desktop→mobile resize リビール remount・#155） | `e2e/mobile-pages.spec.ts`（1280px で `/services` / `/works` へ遷移後、390px へリサイズして `expectPainted()` 検証。framer `key` の staticReveal-aware remount 保証） |
| フォーカス復元（remount 後・#175） | `tests/a11y/focus-restore.test.ts`（`buildFocusSelector` 純粋関数の単体テスト）。DOM 統合テスト（jsdom + @testing-library/react）は後続 issue で対応 |
| E2E（Philosophy） | `e2e/philosophy.spec.ts` |
| Philosophy 構造 / パネル追従 | `tests/philosophy/content.test.ts` |
| スクロールリビール props（animate / whileInView 排他） | `tests/scroll/reveal-props.test.ts` |
| shouldUseStaticReveal 基本行列 | `tests/scroll/static-reveal.test.ts` |
| useStaticReveal / hook 拡張行列 | `tests/scroll/use-static-reveal.test.ts`（#154 renderHook follow-up） |
| GSAP 設定・トークン | `tests/scroll/gsap-config.test.ts` |
| Hero 深度通過トークン | `tests/scroll/hero-depth-tokens.test.ts` |
| Hero pin セクション結合 | `e2e/home.spec.ts`（`hero-pin-section` testid） |
| Cosmic grade overlay | `tests/design/cosmic-grade.test.ts`, `e2e/home.spec.ts`（`cosmic-grade-overlay`） |
| Typography cosmic blend | `tests/design/typography-blend.test.ts`, `e2e/home.spec.ts`（load + scroll 後 `mix-blend-mode: screen`）, `e2e/page-headers.spec.ts`（starBackground + `/services` / `/works` solid） |
| easing ↔ tokens 連鎖 | `tests/scroll/easing.test.ts` |
| Lighthouse Performance >= 70 | `npm run lighthouse:check` + CI `lighthouse` job |
| Redis Lua acquire/release | `tests/contact/rate-limit-redis.test.ts` |
| 横スクロール pin キーボードフォーカス追従（#247）| `tests/a11y/use-horizontal-focus-sync.test.ts`（`computePanelScrollTarget` 純粋関数の単体テスト） |
| ShowcaseSection CTA サービス個別アンカー遷移（#248）| E2E（`e2e/navigation.spec.ts` 拡張予定）— Given: ShowcaseSection のカード CTA をクリック / When: `/services` へ遷移 / Then: 対応するサービスセクション（`#<id>`）までスクロール。`ServicesContent` の各カードに `id={service.id}` を付与、CTA href を `/services#${service.id}` に統一 |
