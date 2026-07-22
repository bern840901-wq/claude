# 上線指南 — 方案 B（一鍵部署版）

這個倉庫現在**就是完整的網站**，結構：

```
index.html      ← 你的原站（單檔版，原樣）      → twkrpuente.web.app/
world/          ← scroll-world 電影頁＋全部影片  → twkrpuente.web.app/world/
firebase.json   ← Firebase 設定（已寫好）
.firebaserc     ← 專案代號（預設 twkrpuente，見下方確認方式）
```

## 部署步驟（你的電腦，5 個指令）

1. 下載整個倉庫：GitHub 頁面 → 綠色 **Code** 按鈕 → **Download ZIP** → 解壓

2. 打開終端機，進入解壓出來的資料夾（把路徑換成你實際的位置）：

   ```bash
   cd ~/Downloads/claude-claude-scroll-world-skill-setup-hkgxfz
   ```

3. 安裝 Firebase 工具（裝過一次就不用再裝）：

   ```bash
   npm install -g firebase-tools
   ```

4. 登入 Google 帳號（會開瀏覽器，跟 Higgsfield 那次一樣的流程）：

   ```bash
   firebase login
   ```

5. 部署：

   ```bash
   firebase deploy --only hosting
   ```

完成後打開：
- `https://twkrpuente.web.app/` → 原站，應該跟現在一模一樣
- `https://twkrpuente.web.app/world/` → 電影頁 🎬

## 如果第 5 步報「找不到專案 / Invalid project」

你的專案代號可能不是 `twkrpuente`。執行：

```bash
firebase projects:list
```

找到你的專案 ID（Project ID 欄），然後：

```bash
firebase use <你的專案ID>
firebase deploy --only hosting
```

## 給原站加入口按鈕（可選）

原站想加「▶ 走進我的工作現場」按鈕連到 `/world/` 的話，把原站單檔傳給
Claude 說「幫我加 world 入口按鈕」即可（原站是打包檔，手改不方便）。

## 上線後檢查

- [ ] 原站首頁一切如常（介紹動畫、作品集、聯繫）
- [ ] /world/ 桌機：橋動畫開場 → 7 景一鏡到底
- [ ] /world/ 手機：直式影片（非橫式裁切）、滑動順暢
- [ ] /world/ 頂欄「查看作品集 ↗」→ 回原站；結尾「洽詢合作」→ 開信箱
