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
  }, 3000);
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
