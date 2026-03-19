document.addEventListener("DOMContentLoaded", () => {
    initBackToTop();
});

/* ================================
   ページトップへ戻る
================================ */
function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    // 最初は非表示
    backToTop.style.display = "none";

    // スクロール量に応じて表示・非表示
    window.addEventListener("scroll", () => {
        const threshold = window.innerHeight; // ← ウィンドウ高さ100%
        if (window.scrollY > threshold) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    });

    // スムーススクロール
    backToTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
