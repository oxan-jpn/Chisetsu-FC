const supabase = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
    "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    document.getElementById("error").textContent = "ログインに失敗しました";
    return;
  }

  // ログイン成功 → top.html へ
  window.location.href = "/admin/top.html";
});
