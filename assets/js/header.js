import { initNavigation } from "../assets/js/nav.js";

document.addEventListener("DOMContentLoaded", () => {
    const headerSection = document.getElementById("header-section");

    fetch("/components/header.html")
        .then(res => res.text())
        .then(html => {
            headerSection.innerHTML = html;

            // DOM が確実に描画されるまで少し待つ
            requestAnimationFrame(() => {
                safeInitNavigation();
            });
        })
        .catch(err => console.error("ヘッダー読み込みエラー:", err));
});

/**
 * nav.js の初期化を安全に行うためのラッパー関数
 * スマホでの描画遅延に備えて再試行する
 */
function safeInitNavigation(retry = 0) {
    const hamburger = document.getElementById("hamburger");
    const sideNav = document.getElementById("side-nav");

    if (hamburger && sideNav) {
        initNavigation();
        return;
    }

    // 最大5回まで再試行（約80ms）
    if (retry < 5) {
        setTimeout(() => safeInitNavigation(retry + 1), 16);
    } else {
        console.warn("nav.js: 初期化できませんでした（要素が見つからない）");
    }
}
