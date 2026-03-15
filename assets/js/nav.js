/**
 * nav.js
 * ハンバーガーメニューとサイドナビの制御を担当
 * header.html 読み込み後に initNavigation() が呼ばれる前提
 */

export function initNavigation() {
    const hamburger = document.getElementById("hamburger");
    const sideNav = document.getElementById("side-nav");

    if (!hamburger || !sideNav) {
        console.warn("nav.js: 必要な要素が見つかりませんでした");
        return;
    }

    // 開閉処理
    hamburger.addEventListener("click", () => {
        sideNav.classList.toggle("open");
        hamburger.classList.toggle("active");
    });

    // サイドナビ外をクリックしたら閉じる
    document.addEventListener("click", (e) => {
        const clickedInsideNav = sideNav.contains(e.target);
        const clickedHamburger = hamburger.contains(e.target);

        if (!clickedInsideNav && !clickedHamburger) {
            sideNav.classList.remove("open");
            hamburger.classList.remove("active");
        }
    });
}
