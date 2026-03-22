// Supabase クライアントを作成
const client = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// すでにログイン済みなら top.html へ
client.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "/pages/admin/top.html";
  }
});

// ログイン処理
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  // 入力チェック
  if (!email || !password) {
    errorBox.textContent = "メールアドレスとパスワードを入力してください";
    return;
  }

  // ログイン実行
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorBox.textContent = `ログインに失敗しました：${error.message}`;
    return;
  }

  // ログイン成功
  window.location.href = "/pages/admin/top.html";
});
