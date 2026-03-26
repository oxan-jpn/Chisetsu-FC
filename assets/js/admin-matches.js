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
const resultSection = document.getElementById("resultSection");

const inlineMessage = document.getElementById("inlineMessage");
const toast = document.getElementById("toast");

// --- 予定入力 ---
const createDateInput = document.getElementById("createDate");
const createKickoffInput = document.getElementById("createKickoff");
const createOpponentSelect = document.getElementById("createOpponent");
const createLocationInput = document.getElementById("createLocation");
const createSubmitButton = document.getElementById("createSubmit");

// --- 予定修正 ---
const editSelect = document.getElementById("editSelect");
const editDateInput = document.getElementById("editDate");
const editKickoffInput = document.getElementById("editKickoff");
const editOpponentSelect = document.getElementById("editOpponent");
const editLocationInput = document.getElementById("editLocation");
const editSubmitButton = document.getElementById("editSubmit");

// --- 結果入力 ---
const resultSelect = document.getElementById("resultSelect");
const resultScoreForInput = document.getElementById("resultScoreFor");
const resultScoreAgainstInput = document.getElementById("resultScoreAgainst");
const resultResultSelect = document.getElementById("resultResult");
const resultSubmitButton = document.getElementById("resultSubmit");

// --- モーダル（必要最低限） ---
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalConfirmButton = document.getElementById("modalConfirm");
const modalCancelButton = document.getElementById("modalCancel");

// ==============================
// 状態
// ==============================
let allMatches = [];
let pendingAction = null;

// ==============================
// 初期化
// ==============================
init();

async function init() {
  modalOverlay.style.display = "none";

  // 認証チェック
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

  // 初期年度の予定一覧・対戦相手一覧を生成
  updateOpponentSelects();
  updateMatchSelects();

  // イベント登録
  yearSelect.addEventListener("change", () => {
    updateOpponentSelects();
    updateMatchSelects();
  });

  modeRadios.forEach((radio) => {
    radio.addEventListener("change", handleModeChange);
  });

  createSubmitButton.addEventListener("click", handleCreateSubmit);
  editSubmitButton.addEventListener("click", handleEditSubmit);
  resultSubmitButton.addEventListener("click", handleResultSubmit);

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
    .order("date", { ascending: true });

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
// 対戦相手セレクト（予定入力・予定修正）
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
}

// ==============================
// 試合一覧セレクト（予定修正・結果入力）
// ==============================
function updateMatchSelects() {
  const selectedYear = yearSelect.value;

  const filtered = allMatches.filter(m => m.date.startsWith(selectedYear));

  // 予定修正
  editSelect.innerHTML = "";
  filtered.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.date} / ${m.opponent}`;
    editSelect.appendChild(opt);
  });

  // 結果入力
  resultSelect.innerHTML = "";
  filtered.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `${m.date} / ${m.opponent}`;
    resultSelect.appendChild(opt);
  });

  // 修正フォーム初期値
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
  } else if (mode === "result") {
    resultSection.hidden = false;
  }
}

function getCurrentMode() {
  const checked = Array.from(modeRadios).find((r) => r.checked);
  return checked ? checked.value : null;
}

function hideAllSections() {
  createSection.hidden = true;
  editSection.hidden = true;
  resultSection.hidden = true;
}

// ==============================
// ① 試合予定入力（新規）
// ==============================
async function handleCreateSubmit() {
  clearInlineMessage();

  const date = createDateInput.value;
  const kickoff = createKickoffInput.value;
  const opponent = createOpponentSelect.value;
  const location = createLocationInput.value;

  if (!date || !kickoff || !opponent || !location) {
    showInlineMessage("必須項目が未入力です");
    return;
  }

  const payload = {
    date,
    kickoff,
    opponent,
    location,
    score_for: null,
    score_against: null,
    result: null
  };

  const { error } = await supabaseClient.from("matches").insert(payload);

  if (error) {
    console.error(error);
    showInlineMessage("登録に失敗しました");
    return;
  }

  showToast("試合予定を登録しました");

  createDateInput.value = "";
  createKickoffInput.value = "";
  createLocationInput.value = "";

  await loadAllMatches();
  updateOpponentSelects();
  updateMatchSelects();
}

// ==============================
// ② 試合予定修正
// ==============================
function fillEditForm(id) {
  clearInlineMessage();

  const match = allMatches.find(m => m.id == id);
  if (!match) return;

  editDateInput.value = match.date;
  editKickoffInput.value = match.kickoff || "";
  editOpponentSelect.value = match.opponent;
  editLocationInput.value = match.location || "";
}

async function handleEditSubmit() {
  clearInlineMessage();

  const id = editSelect.value;
  if (!id) {
    showInlineMessage("修正する試合を選択してください");
    return;
  }

  const date = editDateInput.value;
  const kickoff = editKickoffInput.value;
  const opponent = editOpponentSelect.value;
  const location = editLocationInput.value;

  if (!date || !kickoff || !opponent || !location) {
    showInlineMessage("必須項目が未入力です");
    return;
  }

  const payload = { date, kickoff, opponent, location };

  const { error } = await supabaseClient
    .from("matches")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error(error);
    showInlineMessage("更新に失敗しました");
    return;
  }

  showToast("試合予定を更新しました");

  await loadAllMatches();
  updateOpponentSelects();
  updateMatchSelects();
}

// ==============================
// ③ 試合結果入力（新規）
// ==============================
async function handleResultSubmit() {
  clearInlineMessage();

  const id = resultSelect.value;
  const scoreFor = resultScoreForInput.value;
  const scoreAgainst = resultScoreAgainstInput.value;
  const result = resultResultSelect.value;

  if (!id || scoreFor === "" || scoreAgainst === "" || !result) {
    showInlineMessage("必須項目が未入力です");
    return;
  }

  const payload = {
    score_for: Number(scoreFor),
    score_against: Number(scoreAgainst),
    result
  };

  const { error } = await supabaseClient
    .from("matches")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error(error);
    showInlineMessage("結果の登録に失敗しました");
    return;
  }

  showToast("試合結果を登録しました");

  resultScoreForInput.value = "";
  resultScoreAgainstInput.value = "";
  resultResultSelect.value = "";

  await loadAllMatches();
  updateMatchSelects();
}

// ==============================
// モーダル（必要最低限）
// ==============================
function closeModal() {
  modalOverlay.style.display = "none";
  pendingAction = null;
}

function handleModalConfirm() {
  closeModal();
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
