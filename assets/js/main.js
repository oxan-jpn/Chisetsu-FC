import { matches } from "../data/matches.js";

document.addEventListener("DOMContentLoaded", () => {
    initUpcomingMatches();
    initBackToTop();
});

/* ================================
   初期化処理
================================ */
function initUpcomingMatches() {
    const upcoming = getUpcomingMatches();
    const section = document.getElementById("upcoming-matches");

    if (upcoming.length === 0) {
        renderNoUpcomingMessage(section);
        return;
    }

    renderUpcomingTable(upcoming);
    setupShowMoreButton(upcoming);
}

function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    backToTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ================================
   試合データ処理
================================ */
function getUpcomingMatches() {
    const today = new Date();

    return matches
        .filter(m => m.result === null && new Date(m.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* ================================
   描画処理
================================ */
function renderNoUpcomingMessage(section) {
    section.innerHTML += `
        <div class="empty-message">
            今シーズンの試合はすべてしゅうりょうしました！<br>
            応援ありがとうございました！
        </div>
    `;
}

function renderUpcomingTable(upcoming) {
    const tbody = document.getElementById("schedule-body");
    const initial = upcoming.slice(0, 3);
    tbody.innerHTML = initial.map(rowHTML).join("");
}

function setupShowMoreButton(upcoming) {
    const showMoreBtn = document.getElementById("show-more");

    if (upcoming.length <= 3) return;

    showMoreBtn.style.display = "block";
    showMoreBtn.onclick = () => {
        const tbody = document.getElementById("schedule-body");
        tbody.innerHTML = upcoming.map(rowHTML).join("");
        showMoreBtn.style.display = "none";
    };
}

/* ================================
   HTML生成
================================ */
function rowHTML(m) {
    return `
        <tr>
            <td>${formatDate(m.date)}</td>
            <td>${m.kickoff}</td>
            <td>${m.place}</td>
            <td>${m.opponent}</td>
        </tr>
    `;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
