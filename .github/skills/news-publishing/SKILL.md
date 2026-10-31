---
name: news-publishing
description: お知らせの投稿から静的ページ生成までの流れと、テンプレートや生成スクリプトを変更するときの手順。お知らせの表示や生成に関する変更で使う。
---

# お知らせの生成と公開

## 全体の流れ

1. 管理画面（`pages/admin/news.html`）からお知らせを投稿、編集、削除する。データは Supabase の `news` テーブルに入り、画像は `news-images` バケットに上がる
2. 投稿や更新をきっかけに、GitHub Actions の「Generate News Pages」ワークフローが起動する。起動の引き金はリポジトリの外（Supabase の Webhook と想定）にある
3. ワークフローは本線ブランチをチェックアウトし、`scripts/generate-news.js` を service role key で実行する
4. 生成スクリプトが対象のお知らせ詳細ページと一覧ページを書き直し、`generated` フラグを立てて、github-actions としてコミットする
5. GitHub Pages がコミットを公開する

## ファイル名ルール（最重要）

- 詳細ページのファイル名は `news` の `created_at` を JST で `yyyyMMddHHmmss` にしたもの
- この規則は生成側の `scripts/generate-news.js`（formatDateForFile）と、トップページ側の `assets/js/news.js`（formatFileName）の両方にある
- 片方だけ変えるとトップページからのリンクが切れるため、変更時は両方を必ずそろえる

## 生成物と編集してよい場所

- `pages/news/<日時>.html` と `pages/news/index.html` は生成物なので直接編集しない
- 詳細ページの体裁は `pages/news/template.html` を直す。プレースホルダは `{{title}}`、`{{date}}`、`{{body}}`、前後リンクの `{{prev_link}}`、`{{next_link}}` と、画像がある場合だけ残る `{{#if image_url}}` ブロック
- 一覧ページの体裁は `scripts/generate-news.js` の generateIndexPage 内のテンプレート文字列を直す
- 一覧と詳細のスタイルは `assets/css/style.css` 内にある（一覧は `.news-list-page`、詳細は `.news-detail-page` 配下）。一覧ページは `style.css` の参照と body の `news-list-page` クラスが必須

## 生成スクリプトの動き

- 詳細ページは、前後のお知らせへのリンクを正しく保つため、本文が空でない未削除の全件から毎回作り直す。対象から外れた生成ファイル（削除済みの記事など）はあわせて削除する
- 一覧ページも、同じ全件から毎回作り直す
- 本文は改行を `<br>` に変換して埋め込む。タイトルと本文のエスケープ状況は issue #16 を参照

## 変更したときの確認

- 生成スクリプトを直したら、構文チェックに加えて、テンプレート文字列の参照先（CSSやリンク先パス）が実在するかを確認する。過去に、存在しない CSS を参照したまま生成され、本番のお知らせ一覧のスタイルが外れた事故がある（issue #13）
- 可能なら実際の生成結果に近いHTMLでプレビューし、一覧と詳細の両方の見た目を確認する
- 本番反映後は、公開された一覧と詳細のURLを開いて確認する
