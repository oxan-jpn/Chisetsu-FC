// components/header.html を読み込む
document.addEventListener("DOMContentLoaded", () => {
    const headerSection = document.getElementById("header-section");

    fetch("/components/header.html")
        .then(res => res.text())
        .then(html => {
            headerSection.innerHTML = html;

            // ハンバーガーメニューの動作を初期化
            initHamburgerMenu();
        })
        .catch(err => console.error("ヘッダー読み込みエラー:", err));
});

function initHamburgerMenu() {
    const hamburger = document.getElementById("hamburger");
    const sideNav = document.getElementById("side-nav");

    if (!hamburger || !sideNav) return;

    hamburger.addEventListener("click", () => {
        sideNav.classList.toggle("open");
    });
}
