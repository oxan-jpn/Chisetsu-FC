// assets/js/news.js
import { supabase } from "./supabaseClient.js"; // ← Supabase クライアントを読み込む

document.addEventListener("DOMContentLoaded", () => {
    fetchNews();
});

async function fetchNews() {
    const list = document.getElementById("news-list");
    const section = document.getElementById("news-section");
    const loading = document.getElementById("news-loading"); // ← ローディング要素

    const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

    // 取得完了 → ローディング削除
    if (loading) loading.remove();

    if (error) {
        console.error("ニュース取得エラー:", error);
        section.innerHTML += `
            <div class="empty-message">
                お知らせの取得に失敗しました
            </div>
        `;
        return;
    }

    if (!data || data.length === 0) {
        section.innerHTML += `
            <div class="empty-message">
                最近のお知らせはありません
            </div>
        `;
        return;
    }

    list.innerHTML = data.map(itemHTML).join("");
}

function itemHTML(n) {
    const date = new Date(n.created_at).toLocaleDateString("ja-JP");

    return `
        <li class="news-item">
            <div class="news-date">${date}</div>
            <div class="news-title">${n.title}</div>
            ${
                n.url
                    ? `<div class="news-link"><a href="${n.url}">${n.link_text ?? "詳しくはこちら"}</a></div>`
                    : ""
            }
        </li>
    `;
}
