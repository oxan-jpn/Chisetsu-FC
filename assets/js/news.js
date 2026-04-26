import { supabase } from "./supabaseClient.js";

/* ============================================================
   初期化
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadLatestNews();
});

/* ============================================================
   UTC → JST（日本時間）変換
============================================================ */
function toJST(dateStr) {
  const d = new Date(dateStr);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
}

function formatFileName(dateStr) {
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
   HTML エスケープ
============================================================ */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ============================================================
   お知らせ 1 件分の HTML 生成
============================================================ */
function renderNewsItem(item) {
  const date = toJST(item.created_at).toLocaleDateString("ja-JP");
  const fileName = formatFileName(item.created_at);
  const detailUrl = `../pages/news/${fileName}.html`;

  return `
    <li class="news-item">
      <a href="${detailUrl}" class="news-link-wrapper">
        <div class="news-date">${date}</div>
        <div class="news-title">${escapeHTML(item.title)}</div>
      </a>
    </li>
  `;
}

/* ============================================================
   お知らせ取得 → 最新 5 件を表示
============================================================ */
async function loadLatestNews() {
  const list = document.getElementById("news-list");
  const section = document.getElementById("news-section");
  const loading = document.getElementById("news-loading");

  try {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, created_at, is_deleted, published")
      .eq("published", true)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("created_at", { ascending: false });

    if (loading) loading.remove();

    if (error) {
      console.error("ニュース取得エラー:", error);
      section.insertAdjacentHTML(
        "beforeend",
        `<div class="empty-message">お知らせの取得に失敗しました</div>`
      );
      return;
    }

    if (!data || data.length === 0) {
      section.insertAdjacentHTML(
        "beforeend",
        `<div class="empty-message">最近のお知らせはありません</div>`
      );
      return;
    }

    // 最新 5 件に絞る
    const latestFive = data.slice(0, 5);

    // HTML 生成
    list.innerHTML = latestFive.map(renderNewsItem).join("");

  } catch (err) {
    console.error("ニュース取得例外:", err);
    if (loading) loading.remove();
    section.insertAdjacentHTML(
      "beforeend",
      `<div class="empty-message">お知らせの取得に失敗しました</div>`
    );
  }
}
