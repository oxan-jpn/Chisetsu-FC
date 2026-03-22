const supabase = supabase.createClient(
  "https://YOUR-PROJECT.supabase.co",
  "YOUR-PUBLIC-ANON-KEY"
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
