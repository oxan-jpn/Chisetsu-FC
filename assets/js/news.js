// assets/js/news.js
import { newsItems } from "../data/newsList.js";

document.addEventListener("DOMContentLoaded", () => {
    renderNews();
});

function renderNews() {
    const list = document.getElementById("news-list");
    const section = document.getElementById("news-section");

    // データがない場合
    if (!newsItems || newsItems.length === 0) {
        section.innerHTML += `
            <div class="empty-message">
                最近のお知らせはありません
            </div>
        `;
        return;
    }

    // 通常表示
    list.innerHTML = newsItems.map(itemHTML).join("");
}

function itemHTML(n) {
    if (n.url) {
        return `
            <li>
                <strong>${n.date}</strong> — 
                <a href="${n.url}">${n.title}</a>
            </li>
        `;
    }

    return `
        <li>
            <strong>${n.date}</strong> — ${n.title}
        </li>
    `;
}
