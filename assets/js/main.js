import { matches } from "../data/matches.js";

document.addEventListener("DOMContentLoaded", () => {
    renderUpcomingMatches();
});

function renderUpcomingMatches() {
    const tbody = document.getElementById("schedule-body");
    const showMoreBtn = document.getElementById("show-more");

    const today = new Date();

    // 今日以降の試合だけ抽出
    const upcoming = matches.filter(m => new Date(m.date) >= today);

    // 日付順にソート
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 最初の3件だけ表示
    const initial = upcoming.slice(0, 3);

    tbody.innerHTML = initial.map(rowHTML).join("");

    // 3件より多い場合は「もっと見る」表示
    if (upcoming.length > 3) {
        showMoreBtn.style.display = "block";

        showMoreBtn.onclick = () => {
            tbody.innerHTML = upcoming.map(rowHTML).join("");
            showMoreBtn.style.display = "none";
        };
    }
}

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
