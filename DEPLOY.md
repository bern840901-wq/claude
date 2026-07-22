# 上線指南 — 方案 B（原站當首頁，world 掛子頁）

網址規劃：

```
twkrpuente.web.app/        ← 你的原站（完全不動）
twkrpuente.web.app/world/  ← scroll-world 電影頁（本倉庫的 world/ 資料夾）
```

## 部署步驟（在你自己的電腦）

1. 下載本倉庫（或只下載 `world/` 資料夾）：
   GitHub 頁面 → Code → Download ZIP，解壓。

2. 找到你平常部署 Firebase 用的資料夾（`firebase.json` 所在的專案；
   裡面通常有一個 `public/` 或 `dist/` 資料夾，放著你原站的檔案）。

3. 把整個 `world/` 資料夾複製進那個 public 資料夾裡：

   ```
   public/
     index.html      ← 原站（不動）
     ...
     world/          ← 新增這整包
       index.html
       scrub-engine.js
       world-config.js
       assets/
   ```

4. 部署：

   ```bash
   firebase deploy --only hosting
   ```

5. 打開 `https://twkrpuente.web.app/world/` 驗收。

## 給原站加入口按鈕（可選，隨時可做）

在原站 hero 區塊加一顆按鈕（樣式沿用你原站的 CTA 風格）：

```html
<a href="/world/" style="display:inline-flex;align-items:center;gap:8px;
   font-family:'Space Mono',monospace;font-size:14px;letter-spacing:.06em;
   color:#EDE6D5;background:#14110D;border:2px solid #E8410E;
   border-radius:9px;padding:12px 20px;text-decoration:none">
  ▶ 走進我的工作現場 · SCROLL THE WORLD
</a>
```

四語版文字建議（沿用你站上的語感）：
- zh：`▶ 走進我的工作現場`
- ko：`▶ 현장 속으로`
- en：`▶ Walk through my world`
- es：`▶ Recorre mi mundo`

## 檢查清單（上線後）

- [ ] 桌機打開 /world/：開場橋動畫 → 捲動推鏡頭，7 景無跳接
- [ ] 手機打開 /world/：直式影片（非橫式裁切）、快速滑動不凍結
- [ ] 右下角四語切換正常
- [ ] 頂欄「查看作品集 ↗」回原站；結尾「洽詢合作」開信箱
- [ ] Firebase hosting 免費額度：world/ 資產約 116MB，注意流量用量
