// ==============================
// 管理画面共通の Supabase クライアント
// 各管理画面の <head> で Supabase CDN の直後に読み込む
// ==============================
const supabaseClient = supabase.createClient(
  "https://jyzborkzgcmcqousqopx.supabase.co",
  "sb_publishable_7jkxGmH3RbdzMAU5cPlTBg_LiVad7Aw"
);
