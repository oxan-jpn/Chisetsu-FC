// scripts/generate-news.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ------------------------------
// パス関連
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEWS_DIR = path.join(__dirname, "../pages/news");
const TEMPLATE_DETAIL = path.join(NEWS_DIR, "template.html");
const TEMPLATE_INDEX = path.join(NEWS_DIR, "index-template.html");

// ------------------------------
// Supabase クライアント
// ------------------------------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ------------------------------
// 日付フォーマット
// ------------------------------
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

// HTML エスケープ（最低限）
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------------------------------
// 本文の summary（冒頭80文字）
// ------------------------------
function createSummary(body) {
  if (!body) return "";
  return body.length > 80 ? body.slice(0, 80) + "…" : body;
}

// ------------------------------
// 詳細ページ生成
// ------------------------------
function generateDetailPage(template, item) {
  let html = template;

  html = html.replace(/{{title}}/g, escapeHtml(item.title));
  html = html.replace(/{{date}}/g, formatDate(item.created_at));
  html = html.replace(/{{body}}/g, escapeHtml(item.body || ""));
  html = html.replace(/{{body_summary}}/g, escapeHtml(createSummary(item.body)));

  if (item.image_url) {
    html = html.replace(/{{#if image_url}}([\s\S]*?){{\/if}}/g, `$1`);
    html = html.replace(/{{image_url}}/g, item.image_url);
  } else {
    html = html.replace(/{{#if image_url}}([\s\S]*?){{\/if}}/g, "");
  }

  return html;
}

// ------------------------------
// 一覧ページ生成
// ------------------------------
function generateIndexPage(template, items) {
  let cards = "";

  for (const item of items) {
    let card = `
      <a href="./${item.page_name}.html" class="news-card">
        {{thumb}}
        <div class="info">
          <div class="title">${escapeHtml(item.title)}</div>
          <div class="date">${formatDate(item.created_at)}</div>
          <div class="summary">${escapeHtml(createSummary(item.body))}</div>
        </div>
      </a>
    `;

    if (item.image_url) {
      card = card.replace(
        "{{thumb}}",
        `<img src="${item.image_url}" class="thumb">`
      );
    } else {
      card = card.replace("{{thumb}}", "");
    }

    cards += card + "\n";
  }

  return template.replace("{{news_list}}", cards);
}

// ------------------------------
// メイン処理
// ------------------------------
async function main() {
  console.log("Fetching news from Supabase...");

  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("published", true)
    .or("is_deleted.is.null,is_deleted.eq.false")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Fetched ${data.length} items.`);

  // テンプレート読み込み
  const templateDetail = fs.readFileSync(TEMPLATE_DETAIL, "utf-8");
  const templateIndex = fs.readFileSync(TEMPLATE_INDEX, "utf-8");

  // 詳細ページ生成
  for (const item of data) {
    const pageName = new Date(item.created_at)
      .toISOString()
      .replace(/[-:TZ.]/g, "")
      .slice(0, 14);

    item.page_name = pageName;

    const html = generateDetailPage(templateDetail, item);
    const filePath = path.join(NEWS_DIR, `${pageName}.html`);

    fs.writeFileSync(filePath, html);
    console.log(`Generated: ${filePath}`);
  }

  // 一覧ページ生成
  const indexHtml = generateIndexPage(templateIndex, data);
  fs.writeFileSync(path.join(NEWS_DIR, "index.html"), indexHtml);

  console.log("Generated index.html");
}

main();
