document.addEventListener("DOMContentLoaded", () => {
    initUpcomingMatches();
    initBackToTop();
});

/* ================================
   初期化処理
================================ */
function initUpcomingMatches() {
    const upcoming = getUpcomingMatches();
    const section = document.getElementById("upcoming-matches");

    if (upcoming.length === 0) {
        renderNoUpcomingMessage(section);
        return;
    }

    renderUpcomingTable(upcoming);
    setupShowMoreButton(upcoming);
}

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