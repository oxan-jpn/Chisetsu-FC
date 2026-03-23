// ==============================
// Supabase クライアント
// ==============================
const supabaseClient = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// ==============================
// DOM 参照
// ==============================
const body = document.body;

const modeRadios = document.querySelectorAll("input[name='mode']");
const createSection = document.getElementById("createSection");
const editSection = document.getElementById("editSection");
const deleteSection = document.getElementById("deleteSection");

const createTitleInput = document.getElementById("createTitle");
const createBodyInput = document.getElementById("createBody");
const createUrlInput = document.getElementById("createUrl");
const createLinkTextInput = document.getElementById("createLinkText");
const createSubmitButton = document.getElementById("createSubmit");

const editSelect = document.getElementById("editSelect");
const editTitleInput = document.getElementById("editTitle");
const editBodyInput = document.getElementById("editBody");
const editUrlInput = document.getElementById("editUrl");
const editLinkTextInput = document.getElementById("editLinkText");
const editSubmitButton = document.getElementById("editSubmit");

const deleteSelect = document.getElementById("deleteSelect");
const deleteSubmitButton = document.getElementById("deleteSubmit");

const inlineMessage = document.getElementById("inlineMessage");
const toast = document.getElementById("toast");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalConfirmButton = document.getElementById("modalConfirm");
const modalCancelButton = document.getElementById("modalCancel");

// ==============================
// 初期化
// ==============================
init();

async function init() {
  // モーダルを確実に非表示にしておく
  modalOverlay.style.display = "none";

  // ログインチェック
  body.style.display = "none";

  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "/Chisetsu-FC/pages/admin/login.html";
    return;
  }

  body.style.display = "block";

  // モード変更イベント
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", handleModeChange);
  });

  // ボタンイベント
  createSubmitButton.addEventListener("click", handleCreateSubmit);
  editSubmitButton.addEventListener("click", handleEditSubmit);
  deleteSubmitButton.addEventListener("click", handleDeleteClick);

  modalConfirmButton.addEventListener("click", handleModalConfirm);
  modalCancelButton.addEventListener("click", closeModal);

  // 初期状態：何も選択されていない（フォーム非表示）
  hideAllSections();
}

// ==============================
// モード切り替え
// ==============================
function handleModeChange() {
  const mode = getCurrentMode();
  inlineMessage.textContent = "";

  hideAllSections();

  if (mode === "create") {
    showCreateSection();
  } else if (mode === "edit") {
    showEditSection();
  } else if (mode === "delete") {
    showDeleteSection();
  }
}

function getCurrentMode() {
  const checked = Array.from(modeRadios).find((r) => r.checked);
  return checked ? checked.value : null;
}

function hideAllSections() {
  createSection.hidden = true;
  editSection.hidden = true;
  deleteSection.hidden = true;
}

function showCreateSection() {
  createSection.hidden = false;
}

async function showEditSection() {
  editSection.hidden = false;
  await populateSelect(editSelect);
  const firstId = editSelect.value;
  if (firstId) {
    await fillEditForm(firstId);
  }
  editSelect.addEventListener(
    "change",
    () => {
      if (editSelect.value) {
        fillEditForm(editSelect.value);
      }
    },
    { once: true }
  );
}

async function showDeleteSection() {
  deleteSection.hidden = false;
  await populateSelect(deleteSelect);
}

// ==============================
// セレクト共通処理
// ==============================
async function populateSelect(selectElement) {
  selectElement.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("news")
    .select("id, title")
    .or("is_deleted.is.null,is_deleted.eq.false")
    .order("id", { ascending: false });

  if (error) {
    showInlineMessage("投稿一覧の取得に失敗しました");
    return;
  }

  if (!data || data.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "対象の投稿がありません";
    selectElement.appendChild(option);
    return;
  }

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title;
    selectElement.appendChild(option);
  });
}

