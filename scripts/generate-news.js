import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TARGET_ID = process.env.NEWS_ID;      // ← GitHub Actions から渡される
const EVENT = process.env.NEWS_EVENT;       // insert / update

// 日時フォーマット（yyyyMMddHHmmss）→ ファイル名用
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
}

// 表示用フォーマット（yyyy-MM-dd HH:mm）
function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

// 単体記事取得
async function fetchOneNews(id) {
  const url =
    `${SUPABASE_URL}/rest/v1/news` +
    `?select=*` +
    `&id=eq.${id}`;

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  const text = await res.text();
  console.log("FETCH ONE RAW:", res.status, text);

  if (!res.ok) throw new Error("Failed to fetch single news");

  const arr = JSON.parse(text);
  return arr[0] ?? null;
}

// Supabase に generated=true を PATCH
async function markGenerated(id) {
  const url = `${SUPABASE_URL}/rest/v1/news?id=eq.${id}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ generated: true }),
  });

  if (!res.ok) {
    console.error(`Failed to update generated flag for id=${id}`);
  }
}

// 一覧ページ用に全件取得
async function fetchAllNewsForIndex() {
  const url =
    `${SUPABASE_URL}/rest/v1/news` +
    `?select=*` +
    `&is_deleted=eq.false` +
    `&body=not.is.null`;

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch all news");

  return await res.json();
}

// 一覧ページ生成
async function generateIndexPage() {
  let allNews = await fetchAllNewsForIndex();

  allNews = allNews.filter(n => (n.body ?? "").trim() !== "");
  allNews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const itemsHtml = allNews
    .map(n => {
      const filename = `${formatDate(n.created_at)}.html`;
      const date = new Date(n.created_at).toLocaleDateString("ja-JP");
      return `
        <div class="news-item">
          <div class="news-date">${date}</div>
          <a class="news-title" href="./${filename}">${n.title}</a>
        </div>
      `;
    })
    .join("\n");

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>お知らせ一覧</title>
  <link rel="stylesheet" href="../../assets/css/news-list.css">
</head>
<body>
  <div class="container">
    <h1>お知らせ一覧</h1>
    ${itemsHtml}
  </div>
</body>
</html>
`;

  const indexPath = path.join(__dirname, "../pages/news/index.html");
  fs.writeFileSync(indexPath, html);
  console.log("Generated: index.html");
}

async function main() {
  console.log("TARGET ID:", TARGET_ID, "EVENT:", EVENT);

  const item = await fetchOneNews(TARGET_ID);

  if (!item) {
    console.log("Item not found. Nothing to do.");
    return;
  }

  const outputDir = path.join(__dirname, "../pages/news");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${formatDate(item.created_at)}.html`;
  const filePath = path.join(outputDir, filename);

  // 🔥 論理削除の場合
  if (item.is_deleted) {
    console.log("Logical delete detected. Removing HTML:", filePath);
    fs.rmSync(filePath, { force: true });
    await generateIndexPage();
    return;
  }

  // 🔥 INSERT / UPDATE → 既存ファイル削除 → 再生成
  fs.rmSync(filePath, { force: true });

  const templatePath = path.join(__dirname, "../pages/news/template.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  let html = template;

  // 画像ブロック置換
  html = html.replace(
    /{{#if image_url}}[\s\S]*?{{\/if}}/g,
    item.image_url
      ? `<img src="${item.image_url}" alt="" class="news-image">`
      : ""
  );

  const bodyHtml = (item.body ?? "").replace(/\n/g, "<br>");
  const summary = (item.body ?? "").slice(0, 80);

  html = html
    .replace(/{{title}}/g, item.title ?? "")
    .replace(/{{date}}/g, formatDisplayDate(item.created_at))
    .replace(/{{body}}/g, bodyHtml)
    .replace(/{{body_summary}}/g, summary);

  fs.writeFileSync(filePath, html);
  console.log("Generated:", filename);

  await markGenerated(item.id);

  await generateIndexPage();
  console.log("Index page updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
