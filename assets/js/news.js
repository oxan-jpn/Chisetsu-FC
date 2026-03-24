import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    fetchNews();
});

async function fetchNews() {
    const list = document.getElementById("news-list");
    const section = document.getElementById("news-section");
    const loading = document.getElementById("news-loading");

    // --- Supabase 取得 ---
    const { data, error } = await supabase
        .from("news")
        .select("id, title, body, url, link_text, created_at")
        .eq("published", true)
        .or("is_deleted.is.null,is_deleted.eq.false") // ← 論理削除除外
        .order("created_at", { ascending: false });

    // ローディング削除
    if (loading) loading.remove();

    // --- エラー処理 ---
    if (error) {
        console.error("ニュース取得エラー:", error);
        section.insertAdjacentHTML(
            "beforeend",
            `<div class="empty-message">お知らせの取得に失敗しました</div>`
        );
        return;
    }

    // --- データなし ---
    if (!data || data.length === 0) {
        section.insertAdjacentHTML(
            "beforeend",
            `<div class="empty-message">最近のお知らせはありません</div>`
        );
        return;
    }

    // --- HTML 生成 ---
    list.innerHTML = data.map(itemHTML).join("");
}

function itemHTML(n) {
    const date = new Date(n.created_at).toLocaleDateString("ja-JP");

    // URL がない場合 → 日付＋タイトルのみ
    if (!n.url) {
        return `
            <li class="news-item">
                <div class="news-date">${date}</div>
                <div class="news-title">${escapeHTML(n.title)}</div>
            </li>
        `;
    }

    // URL がある場合 → link_text があればそれを使う、なければ URL を表示
    const linkText = n.link_text ? escapeHTML(n.link_text) : escapeHTML(n.url);

    return `
        <li class="news-item">
            <div class="news-date">${date}</div>
            <div class="news-title">${escapeHTML(n.title)}</div>
            <div class="news-link">
                <a href="${escapeHTML(n.url)}">${linkText}</a>
            </div>
        </li>
    `;
}

// XSS 対策の簡易エスケープ
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
