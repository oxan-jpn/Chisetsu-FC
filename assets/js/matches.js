// assets/js/matches.js
import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
});

async function loadMatches() {
    const upcomingList = document.getElementById("upcoming-matches");
    const resultsList = document.getElementById("results-list");

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .order("kickoff", { ascending: true });

    if (error) {
        console.error("試合データ取得エラー:", error);
        return;
    }

    // 今日の日付
    const today = new Date().toISOString().split("T")[0];

    // 予定と結果に分類
    const upcoming = data.filter(m => m.date >= today && m.result === null);
    const results = data.filter(m => m.result !== null);

    // HTML 生成
    upcomingList.innerHTML = upcoming.map(matchHTML).join("");
    resultsList.innerHTML = results.map(resultHTML).join("");
}

function matchHTML(m) {
    const date = new Date(m.date).toLocaleDateString("ja-JP");

    return `
        <li class="match-item">
            <div class="match-date">${date}</div>
            <div class="match-kickoff">${m.kickoff}</div>
            <div class="match-opponent">${m.opponent}</div>
            <div class="match-place">${m.location}</div>
            <div class="match-result upcoming">予定</div>
        </li>
    `;
}

function resultHTML(m) {
    const date = new Date(m.date).toLocaleDateString("ja-JP");

    const resultLabel =
        m.result === "win"
            ? `<span class="win">勝ち</span>`
            : m.result === "lose"
            ? `<span class="lose">負け</span>`
            : `<span class="draw">引き分け</span>`;

    return `
        <li class="match-item">
            <div class="match-date">${date}</div>
            <div class="match-kickoff">${m.kickoff}</div>
            <div class="match-opponent">${m.opponent}</div>
            <div class="match-place">${m.location}</div>
            <div class="match-result">
                ${resultLabel} ${m.score_for} - ${m.score_against}
            </div>
        </li>
    `;
}
