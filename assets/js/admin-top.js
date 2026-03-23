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

// ログアウト
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await client.auth.signOut();
  window.location.href = "/Chisetsu-FC/pages/admin/login.html";
});
