import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 日時フォーマット（yyyyMMddHHmmss）
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

// Supabase REST API で未生成 & 未削除のお知らせを取得
async function fetchNews() {
  const url =
    `${SUPABASE_URL}/rest/v1/news` +
    `?select=*` +
    `&deleted_at=is.null` +
    `&generated=is.false` +
    `&body=not.is.null`;

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status} ${res.statusText}`);
  }

  return await res.json();
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

async function main() {
  console.log("Fetching news from Supabase...");
  const news = await fetchNews();
  console.log(`Fetched ${news.length} items.`);

  if (news.length === 0) {
    console.log("No new news to generate.");
    return;
  }

  // テンプレート読み込み
  const templatePath = path.join(__dirname, "../pages/news/template.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  const outputDir = path.join(__dirname, "../pages/news");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const item of news) {
    const filename = `${formatDate(item.created_at)}.html`;
    const filePath = path.join(outputDir, filename);

    // テンプレート置換
    let html = template
      .replace("{{title}}", item.title ?? "")
      .replace("{{date}}", item.created_at ?? "")
      .replace("{{body}}", (item.body ?? "").replace(/\n/g, "<br>"))
      .replace("{{image_url}}", item.image_url ?? "");

    fs.writeFileSync(filePath, html);
    console.log(`Generated: ${filename}`);

    // Supabase 側に generated=true をセット
    await markGenerated(item.id);
  }

  console.log("All pages generated and marked as generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
