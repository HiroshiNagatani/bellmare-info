# 湘南ベルマーレ情報まとめアプリ

X（旧Twitter）で公開されている湘南ベルマーレ関連の最新情報をまとめて表示するWebアプリです。

## 機能

- **公式アカウントのタイムライン表示** — クラブ公式・アカデミーなどの投稿を取得
- **#湘南ベルマーレ ハッシュタグ検索** — ベルマーレ関連の最新投稿を横断検索
- **公式リンク集** — 公式サイト・チケット・スタジアム・グッズへのリンク
- **自動キャッシュ** — 5分間キャッシュで快適に閲覧

## セットアップ

```bash
npm install
npm run typecheck
npm run dev
```

- `npm run typecheck` … Cloudflare と同じ TypeScript チェック（`tsc --noEmit`）
- `npm run dev` … 開発サーバー（[http://localhost:3000](http://localhost:3000)）
- `npm run build:next` … Next.js 単体ビルド（OpenNext なしで本番ビルド相当を確認）

`npm run dev` で wrangler の OAuth（ポート 8976）が衝突した場合は、先に動いている `next dev` や `wrangler` を止めてから再実行してください。Cloudflare 未ログインでも、Xタイムラインの確認は続行できます。

## 技術スタック

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- [FxTwitter API](https://docs.fxembed.com/) — Xの公開情報取得

## 対応アカウント

| アカウント | 内容 |
|-----------|------|
| @bellmare_staff | 湘南ベルマーレ公式 |
| @bellmare_acad | フットボールアカデミー |
| @jleague | Ｊリーグ公式（個別タブ） |

## Cloudflare Workers へのデプロイ

このプロジェクトは `@opennextjs/cloudflare` で Workers にデプロイできます。

### ローカルからデプロイ

```bash
npm run deploy
```

### Cloudflare ダッシュボード（Git連携）の場合

ビルド・デプロイコマンドは次の設定を推奨します。

| 項目 | コマンド |
|------|----------|
| ビルドコマンド | `npm run build` |
| デプロイコマンド | `npx wrangler deploy` |

`npm run build` は OpenNext 用の `.open-next/` ディレクトリを生成します（内部で `next build` も実行されます）。

代替として、デプロイコマンドを `npm run deploy` に設定することもできます。

`wrangler.jsonc` の Worker 名（`bellmare-info`）と `WORKER_SELF_REFERENCE` の `service` が一致している必要があります。

> **注意:** Cloudflare 上の Worker 名を変更した場合は、`wrangler.jsonc` の `name` と `services[].service` も同じ名前に更新してください。

## 注意事項

- このアプリは非公式のファン向け情報ビューアです
- データはX上で公開されている情報を表示しています
- 湘南ベルマーレ公式クラブとは無関係です
