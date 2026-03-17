import { matches } from "../data/matches.js";

document.addEventListener("DOMContentLoaded", () => {
    renderMatchResults();
});

function renderMatchResults() {
    const tbody = document.getElementById("results-body");
    const section = document.getElementById("match-results");

    const results = matches
        .filter(m => m.result !== null)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // ★ データがない場合
    if (results.length === 0) {
        section.innerHTML += `
            <div class="empty-message">
                直近の試合結果はありません
            </div>
        `;
        return;
    }

    // 通常表示
    tbody.innerHTML = results.map(rowHTML).join("");
}

function rowHTML(m) {
    return `
        <tr>
            <td>${formatDate(m.date)}</td>
            <td>${m.result}</td>
            <td>${m.opponent}</td>
        </tr>
    `;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
