#!/bin/bash
# このリポジトリを /Chisetsu-FC/ のパスでプレビューする。
# GitHub Pages の公開構成に合わせることで、管理画面の絶対パスも本番どおりに動く。
# 使い方: scripts/preview.sh [ポート番号]
PORT="${1:-8000}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVE_ROOT="$(mktemp -d)"
ln -s "$REPO_ROOT" "$SERVE_ROOT/Chisetsu-FC"
echo "トップページ : http://localhost:$PORT/Chisetsu-FC/pages/index.html"
echo "お知らせ一覧 : http://localhost:$PORT/Chisetsu-FC/pages/news/index.html"
echo "管理画面     : http://localhost:$PORT/Chisetsu-FC/pages/admin/login.html"
python3 -m http.server "$PORT" --directory "$SERVE_ROOT"
