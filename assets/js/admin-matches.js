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

const yearSelect = document.getElementById("yearSelect");

const modeRadios = document.querySelectorAll("input[name='mode']");
const createSection = document.getElementById("createSection");
const editSection = document.getElementById("editSection");
const deleteSection = document.getElementById("deleteSection");

const createDateInput = document.getElementById("createDate");
const createKickoffInput = document.getElementById("createKickoff");
const createOpponentSelect = document.getElementById("createOpponent");
const createLocationInput = document.getElementById("createLocation");
const createScoreForInput = document.getElementById("createScoreFor");
const createScoreAgainstInput = document.getElementById("createScoreAgainst");
const createResultSelect = document.getElementById("createResult");
const createNoteInput = document.getElementById("createNote");
const createSubmitButton = document.getElementById("createSubmit");

const editSelect = document.getElementById("editSelect");
const editDateInput = document.getElementById("editDate");
const editKickoffInput = document.getElementById("editKickoff");
const editOpponentSelect = document.getElementById("editOpponent");
const editLocationInput = document.getElementById("editLocation");
const editScoreForInput = document.getElementById("editScoreFor");
const editScoreAgainstInput = document.getElementById("editScoreAgainst");
const editResultSelect = document.getElementById("editResult");
const editNoteInput = document.getElementById("editNote");
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
// 状態
// ==============================
let allMatches = [];
let pendingDeleteId = null;

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

  // 全データ取得
  await loadAllMatches();

  // 年度セレクト生成
  populateYearSelect();

  // 初期年度の opponent セレクト生成
  updateOpponentSelects();

  // イベント登録
  yearSelect.addEventListener("change", updateOpponentSelects);

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
// データ取得
// ==============================
async function loadAllMatches() {
  const { data, error } = await supabaseClient
    .from("matches")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error(error);
    showInlineMessage("試合データの取得に失敗しました");
    return;
  }

  allMatches = data || [];
}

// ==============================
// 年度セレクト
// ==============================
function populateYearSelect() {
  yearSelect.innerHTML = "";

  const years = [...new Set(allMatches.map(m => m.date.slice(0, 4)))].sort();

  years.forEach(year => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = `${year}年度`;
    yearSelect.appendChild(opt);
  });
}

// ==============================
// opponent セレクト更新
// ==============================
function updateOpponentSelects() {
  const selectedYear = yearSelect.value;

  const filtered = allMatches.filter(m => m.date.startsWith(selectedYear));
  const uniqueOpponents = [...new Set(filtered.map(m => m.opponent))];

  // create
  createOpponentSelect.innerHTML = "";
  uniqueOpponents.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    createOpponentSelect.appendChild(opt);
  });

  // edit
  editOpponentSelect.innerHTML = "";
  uniqueOpponents.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    editOpponentSelect.appendChild(opt);
  });

  // delete / edit の試合一覧も年度で更新
  populateMatchSelects();
}

// ==============================
// 試合一覧セレクト（edit / delete）
// ==============================
function populateMatchSelects() {
  const selectedYear = yearSelect.value;

  const filtered = allMatches.filter(m => m.date.startsWith(selectedYear));

  // edit
  editSelect.innerHTML = "";
  filtered.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.date} / ${m.opponent}`;
    editSelect.appendChild(opt);
  });

  // delete
  deleteSelect.innerHTML = "";
  filtered.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.date} / ${m.opponent}`;
    deleteSelect.appendChild(opt);
  });

  // 初期選択の試合をフォームに反映
  if (editSelect.value) fillEditForm(editSelect.value);
  editSelect.addEventListener("change", () => {
    if (editSelect.value) fillEditForm(editSelect.value);
  });
}

// ==============================
// モード切り替え
// ==============================
function handleModeChange() {
  const mode = getCurrentMode();
  clearInlineMessage();
  hideAllSections();

  if (mode === "create") {
    createSection.hidden = false;
  } else if (mode === "edit") {
    editSection.hidden = false;
  } else if (mode === "delete") {
    deleteSection.hidden = false;
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

// ==============================
// 新規登録
// ==============================
async function handleCreateSubmit() {
  clearInlineMessage();

  const date = createDateInput.value;
  const opponent = createOpponentSelect.value;

  if (!date || !opponent) {
    showInlineMessage("必須項目が未入力です");
    return;
  }

  const payload = {
    date,
    kickoff: createKickoffInput.value || null,
    opponent,
    location: createLocationInput.value || null,
    score_for: createScoreForInput.value ? Number(createScoreForInput.value) : null,
    score_against: createScoreAgainstInput.value ? Number(createScoreAgainstInput.value) : null,
    result: createResultSelect.value || null,
    note: createNoteInput.value || null
  };

  const { error } = await supabaseClient.from("matches").insert(payload);

  if (error) {
    console.error(error);
    showInlineMessage("登録に失敗しました");
    return;
  }

  showToast("登録しました");
  resetCreateForm();

  await loadAllMatches();
  updateOpponentSelects();
}

function resetCreateForm() {
  createDateInput.value = "";
  createKickoffInput.value = "";
  createLocationInput.value = "";
  createScoreForInput.value = "";
  createScoreAgainstInput.value = "";
  createResultSelect.value = "";
  createNoteInput.value = "";
}

// ==============================
// 修正
// ==============================
async function fillEditForm(id) {
  clearInlineMessage();

  const match = allMatches.find(m => m.id == id);
  if (!match) return;

  editDateInput.value = match.date;
  editKickoffInput.value = match.kickoff || "";
  editOpponentSelect.value = match.opponent;
  editLocationInput.value = match.location || "";
  editScoreForInput.value = match.score_for ?? "";
  editScoreAgainstInput.value = match.score_against ?? "";
  editResultSelect.value = match.result || "";
  editNoteInput.value = match.note || "";
}

async function handleEditSubmit() {
  clearInlineMessage();

  const id = editSelect.value;
  if (!id) {
    showInlineMessage("修正する試合を選択してください");
    return;
  }

  const payload = {
    date: editDateInput.value,
    kickoff: editKickoffInput.value || null,
    opponent: editOpponentSelect.value,
    location: editLocationInput.value || null,
    score_for: editScoreForInput.value ? Number(editScoreForInput.value) : null,
    score_against: editScoreAgainstInput.value ? Number(editScoreAgainstInput.value) : null,
    result: editResultSelect.value || null,
    note: editNoteInput.value || null
  };

  const { error } = await supabaseClient
    .from("matches")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error(error);
    showInlineMessage("更新に失敗しました");
    return;
  }

  showToast("更新しました");

  await loadAllMatches();
  updateOpponentSelects();
}

// ==============================
// 削除
// ==============================
function handleDeleteClick() {
  clearInlineMessage();

  const id = deleteSelect.value;
  if (!id) {
    showInlineMessage("削除する試合を選択してください");
    return;
  }

  pendingDeleteId = id;

  const match = allMatches.find(m => m.id == id);
  modalTitle.textContent = `${match.date} / ${match.opponent}`;

  modalOverlay.style.display = "flex";
}

function closeModal() {
  modalOverlay.style.display = "none";
  pendingDeleteId = null;
}

async function handleModalConfirm() {
  if (!pendingDeleteId) {
    closeModal();
    return;
  }

  const { error } = await supabaseClient
    .from("matches")
    .delete()
    .eq("id", pendingDeleteId);

  closeModal();

  if (error) {
    console.error(error);
    showInlineMessage("削除に失敗しました");
    return;
  }

  showToast("削除しました");

  await loadAllMatches();
  updateOpponentSelects();
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
