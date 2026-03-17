import { matches } from "../data/matches.js";

document.addEventListener("DOMContentLoaded", () => {
    renderMatchResults();
});

function renderMatchResults() {
    const tbody = document.getElementById("results-body");

    const results = matches
        .filter(m => m.result !== null)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

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
