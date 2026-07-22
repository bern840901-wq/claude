# 上線指南 — 方案 A（Cloud Shell 版）

網址規劃：

```
twkrpuente.web.app/       ← scroll-world 電影頁（新首頁）
twkrpuente.web.app/home/  ← 原站（完整作品集，內容原封不動）
```

電影頁到作品集的通道（客戶隨時可跳過電影）：
- 開場動畫下方就有「查看作品集 →」按鈕
- 頂欄常駐朱紅「查看作品集 ↗」膠囊（手機也看得到）
- 第 1 景 hero 與最後一景各有「查看作品集」CTA

## 部署步驟

**① 下載網站包**（電腦瀏覽器）
GitHub 開倉庫 → 切到分支 `claude/scroll-world-skill-setup-hkgxfz`
→ **Code → Download ZIP**（約 117MB）

**② 上傳到 Cloud Shell**：右上 ⋮ → **Upload** → 選 zip

**③ 解壓＋放進網站資料夾**（原站自動搬到 home/）：

```bash
cd ~
unzip -o -q claude-*.zip
cd ~/portfolio-site/twkrpuente
rm -rf world
cp -r ~/claude-*/home ~/claude-*/cv .
cp ~/claude-*/index.html ~/claude-*/scrub-engine.js ~/claude-*/world-config.js ~/claude-*/og.png .
cp -r ~/claude-*/assets .
ls
```

（`ls` 應該看到：`assets  cv  home  index.html  og.png  scrub-engine.js  world-config.js`）

> 注意：這一步會把根目錄的 index.html 換成電影頁 — 原站完整保存在
> `home/index.html`（zip 裡已附，跟你現在線上的版本相同）。

**④ 部署**（跟你平常同一行）：

```bash
cd ~/portfolio-site
firebase deploy --only hosting:twkrpuente --project portfolio-c3321
```

**⑤ 驗收**
- https://twkrpuente.web.app/ → 電影頁（橋動畫開場）
- https://twkrpuente.web.app/home/ → 原站作品集

## 反悔切回方案 B？

跟 Claude 說一聲即可 — 兩包檔案都在，只是對調誰當 index.html。

## 上線後檢查

- [ ] 首頁：橋動畫開場（動畫下方有「查看作品集 →」）→ 7 景一鏡到底
- [ ] 手機：直式影片、頂欄可見「查看作品集」膠囊
- [ ] 瀏覽器語言 = 韓文/英文/西文時，文案自動切換（zh 為預設）
- [ ] /home/ 原站一切如常
- [ ] Google Analytics（G-NVSBEEP9CR）兩頁都有計數
