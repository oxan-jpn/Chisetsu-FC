// assets/js/matches.js
import { supabase } from "./supabaseClient.js";

// HTMLエスケープ（news.js の escapeHTML と同等。null は空文字として扱う）
function escapeHTML(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

    // 会場名は Google マップ検索へのリンクにする（URL はエンコード、表示文字列はエスケープ）
    const location = m.location
        ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.location)}" target="_blank" rel="noopener">${escapeHTML(m.location)}</a>`
        : "";

    return `
        <tr>
            <td>${date}</td>
            <td>${escapeHTML(m.kickoff)}</td>
            <td>${location}</td>
            <td>${escapeHTML(m.opponent)}</td>
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
                <td>${escapeHTML(m.opponent)}</td>
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
            <td>${label} ${escapeHTML(m.score_for)} - ${escapeHTML(m.score_against)}</td>
            <td>${escapeHTML(m.opponent)}</td>
        </tr>
    `;
}
