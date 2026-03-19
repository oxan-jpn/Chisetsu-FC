document.addEventListener("DOMContentLoaded", () => {
    initBackToTop();
});

/* ================================
   ページトップへ戻る
================================ */
function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    if (!backToTop) return;

    backToTop.addEventListener("click", (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
