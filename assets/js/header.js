import { initNavigation } from "../assets/js/nav.js";

document.addEventListener("DOMContentLoaded", () => {
    const headerSection = document.getElementById("header-section");

    fetch("/components/header.html")
        .then(res => res.text())
        .then(html => {
            headerSection.innerHTML = html;

            // ヘッダー読み込み後にナビゲーション初期化
            initNavigation();
        })
        .catch(err => console.error("ヘッダー読み込みエラー:", err));
});
