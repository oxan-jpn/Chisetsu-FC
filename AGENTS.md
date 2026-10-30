# AGENTS.md

池雪FC公式サイト（Chisetsu-FC）の開発をAIエージェントと進めるための共通指示です。詳細は `.github/skills/` の各skillを参照してください。

## プロジェクト概要

- 池雪FC（一般部）の公式サイトで、GitHub Pages で公開しています（https://oxan-jpn.github.io/Chisetsu-FC/pages/index.html）
- ビルドなしの静的 HTML / CSS / JavaScript で、データは Supabase（news / matches テーブル、管理画面の認証、news-images ストレージ）を使います
- トップページは `pages/index.html` で、リポジトリ直下に index.html はありません

## ブランチ

- 現在の本線は `dev/copilot`（デフォルトブランチ）です。`main` は 2026-05-05 で止まっているので使いません
- `master` への移行を計画中です（issue #21）。移行までは `dev/copilot` から feature ブランチを切ります
- お知らせ生成ワークフロー（`.github/workflows/generate-news.yml`）は本線を決め打ちしているため、本線を変えるときはワークフローの参照先も同時に変えます

## データフローの不変条件

- お知らせ詳細ページのファイル名は、`news` の `created_at` から JST で `yyyyMMddHHmmss` を作ります。この規則は `assets/js/news.js` と `scripts/generate-news.js` の両方にあり、必ず一致させます
- `pages/news/` 配下の生成ファイル（一覧と詳細）は生成結果です。表示の問題は `pages/news/template.html` か `scripts/generate-news.js` を直して再生成し、生成ファイルを直接編集しません
- 公開ページのお知らせ表示条件は、`published` が true かつ `is_deleted` が false（または null）です。Supabase の権限の現状と変更手順は `supabase-safety` skill を参照します

## 開発ルール

- 修正は issue ベースで進めます。issue のタイトルは簡潔に、本文は「現状」「課題」「解決方針」の3節で書きます
- 作業は feature ブランチで行い、PR を作ります。マージはオーナーの確認後に行います
- コミットメッセージ、コード内のコメント、UIの文言は日本語で書きます
- 完了の定義は、ローカルプレビューの確認、JavaScript の構文チェック、本番反映後の公開URL確認の3点です
- 本番の Supabase データベースを直接書き換えません。データ変更は管理画面経由で行い、読み取りは調査のときだけにします
- 秘密情報をコードやドキュメントに書きません。公開キー（publishable key）は公開前提で問題ありませんが、service role key は GitHub Secrets のみに置きます
- 個人情報の漏洩や脆弱性の兆候を見つけたら、他の作業より先にオーナーへ報告します
- お金や新しい外部サービスが関わる変更は、計画段階でオーナーに相談します

## 詳細skill

- サイト構成とデータフロー：`.github/skills/site-structure/SKILL.md`
- お知らせの生成と公開：`.github/skills/news-publishing/SKILL.md`
- Supabase の権限と安全な扱い：`.github/skills/supabase-safety/SKILL.md`
- 開発の進め方と検証：`.github/skills/dev-workflow/SKILL.md`
- コードレビュー：`.github/skills/code-review/SKILL.md`
- アクセシビリティ：`.github/skills/accessibility/SKILL.md`
