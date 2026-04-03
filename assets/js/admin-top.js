// Supabase クライアント
const client = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// 画面を一旦非表示
document.body.style.display = "none";

// セッション確認
client.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.href = "/Chisetsu-FC/pages/admin/login.html";
  } else {
    document.body.style.display = "block";
  }
});

// セッション変化
client.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = "/Chisetsu-FC/pages/admin/login.html";
  }
});

// ボタン遷移
document.getElementById("newsBtn").addEventListener("click", () => {
  window.location.href = "/Chisetsu-FC/pages/admin/news.html";
});

document.getElementById("matchesBtn").addEventListener("click", () => {
  window.location.href = "/Chisetsu-FC/pages/admin/matches.html";
});

// ==============================
// ログアウト（ぐるぐる付き）
// ==============================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // 多重クリック防止 + ローディング表示
  logoutBtn.disabled = true;
  logoutBtn.classList.add("loading");
  logoutBtn.innerHTML = `<span class="spinner"></span> ログアウト中…`;

  const { error } = await client.auth.signOut();

  if (error) {
    // エラー時は元に戻す
    logoutBtn.disabled = false;
    logoutBtn.classList.remove("loading");
    logoutBtn.textContent = "ログアウト";
    console.error(error);
    alert("ログアウトに失敗しました");
    return;
  }

  // 成功 → ログイン画面へ
  window.location.href = "/Chisetsu-FC/pages/admin/login.html";
});

async function showJwtDebug() {
  const { data } = await client.auth.getSession();
  const jwt = data?.session?.access_token;

  if (!jwt) {
    document.getElementById("jwtDebug").textContent = "JWT が取得できませんでした";
    return;
  }

  // JWT の payload をデコード
  const payload = JSON.parse(atob(jwt.split(".")[1]));

  document.getElementById("jwtDebug").textContent =
    "JWT Payload:\n" + JSON.stringify(payload, null, 2);
}

// 初期化後に実行
showJwtDebug();

