// assets/js/matches.js
import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
});

async function loadMatches() {
    const scheduleBody = document.getElementById("schedule-body");
    const resultsBody = document.getElementById("results-body");

    const scheduleLoading = document.getElementById("schedule-loading");
    const resultsLoading = document.getElementById("results-loading");

    const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true })
        .order("kickoff", { ascending: true });

    // ローディング削除
    scheduleLoading.remove();
    resultsLoading.remove();

    if (error || !data) {
        scheduleBody.innerHTML = `<tr><td colspan="4">取得に失敗しました</td></tr>`;
        resultsBody.innerHTML = `<tr><td colspan="3">取得に失敗しました</td></tr>`;
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    // -------------------------
    // 予定の分類
    // -------------------------
    const upcoming = data.filter(m => {
        return m.result === null && m.date >= today;
    });

    // -------------------------
    // 結果の分類
    // -------------------------
    const results = data.filter(m => {
        // result が null でも、日付が過去なら「結果なし」として結果テーブルへ
        if (m.result === null && m.date < today) return true;
        return m.result !== null;
    });

    // -------------------------
    // 予定のレンダリング
    // -------------------------
    if (upcoming.length === 0) {
        scheduleBody.innerHTML = `<tr><td colspan="4">現在予定されている試合はありません</td></tr>`;
    } else {
        scheduleBody.innerHTML = upcoming.map(renderScheduleRow).join("");
    }

    // -------------------------
    // 結果のレンダリング
    // -------------------------
    if (results.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="3">試合結果はありません</td></tr>`;
    } else {
        resultsBody.innerHTML = results.map(renderResultRow).join("");
    }
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

    // result が null の場合は「未入力」
    if (m.result === null) {
        return `
            <tr>
                <td>${date}</td>
                <td>未入力</td>
                <td>${m.opponent}</td>
            </tr>
        `;
    }

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
