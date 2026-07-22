# 游宏斌作品集 — scroll-world 電影頁

原站 [twkrpuente.web.app](https://twkrpuente.web.app/) 的「scroll-world」姊妹頁：
捲動即推動一台攝影機，從日出機場出發，一鏡到底穿過 7 個真實口譯工作場景
（政府會談廳 → 技術談判室 → 電視攝影棚 → 展會大廳 → 口譯筆記書房 → 首爾夜景收尾）。

- **文案 100% 原站原文**（中／韓／英／西四語，右下角切換；切語言只換文字，鏡頭不動）
- **實景影片已完成**：桌機 16:9 七支（1080p）＋手機原生 9:16 七支（Veo 3.1 生成，逐格鎖接縫）
- **原站印章語言已移植**：手繪橋開場動畫、譯~역 印章 logo、蓋章式細節
- 架構採**方案 A**：電影頁當首頁（本倉庫根目錄），原站完整保存在 `home/`（見 `DEPLOY.md`）
- 自動偵測瀏覽器語言（zh/ko/en/es）、Google Analytics 與原站同一組（G-NVSBEEP9CR）

## 檔案

| 檔案 | 說明 |
|---|---|
| `index.html` | 電影頁入口：開場動畫、hero 同步原站、語言偵測、GA |
| `scrub-engine.js` | scroll-world 捲動引擎（skill 原版，未改） |
| `world-config.js` | 7 景設定 + 四語文案（自原站字典逐字生成，勿手改文案） |
| `assets/vid/*.mp4` | 桌機 16:9（`<id>.mp4`）＋手機 9:16（`<id>-m.mp4`）鏡頭鏈 |
| `assets/stills/` | 各景海報（= 影片第一格）＋早期佔位插畫（ph-*.svg） |
| `home/index.html` | 原站完整單檔（新位置 twkrpuente.web.app/home/） |
| `pipeline/` | 當初的 Higgsfield 渲染管線（prompts、腳本、QA 清單），留檔備用 |
| `DEPLOY.md` | 上線步驟（Firebase）＋原站入口按鈕貼片 |

## 本機預覽

```bash
npx http-server -p 8080
# open http://localhost:8080/?lang=zh   (zh / ko / en / es)；原站在 /home/
```

## 製作記事

- 桌機與手機是兩條獨立渲染的鏡頭鏈（手機非裁切），皆採 Architecture A
  連續前進長鏡頭：每段起始畫格 = 上一段實際渲染的最後一格
- 影片由 Google Flow（Veo 3.1）人工接力生成，共 20 支（含重roll），
  Higgsfield credits 僅在初期校準時花費 7 點
