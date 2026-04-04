// ==============================
// Supabase クライアント
// ==============================
const supabaseClient = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);

// ==============================
// 空欄 → null 変換
// ==============================
function toNullable(value) {
  const v = value.trim();
  return v === "" ? null : v;
}

// ==============================
// アップロードエラーをユーザー向けに変換
// ==============================
function getUploadErrorMessage(error) {
  if (!error) return "画像のアップロードに失敗しました";

  if (error.statusCode === 413) {
    return "画像サイズが大きすぎます（上限を超えています）";
  }
  if (error.statusCode === 400) {
    return "画像形式が正しくありません（対応形式: jpg, png, webp など）";
  }
  if (error.statusCode === 401 || error.statusCode === 403) {
    return "画像アップロードの権限がありません（管理者に連絡してください）";
  }
  if (error.statusCode === 409) {
    return "同じ名前の画像がすでに存在します。別の画像名にしてください。";
  }

  if (error.message?.includes("Failed to fetch")) {
    return "ネットワークエラーが発生しました。通信環境を確認してください。";
  }

  return `画像のアップロードに失敗しました（${error.message ?? "不明なエラー"}）`;
}

// ==============================
// ボタンローディング制御
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
const createImageInput = document.getElementById("createImage");
const createSubmitButton = document.getElementById("createSubmit");

const editSelect = document.getElementById("editSelect");
const editTitleInput = document.getElementById("editTitle");
const editBodyInput = document.getElementById("editBody");
const editUrlInput = document.getElementById("editUrl");
const editLinkTextInput = document.getElementById("editLinkText");
const editImageInput = document.getElementById("editImage");
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
  modalOverlay.style.display = "none";

  body.style.display = "none";
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "/Chisetsu-FC/pages/admin/login.html";
    return;
  }
  body.style.display = "block";

  modeRadios.forEach((radio) => {
    radio.addEventListener("change", handleModeChange);
  });

  createSubmitButton.addEventListener("click", handleCreateSubmit);
  editSubmitButton.addEventListener("click", handleEditSubmit);
  deleteSubmitButton.addEventListener("click", handleDeleteClick);

  modalConfirmButton.addEventListener("click", handleModalConfirm);
  modalCancelButton.addEventListener("click", closeModal);

  hideAllSections();
}

// ==============================
// モード切り替え
// ==============================
function handleModeChange() {
  const mode = getCurrentMode();
  clearInlineMessage();
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

  editSelect.addEventListener("change", () => {
    if (editSelect.value) fillEditForm(editSelect.value);
  });
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
    console.error(error);
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
// 新規投稿（画像アップロード対応）
// ==============================
async function handleCreateSubmit() {
  clearInlineMessage();
  startButtonLoading(createSubmitButton, "投稿中…");

  const title = createTitleInput.value.trim();
  const body = toNullable(createBodyInput.value);
  const url = toNullable(createUrlInput.value);
  const linkText = toNullable(createLinkTextInput.value);
  const file = createImageInput.files[0];

  if (!title) {
    stopButtonLoading(createSubmitButton);
    showInlineMessage("タイトルは必須です");
    return;
  }

  let imageUrl = null;

if (file) {
  const filePath = `news/${Date.now()}_${file.name}`;

  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from("news-images")
    .upload(filePath, file);

  if (uploadError) {
    stopButtonLoading(createSubmitButton);
    console.error(uploadError);
    showInlineMessage(getUploadErrorMessage(uploadError));
    return;
  }

  const { data: urlData } = supabaseClient.storage
    .from("news-images")
    .getPublicUrl(filePath);

  imageUrl = urlData.publicUrl;
}


  const { error } = await supabaseClient.from("news").insert({
    title,
    body,
    url,
    link_text: linkText,
    image_url: imageUrl,
    is_deleted: false,
    published: true
  });

  stopButtonLoading(createSubmitButton);

  if (error) {
    console.error(error);
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
  createImageInput.value = "";
}

// ==============================
// 投稿修正（画像再アップロード対応）
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
    console.error(error);
    showInlineMessage("投稿の取得に失敗しました");
    return;
  }

  editTitleInput.value = data.title || "";
  editBodyInput.value = data.body || "";
  editUrlInput.value = data.url || "";
  editLinkTextInput.value = data.link_text || "";
  editImageInput.value = "";
  editImageInput.dataset.currentImage = data.image_url || "";
}

async function handleEditSubmit() {
  clearInlineMessage();
  startButtonLoading(editSubmitButton, "更新中…");

  const id = editSelect.value;
  if (!id) {
    stopButtonLoading(editSubmitButton);
    showInlineMessage("修正する投稿を選択してください");
    return;
  }

  const title = editTitleInput.value.trim();
  const body = toNullable(editBodyInput.value);
  const url = toNullable(editUrlInput.value);
  const linkText = toNullable(editLinkTextInput.value);
  const file = editImageInput.files[0];

  if (!title) {
    stopButtonLoading(editSubmitButton);
    showInlineMessage("タイトルは必須です");
    return;
  }

  let imageUrl = editImageInput.dataset.currentImage || null;

  if (file) {
    const filePath = `news/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("news-images")
      .upload(filePath, file);

    if (uploadError) {
      stopButtonLoading(editSubmitButton);
      console.error(uploadError);
      showInlineMessage(getUploadErrorMessage(uploadError));
      return;
    }

    const { data: urlData } = supabaseClient.storage
      .from("news-images")
      .getPublicUrl(filePath);

    imageUrl = urlData.publicUrl;
  }

  const { error } = await supabaseClient
    .from("news")
    .update({
      title,
      body,
      url,
      link_text: linkText,
      image_url: imageUrl,
      published: true
    })
    .eq("id", id)
    .or("is_deleted.is.null,is_deleted.eq.false");

  stopButtonLoading(editSubmitButton);

  if (error) {
    console.error(error);
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
// モーダル制御
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
    console.error(error);
    showInlineMessage("削除に失敗しました");
    return;
  }

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
