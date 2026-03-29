import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fetchNews() {
  const url = `${SUPABASE_URL}/rest/v1/news?select=*`;

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

async function main() {
  console.log("Fetching news from Supabase...");
  const news = await fetchNews();
  console.log(`Fetched ${news.length} items.`);

  const outputDir = path.join(__dirname, "../pages/news");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 詳細ページ生成
  for (const item of news) {
    const filename = `${item.id}.html`;
    const filePath = path.join(outputDir, filename);

    const html = `
      <html>
        <body>
          <h1>${item.title}</h1>
          <p>${item.content}</p>
        </body>
      </html>
    `;

    fs.writeFileSync(filePath, html);
    console.log(`Generated: ${filename}`);
  }

  // 一覧ページ生成
  const indexHtml = `
    <html>
      <body>
        <h1>News List</h1>
        <ul>
          ${news
            .map((n) => `<li><a href="./${n.id}.html">${n.title}</a></li>`)
            .join("")}
        </ul>
      </body>
    </html>
  `;

  fs.writeFileSync(path.join(outputDir, "index.html"), indexHtml);
  console.log("Generated index.html");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
