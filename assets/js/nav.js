export function initNavigation() {
    const hamburger = document.getElementById("hamburger");
    const sideNav = document.getElementById("side-nav");

    if (!hamburger || !sideNav) {
        console.warn("nav.js: 必要な要素が見つかりませんでした");
        return;
    }

    // 初期状態を必ず閉じる
    closeNav();

    // ハンバーガー開閉
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation(); // 外側クリック判定を防ぐ
        toggleNav();
    });

    // 外側クリックで閉じる（pointerdown の方がスマホで安定）
    document.addEventListener("pointerdown", (e) => {
        const insideNav = sideNav.contains(e.target);
        const insideHamburger = hamburger.contains(e.target);

        if (!insideNav && !insideHamburger) {
            closeNav();
        }
    }, true); // キャプチャフェーズで実行

    // メニュー内リンククリック時は閉じる（遅延）
    sideNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            setTimeout(() => closeNav(), 50);
        });
    });

    function toggleNav() {
        const isOpen = sideNav.classList.toggle("open");
        hamburger.classList.toggle("active", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "auto";
    }

    function closeNav() {
        sideNav.classList.remove("open");
        hamburger.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}
