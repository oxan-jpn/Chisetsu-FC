const supabase = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
    "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// ログイン状態チェック
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "/pages/admin/login.html";
  }
})();

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
