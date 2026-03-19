// assets/js/matches.js
import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
});

async function loadMatches() {
    const scheduleBody = document.getElementById("schedule-body");
    const resultsBody = document.getElementById("results-body");

    if (!scheduleBody || !resultsBody) {
        console.error("HTML に #schedule-body または #results-body がありません");
        return;
    }

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .order("kickoff", { ascending: true });

    if (error) {
        console.error("試合データ取得エラー:", error);
        scheduleBody.innerHTML = `<tr><td colspan="4">試合データの取得に失敗しました</td></tr>`;
        resultsBody.innerHTML = `<tr><td colspan="3">試合データの取得に失敗しました</td></tr>`;
        return;
    }

    if (!data || data.length === 0) {
        scheduleBody.innerHTML = `<tr><td colspan="4">今シーズンの試合は終了しました！</td></tr>`;
        resultsBody.innerHTML = `<tr><td colspan="3">試合結果はありません</td></tr>`;
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    // 予定（result が null）
    const upcoming = data.filter(m => m.result === null && m.date >= today);

    // 結果（result が win/lose/draw）
    const results = data.filter(m => m.result !== null);

    scheduleBody.innerHTML = upcoming.map(renderScheduleRow).join("");
    resultsBody.innerHTML = results.map(renderResultRow).join("");
}

function renderScheduleRow(m) {
    const date = new Date(m.date).toLocaleDateString("ja-JP");

    return `
        <tr>
            <td>${date}</td>
            <td>${m.kickoff}</td>
            <td>${m.location}</td>
            <td>${m.opponent}</td>
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
            <td>${label} ${m.score_for} - ${m.score_against}</td>
            <td>${m.opponent}</td>
        </tr>
    `;
}
