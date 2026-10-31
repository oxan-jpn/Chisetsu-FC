import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TARGET_ID = process.env.NEWS_ID; // GitHub Actions から渡される
const EVENT = process.env.NEWS_EVENT;  // insert / update

/* ============================================================
   UTC → JST（日本時間）変換
============================================================ */
function toJST(dateStr) {
  const d = new Date(dateStr);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
}

/* ============================================================
   ファイル名用フォーマット（JST yyyyMMddHHmmss）
============================================================ */
function formatDateForFile(dateStr) {
  const d = toJST(dateStr);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
}

/* ============================================================
   表示用フォーマット（JST yyyy-MM-dd HH:mm）
============================================================ */
function formatDisplayDate(dateStr) {
  const d = toJST(dateStr);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

/* ============================================================
   HTMLエスケープ（news.js の escapeHTML と同等。null は空文字）
============================================================ */
function escapeHTML(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============================================================
   Supabase から単体記事を取得
============================================================ */
async function fetchOneNews(id) {
  const url = `${SUPABASE_URL}/rest/v1/news?select=*&id=eq.${id}`;

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch single news:", res.status);
    return null;
  }

  const arr = await res.json();
  return arr[0] ?? null;
}

/* ============================================================
   Supabase に generated=true を PATCH
============================================================ */
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

/* ============================================================
   一覧ページ用に全件取得
============================================================ */
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

/* ============================================================
   一覧ページ生成
============================================================ */
async function generateIndexPage() {
  let allNews = await fetchAllNewsForIndex();

  // 空データ除外
  allNews = allNews.filter(n => (n.body ?? "").trim() !== "");

  // 新しい順
  allNews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 月別アーカイブ用に、年月（JST）の一覧を新しい順で作る
  const yearMonthOf = (createdAt) => {
    const jst = toJST(createdAt);
    return `${jst.getFullYear()}-${String(jst.getMonth() + 1).padStart(2, "0")}`;
  };
  const months = [...new Set(allNews.map(n => yearMonthOf(n.created_at)))];
  const archiveOptions = months
    .map(ym => {
      const [year, month] = ym.split("-");
      return `<option value="${ym}">${year}年${Number(month)}月</option>`;
    })
    .join("\n        ");

  const filterHtml = `
    <div class="news-filter">
      <input type="search" id="newsSearch" placeholder="キーワードで検索" aria-label="お知らせをキーワードで検索">
      <select id="newsArchive" aria-label="月別アーカイブ">
        <option value="">すべての月</option>
        ${archiveOptions}
      </select>
    </div>
    <p id="newsFilterEmpty" class="news-filter-empty" hidden>条件に合うお知らせはありません</p>
  `;

  const filterScript = `
  <script>
  (function () {
    // お知らせ一覧の絞り込み（キーワード検索と月別アーカイブ）
    var search = document.getElementById("newsSearch");
    var archive = document.getElementById("newsArchive");
    var empty = document.getElementById("newsFilterEmpty");
    var items = Array.prototype.slice.call(document.querySelectorAll(".news-item"));
    function applyFilter() {
      var keyword = search.value.trim().toLowerCase();
      var ym = archive.value;
      var visible = 0;
      items.forEach(function (item) {
        var match = (!ym || item.dataset.ym === ym) &&
          (!keyword || item.textContent.toLowerCase().includes(keyword));
        item.style.display = match ? "" : "none";
        if (match) visible++;
      });
      empty.hidden = visible !== 0;
    }
    search.addEventListener("input", applyFilter);
    archive.addEventListener("change", applyFilter);
  })();
  </script>
  `;

  const itemsHtml = allNews
    .map(n => {
      const filename = `${formatDateForFile(n.created_at)}.html`;
      const date = toJST(n.created_at).toLocaleDateString("ja-JP");

      return `
        <div class="news-item" data-ym="${yearMonthOf(n.created_at)}">
          <div class="news-date">${date}</div>
          <a class="news-title" href="./${filename}">${escapeHTML(n.title)}</a>
        </div>
      `;
    })
    .join("\n");

  const backToTopHtml = `
    <div class="back-to-top-wrapper">
      <a href="../index.html" class="back-to-top-link">トップページへ戻る &rang;</a>
    </div>
  `;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>お知らせ一覧</title>
  <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body class="news-list-page">
  <div class="container">
    <h1>お知らせ一覧</h1>
    ${filterHtml}
    ${itemsHtml}
    ${backToTopHtml}
  </div>
  ${filterScript}
</body>
</html>
`;

  const indexPath = path.join(__dirname, "../pages/news/index.html");
  fs.writeFileSync(indexPath, html);
  console.log("Generated: index.html");
}

/* ============================================================
   詳細ページ生成
============================================================ */
function generateDetailPage(item, filePath) {
  const templatePath = path.join(__dirname, "../pages/news/template.html");
  const template = fs.readFileSync(templatePath, "utf-8");

  let html = template;

  // 画像ブロック置換
  html = html.replace(
    /{{#if image_url}}[\s\S]*?{{\/if}}/g,
    item.image_url
      ? `<img src="${escapeHTML(item.image_url)}" alt="" class="news-image">`
      : ""
  );

  const bodyHtml = escapeHTML((item.body ?? "").trim())
    .replace(/\n/g, "<br>");

  // OGP の説明文用に、空白を丸めて先頭80文字を使う
  const summary = (item.body ?? "").replace(/\s+/g, " ").trim().slice(0, 80);

  const ogImage =
    item.image_url ||
    "https://oxan-jpn.github.io/Chisetsu-FC/assets/images/og-logo.png";
  const ogUrl = `https://oxan-jpn.github.io/Chisetsu-FC/pages/news/${path.basename(filePath)}`;
  const twitterCard = item.image_url ? "summary_large_image" : "summary";

  // 置換文字列の $ パターン解釈を避けるため、関数形式で渡す
  html = html
    .replace(/{{title}}/g, () => escapeHTML(item.title ?? ""))
    .replace(/{{date}}/g, () => formatDisplayDate(item.created_at))
    .replace(/{{body}}/g, () => bodyHtml)
    .replace(/{{body_summary}}/g, () => escapeHTML(summary))
    .replace(/{{og_image}}/g, () => escapeHTML(ogImage))
    .replace(/{{og_url}}/g, () => escapeHTML(ogUrl))
    .replace(/{{twitter_card}}/g, () => twitterCard);

  fs.writeFileSync(filePath, html);
  console.log("Generated:", filePath);
}

/* ============================================================
   メイン処理
============================================================ */
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

  const filename = `${formatDateForFile(item.created_at)}.html`;
  const filePath = path.join(outputDir, filename);

  // 論理削除
  if (item.is_deleted) {
    console.log("Logical delete detected. Removing:", filePath);
    fs.rmSync(filePath, { force: true });
    await generateIndexPage();
    return;
  }

  // 再生成
  fs.rmSync(filePath, { force: true });
  generateDetailPage(item, filePath);

  await markGenerated(item.id);
  await generateIndexPage();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
