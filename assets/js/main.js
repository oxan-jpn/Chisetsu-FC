document.addEventListener("DOMContentLoaded", () => {
    initBackToTop();
});

/* ================================
   ページトップへ戻る
================================ */
function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    // スクロール量に応じて表示・非表示
    window.addEventListener("scroll", () => {
        const threshold = window.innerHeight; // ← ウィンドウ高さ100%

        if (window.scrollY > threshold) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
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
