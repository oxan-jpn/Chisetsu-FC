---
name: site-structure
description: Chisetsu-FC（池雪FC公式サイト）のリポジトリ構成とデータフローを説明する。コードを変更する前に全体像を把握したいときに使う。
---

# サイト構成とデータフロー

## リポジトリ地図

- `pages/`：公開ページ置き場。トップページは `pages/index.html` で、リポジトリ直下に index.html はない
- `pages/admin/`：管理画面（login、top、news、matches）。Supabase Auth でログインした人だけが使える
- `pages/news/`：お知らせの一覧と詳細。詳細ページと一覧ページは自動生成される（news-publishing skill 参照）
- `assets/css/style.css`：公開ページ用のスタイルを1ファイルに統合したもの。ローディング表示やお知らせ一覧（`.news-list-page`）、詳細（`.news-detail-page`）のスタイルも後半のセクションに入っている
- `assets/css/admin-style.css`：管理画面用のスタイル
- `assets/js/`：公開側は ES モジュールで、`news.js` と `matches.js` が共通クライアント `supabaseClient.js` を読み込む。`main.js` はトップへ戻るボタンのみ
- `assets/js/admin-*.js`、`login.js`：管理画面用。jsDelivr の CDN から Supabase をグローバルに読み込み、各ファイルが個別にクライアントを生成している
- `assets/images/`：画像。emblem.png（約1.4MB）や soccer.png（約1.8MB）など重いファイルがあるので、追加する画像は圧縮してから置く
- `scripts/generate-news.js`：お知らせの静的ページ生成スクリプト
- `components/header.html`：共通ヘッダーの下書きで、まだどのページからも読み込まれていない（issue #10）。トップページには同じ体裁のヘッダーが直接書かれている

## データの流れ

- 公開ページは Supabase を実行時に読む。トップページのお知らせは `news` テーブル（最新5件）、試合の予定と結果は `matches` テーブルから取得する
- `news` の主な項目は `title`、`body`、`image_url`、`created_at`、`published`、`is_deleted`、`generated`
- `matches` の主な項目は `date`、`kickoff`、`location`、`opponent`、`result`（win / lose / draw、未入力は null）、`score_for`、`score_against`
- お知らせの画像は Supabase ストレージの `news-images` バケットに置かれ、公開URLで配信される
- お知らせ詳細ページだけは実行時取得ではなく、GitHub Actions が静的HTMLを生成してリポジトリにコミットする

## 画面とデータの対応

- トップページのお知らせ一覧：`assets/js/news.js` が `published` が true かつ `is_deleted` が false（または null）の行を新しい順に取得し、最新5件を表示する。各行のリンク先は生成済みの詳細ページ
- トップページの試合予定と結果：`assets/js/matches.js` が全件を取得し、日付と `result` で予定と結果に振り分ける
- 管理画面のお知らせ：作成、編集、論理削除（`is_deleted` を true にする）と画像アップロードを行う
- 管理画面の試合情報：作成、編集、結果入力を行う
