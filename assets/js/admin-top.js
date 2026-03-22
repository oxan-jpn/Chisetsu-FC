const supabase = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// 画面を一旦非表示（未ログインが一瞬でも見えないように）
document.body.style.display = "none";

// セッション確認（復元を待つ）
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    window.location.href = "/pages/admin/login.html";
  } else {
    // ログイン済み → 画面を表示
    document.body.style.display = "block";
  }
});

// セッション変化（ログアウトなど）にも対応
supabase.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = "/pages/admin/login.html";
  }
});

// ボタン遷移
document.getElementById("newsBtn").addEventListener("click", () => {
  window.location.href = "/pages/admin/news.html";
});

document.getElementById("matchesBtn").addEventListener("click", () => {
  window.location.href = "/pages/admin/matches.html";
});

// ログアウト
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "/pages/admin/login.html";
});
