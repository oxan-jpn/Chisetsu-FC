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

// 年度（4月始まり）の開始年を返す。例：2027年2月 → 2026年度
function seasonOf(dateStr) {
    const year = Number(dateStr.slice(0, 4));
    const month = Number(dateStr.slice(5, 7));
    return month >= 4 ? year : year - 1;
}

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
    // 年度セレクト（過去シーズンを遡れるようにする）
    // -------------------------
    const seasonSelect = document.getElementById("season-select");
    const seasons = [...new Set(results.map(m => seasonOf(m.date)))].sort((a, b) => b - a);
    if (seasonSelect) {
        seasonSelect.innerHTML =
            `<option value="">全期間</option>` +
            seasons.map(sv => `<option value="${sv}">${sv}年度</option>`).join("");
        // 初期表示は、結果がある一番新しい年度
        seasonSelect.value = seasons.length > 0 ? String(seasons[0]) : "";
        seasonSelect.addEventListener("change", () => {
            renderResults(results, seasonSelect.value);
        });
    }

    renderResults(results, seasonSelect ? seasonSelect.value : "");
}

// 選択中の年度（空文字は全期間）で結果テーブルと戦績サマリーを描画する
function renderResults(results, selectedSeason) {
    const resultsBody = document.getElementById("results-body");
    const filtered = selectedSeason === ""
        ? results
        : results.filter(m => seasonOf(m.date) === Number(selectedSeason));

    // -------------------------
    // 戦績サマリー（結果入力済みの試合だけを集計）
    // -------------------------
    const summaryEl = document.getElementById("record-summary");
    if (summaryEl) {
        const played = filtered.filter(m => m.result !== null);
        if (played.length > 0) {
            const wins = played.filter(m => m.result === "win").length;
            const draws = played.filter(m => m.result !== "win" && m.result !== "lose").length;
            const losses = played.filter(m => m.result === "lose").length;
            const goalsFor = played.reduce((sum, m) => sum + (Number(m.score_for) || 0), 0);
            const goalsAgainst = played.reduce((sum, m) => sum + (Number(m.score_against) || 0), 0);
            summaryEl.textContent = `戦績：${wins}勝 ${draws}分 ${losses}敗（得点 ${goalsFor} / 失点 ${goalsAgainst}）`;
        } else {
            summaryEl.textContent = "";
        }
    }

    // -------------------------
    // 結果のレンダリング
    // -------------------------
    if (filtered.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="3">試合結果はありません</td></tr>`;
    } else {
        resultsBody.innerHTML = filtered.map(renderResultRow).join("");
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
