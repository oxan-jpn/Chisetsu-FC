// 共通ヘッダー（components/header.html）を読み込んで #site-header に差し込む。
// このスクリプト自身の URL からサイトのルートを求めるため、
// ページの階層（pages/、pages/news/、pages/admin/）を問わず動作する。
(function () {
    var mount = document.getElementById("site-header");
    if (!mount) return;

    var script = document.querySelector('script[src*="site-header.js"]');
    if (!script) return;
    var root = script.src.replace(/assets\/js\/site-header\.js([?#].*)?$/, "");

    fetch(root + "components/header.html")
        .then(function (res) {
            if (!res.ok) throw new Error("header load failed: " + res.status);
            return res.text();
        })
        .then(function (html) {
            mount.innerHTML = html;
        })
        .catch(function () {
            // ヘッダーが読み込めなくても本文は表示する（高さだけ確保された状態になる）
        });
})();
