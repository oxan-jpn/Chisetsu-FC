// assets/js/matches.js
import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
});

async function loadMatches() {
    const upcomingBody = document.getElementById("upcoming-matches");
    const resultsBody = document.getElementById("results-list");

    if (!upcomingBody || !resultsBody) {
        console.error("HTML に #upcoming-matches または #results-list がありません");
        return;
    }

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .order("kickoff", { ascending: true });

    if (error) {
        console.error("試合データ取得エラー:", error);
        upcomingBody.innerHTML = `<tr><td colspan="5">試合データの取得に失敗しました</td></tr>`;
        resultsBody.innerHTML = `<tr><td colspan="5">試合データの取得に失敗しました</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        upcomingBody.innerHTML = `<tr><td colspan="5">今年の試合は全て終了しました！<br>
        応援いただきありがとうございました！</td></tr>`;
        resultsBody.innerHTML = `<tr><td colspan="5">試合結果はありません</td></tr>`;
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    const upcoming = data.filter(m => m.result === null && m.date >= today);
    const results = data.filter(m => m.result !== null);

    upcomingBody.innerHTML = upcoming.map(renderUpcomingRow).join("");
    resultsBody.innerHTML = results.map(renderResultRow).join("");
}

function renderUpcomingRow(m) {
    const date = new Date(m.date).toLocaleDateString("ja-JP");

    return `
        <tr>
            <td>${date}</td>
            <td>${m.kickoff}</td>
            <td>${m.opponent}</td>
            <td>${m.location}</td>
            <td class="upcoming">予定</td>
        </tr>
    `;
}

function renderResultRow(m) {
    const date = new Date(m.date).toLocaleDateString("ja-JP");

    const label =
        m.result === "win"
            ? `<span class="win">勝ち</span>`
            : m.result === "lose"
            ? `<span class="lose">負け</span>`
            : `<span class="draw">引き分け</span>`;

    return `
        <tr>
            <td>${date}</td>
            <td>${m.kickoff}</td>
            <td>${m.opponent}</td>
            <td>${m.location}</td>
            <td>${label} ${m.score_for} - ${m.score_against}</td>
        </tr>
    `;
}
