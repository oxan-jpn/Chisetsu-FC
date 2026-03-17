// assets/js/news.js
import { newsItems } from "../data/newsList.js";

document.addEventListener("DOMContentLoaded", () => {
    renderNews();
});

function renderNews() {
    const list = document.getElementById("news-list");
    const section = document.getElementById("news-section");

    if (!newsItems || newsItems.length === 0) {
        section.innerHTML += `
            <div class="empty-message">
                最近のお知らせはありません
            </div>
        `;
        return;
    }

    list.innerHTML = newsItems.map(itemHTML).join("");
}

function itemHTML(n) {
    return `
        <li class="news-item">
            <div class="news-date">${n.date}</div>
            <div class="news-title">${n.title}</div>
            ${
                n.url
                    ? `<div class="news-link"><a href="${n.url}">${n.linkText}</a></div>`
                    : ""
            }
        </li>
    `;
}
