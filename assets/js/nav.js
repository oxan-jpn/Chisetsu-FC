export function initNavigation() {
    const hamburger = document.getElementById("hamburger");
    const sideNav = document.getElementById("side-nav");

    if (!hamburger || !sideNav) {
        console.warn("nav.js: 必要な要素が見つかりませんでした");
        return;
    }

    // 初期状態を閉じる
    closeNav();

    // ハンバーガー開閉
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleNav();
    });

    // 外側クリックで閉じる
    document.addEventListener("pointerdown", (e) => {
        const insideNav = sideNav.contains(e.target);
        const insideHamburger = hamburger.contains(e.target);

        if (!insideNav && !insideHamburger) {
            closeNav();
        }
    }, true);

    // メニュー内リンククリック時は閉じる
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
