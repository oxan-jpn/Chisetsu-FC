// すでにログイン済みなら top.html へ
supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "/Chisetsu-FC/pages/admin/top.html";
  }
});

// ログイン処理
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");
  const loginBtn = document.getElementById("loginBtn");

  // 入力チェック
  if (!email || !password) {
    errorBox.textContent = "メールアドレスとパスワードを入力してください";
    return;
  }

  // --- ログイン中 UI（多重クリック防止） ---
  loginBtn.disabled = true;
  loginBtn.classList.add("loading");
  loginBtn.innerHTML = `<span class="spinner"></span> ログイン中...`;

  // ログイン実行
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  // --- ログイン失敗 ---
  if (error) {
    errorBox.textContent = `ログインに失敗しました：${error.message}`;

    // ボタンを元に戻す
    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtn.textContent = "ログイン";

    return;
  }

  // --- ログイン成功 ---
  window.location.href = "/Chisetsu-FC/pages/admin/top.html";
});