// ==============================
// 新規投稿
// ==============================
async function handleCreateSubmit() {
  clearInlineMessage();

  const title = createTitleInput.value.trim();
  const body = createBodyInput.value.trim();
  const url = createUrlInput.value.trim();
  const linkText = createLinkTextInput.value.trim();

  if (!title) {
    showInlineMessage("タイトルは必須です");
    return;
  }

  const { error } = await supabaseClient.from("news").insert({
    title,
    body: body || null,
    url: url || null,
    link_text: linkText || null,
    is_deleted: false
  });

  if (error) {
    showInlineMessage("投稿に失敗しました");
    return;
  }

  showInlineMessage("投稿しました");
  resetCreateForm();
}

function resetCreateForm() {
  createTitleInput.value = "";
  createBodyInput.value = "";
  createUrlInput.value = "";
  createLinkTextInput.value = "";
}

// ==============================
// 投稿修正
// ==============================
async function fillEditForm(id) {
  clearInlineMessage();

  const { data, error } = await supabaseClient
    .from("news")
    .select("*")
    .eq("id", id)
    .or("is_deleted.is.null,is_deleted.eq.false")
    .single();

  if (error || !data) {
    showInlineMessage("投稿の取得に失敗しました");
    return;
  }

  editTitleInput.value = data.title || "";
  editBodyInput.value = data.body || "";
  editUrlInput.value = data.url || "";
  editLinkTextInput.value = data.link_text || "";
}

async function handleEditSubmit() {
  clearInlineMessage();

  const id = editSelect.value;
  if (!id) {
    showInlineMessage("修正する投稿を選択してください");
    return;
  }

  const title = editTitleInput.value.trim();
  const body = editBodyInput.value.trim();
  const url = editUrlInput.value.trim();
  const linkText = editLinkTextInput.value.trim();

  if (!title) {
    showInlineMessage("タイトルは必須です");
    return;
  }

  const { error } = await supabaseClient
    .from("news")
    .update({
      title,
      body: body || null,
      url: url || null,
      link_text: linkText || null
    })
    .eq("id", id)
    .or("is_deleted.is.null,is_deleted.eq.false");

  if (error) {
    showInlineMessage("更新に失敗しました");
    return;
  }

  showInlineMessage("更新しました");
  await populateSelect(editSelect);
}

// ==============================
// 投稿削除（論理削除）
// ==============================
let pendingDeleteId = null;
let pendingDeleteTitle = "";

function handleDeleteClick() {
  clearInlineMessage();

  const id = deleteSelect.value;
  const title =
    deleteSelect.options[deleteSelect.selectedIndex]?.textContent || "";

  if (!id) {
    showInlineMessage("削除する投稿を選択してください");
    return;
  }

  pendingDeleteId = id;
  pendingDeleteTitle = title;
  openModal(title);
}

// ==============================
// モーダル制御（安定版）
// ==============================
function openModal(title) {
  modalTitle.textContent = title;
  modalOverlay.style.display = "flex";
}

function closeModal() {
  modalOverlay.style.display = "none";
  pendingDeleteId = null;
  pendingDeleteTitle = "";
}

async function handleModalConfirm() {
  if (!pendingDeleteId) {
    closeModal();
    return;
  }

  const { error } = await supabaseClient
    .from("news")
    .update({ is_deleted: true })
    .eq("id", pendingDeleteId)
    .or("is_deleted.is.null,is_deleted.eq.false");

  closeModal();

  if (error) {
    showInlineMessage("削除に失敗しました");
    return;
  }

  // 新規投稿モードに戻す
  resetModeToCreate();
  showToast("削除しました");
}

function resetModeToCreate() {
  modeRadios.forEach((r) => {
    r.checked = r.value === "create";
  });

  hideAllSections();
  showCreateSection();
  clearInlineMessage();
}

// ==============================
// メッセージ / トースト
// ==============================
function showInlineMessage(message) {
  inlineMessage.textContent = message;
}

function clearInlineMessage() {
  inlineMessage.textContent = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("toast--visible");

  setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 3000);
}
