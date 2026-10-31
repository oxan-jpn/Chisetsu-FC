// ==============================
// 管理画面共通のフィードバック表示
// 成功はトースト、エラーと入力チェックはインライン表示に統一する
// ==============================
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--visible");

  setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 5000);
}

function showInlineMessage(message) {
  const inlineMessage = document.getElementById("inlineMessage");
  if (!inlineMessage) return;
  inlineMessage.textContent = message;
}

function clearInlineMessage() {
  const inlineMessage = document.getElementById("inlineMessage");
  if (!inlineMessage) return;
  inlineMessage.textContent = "";
}

// ==============================
// ボタンローディング制御（管理画面共通）
// 処理中はボタンを無効化して二重送信を防ぐ
// ==============================
function startButtonLoading(button, loadingText = "処理中…") {
  button.dataset.originalText = button.textContent;
  button.textContent = loadingText;
  button.classList.add("button--loading");
  button.disabled = true;
}

function stopButtonLoading(button) {
  button.textContent = button.dataset.originalText;
  button.classList.remove("button--loading");
  button.disabled = false;
}
