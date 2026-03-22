const supabase = supabase.createClient(
  "https://YOUR-PROJECT.supabase.co",
  "YOUR-PUBLIC-ANON-KEY"
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
