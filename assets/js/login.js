// Supabase クライアントを作成
const client = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// すでにログイン済みなら top.html へ
client.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "/Chisetsu-FC/pages/admin/top.html";
  }
});

// Supabase のエラーを、利用者向けの日本語の定型文に置き換える
function loginErrorMessage(error) {
  const code = error?.code || "";
  const message = error?.message || "";

  if (code === "invalid_credentials" || message.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (code === "email_not_confirmed" || message.includes("Email not confirmed")) {
    return "メールアドレスの確認が完了していません。確認メールをご確認ください";
  }
  if (error?.name === "AuthRetryableFetchError" || message.toLowerCase().includes("fetch")) {
    return "ネットワークエラーが発生しました。通信環境を確認してください";
  }
  return "ログインに失敗しました。時間をおいて再度お試しください";
}

// ログイン処理
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");

  // 入力チェック（エラー表示は他画面と共通のインライン表示を使う）
  if (!email || !password) {
    showInlineMessage("メールアドレスとパスワードを入力してください");
    return;
  }

  clearInlineMessage();

  // --- ログイン中 UI（多重クリック防止） ---
  loginBtn.disabled = true;
  loginBtn.classList.add("loading");
  loginBtn.innerHTML = `<span class="spinner"></span> ログイン中...`;

  // ログイン実行
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  // --- ログイン失敗 ---
  if (error) {
    showInlineMessage(loginErrorMessage(error));

    // ボタンを元に戻す
    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");
    loginBtn.textContent = "ログイン";

    return;
  }

  // --- ログイン成功 ---
  window.location.href = "/Chisetsu-FC/pages/admin/top.html";
});
