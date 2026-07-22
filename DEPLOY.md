# 上線指南 — 方案 B（Cloud Shell 版，照你平常的流程）

你平常的部署環境：Google Cloud Shell，專案 `portfolio-c3321`，
網站資料夾 `~/portfolio-site/twkrpuente/`（原站的 index.html 在裡面）。

## 步驟

**① 下載網站包**（電腦瀏覽器）
GitHub 開這個倉庫 → 左上角切到分支 `claude/scroll-world-skill-setup-hkgxfz`
→ 綠色 **Code** → **Download ZIP**（約 117MB）

**② 上傳到 Cloud Shell**
Cloud Shell 右上 ⋮ → **Upload** → 選剛下載的 zip

**③ 貼上這串指令**（解壓＋把 world 放進網站資料夾）

```bash
cd ~
unzip -o -q claude-*.zip
cp -r ~/claude-*/world ~/portfolio-site/twkrpuente/world
ls ~/portfolio-site/twkrpuente/world
```

（最後一行應該列出 index.html、scrub-engine.js、world-config.js、assets）

**④ 部署**（跟你平常同一行）

```bash
cd ~/portfolio-site
firebase deploy --only hosting:twkrpuente --project portfolio-c3321
```

**⑤ 驗收**
- https://twkrpuente.web.app/ → 原站，跟現在一模一樣
- https://twkrpuente.web.app/world/ → 電影頁 🎬

## 之後更新 world 的方式

重複 ①②③④ 即可（cp 會直接覆蓋舊檔）。

## 上線後檢查

- [ ] 原站首頁一切如常
- [ ] /world/ 桌機：橋動畫開場 → 7 景一鏡到底
- [ ] /world/ 手機：直式影片（非橫式裁切）、滑動順暢
- [ ] /world/ 頂欄「查看作品集 ↗」→ 回原站；結尾「洽詢合作」→ 開信箱

---

## 附：本倉庫也能整包直接部署（備用方式）

倉庫根目錄已含 firebase.json（public="."）與原站單檔 index.html，
在任何裝了 firebase-tools 的機器上 `firebase deploy --only hosting
--project portfolio-c3321` 即可整站部署。平常用上面的 Cloud Shell 流程就好。
