# scroll-world 渲染管線 — 游宏斌作品集「一鏡到底」版

網站本體（`../index.html`）已經完成並以佔位圖預覽。這個資料夾是把 7 個場景
換成 Higgsfield 實景影片的完整管線。

## 架構（scroll-world skill：Architecture A）

**連續前進長鏡頭**：一台攝影機從機場出發，穿過 7 個專業口譯場景，永遠向前、
一鏡到底。每一段（leg）的起始畫格 = 上一段**實際渲染的最後一格**，因此接縫
逐格吻合、沒有任何剪接。沒有 connector（俯衝式才需要）。

場景順序（與 `../world-config.js` 的 `scenes` 一致）：

| # | id | 場景 | 文案來源（皆網站原文） |
|---|----|------|------------------------|
| 1 | bridge | 日出機場出發大廳 | tagline / 相通 / lede / heroTrust |
| 2 | gov | 政府雙邊會談廳 | 政府・官方場合 + 政府訪團回饋 |
| 3 | biz | 工廠技術談判室 | 商務・技術談判 + 韓國企業回饋 |
| 4 | media | 電視攝影棚 | 媒體・影視採訪 + 三立《消失的國界》側記 |
| 5 | expo | 國際展會大廳 | 展會・文化活動 + 貿易媒合機構回饋 |
| 6 | study | 黃昏書房・口譯筆記 | 口譯筆記三段文案 |
| 7 | contact | 首爾夜景辦公室 | 一起把話，說清楚。+ 聯繫資訊 |

## 前置需求

- `higgsfield` CLI（`npm i -g @higgsfield/cli`）、`ffmpeg`、`jq`、`curl`
- **認證**：`higgsfield auth login`（瀏覽器 OAuth，需在有瀏覽器的機器上執行）。
  在雲端 session 渲染的話：本機登入後把認證檔複製過來
  （預設路徑見 `higgsfield auth token` 成功後的設定目錄；可用環境變數
  `HIGGSFIELD_CONFIG_PATH` 指向複製過來的檔案）。
- 確認額度：`higgsfield workspace list`

## 預估費用（渲染前先跑一張圖＋一支影片校準！）

skill 觀察值（2026-07，plus 方案）：靜圖 ≈ 15 credits、標準影片 ≈ 40–55。

| 項目 | 數量 | 估計 |
|---|---|---|
| 桌機：靜圖 7 + legs 7 | 14 | ~105 + ~280–385 |
| 手機：9:16 靜圖 7 + legs 7 | 14 | ~105 + ~280–385 |
| 重roll餘裕 ~15%（室內場景易誤觸 NSFW 過濾） | — | ~115–150 |
| **總計** | | **≈ 890–1130 credits** |

省錢路線：先用 `VMODEL=seedance_2_0_mini`（約 ¼ 價）跑完整條鏈當 previz，
確認運鏡與接縫後，只把定案的 legs 用 `seedance_2_0` 重渲。

## 執行順序

```bash
cd pipeline

# 1. 校準費用：先單獨跑一張靜圖，前後 diff `higgsfield workspace list`
bash render-desktop.sh stills        # 7 張 3:2 靜圖（並行）
# → 人工檢查 work/still_*.png 是否同一個世界（同色調、同光線）；歪掉的單張重跑

# 2. 桌機 legs（嚴格循序，約 1-2 小時，建議 detach 執行）
bash render-desktop.sh legs
# → 每段結束會輸出 work/check_<name>.png（該段最後一格）：
#   必須看起來像「平穩前進滑行中」的一格；不像就重roll該段再往下——
#   壞的交接格會毒害之後所有段。

# 3. 手機原生 9:16 鏈（獨立的直式鏈，絕不能拿橫式來裁）
bash render-mobile.sh stills && bash render-mobile.sh legs

# 4. 編碼 + 海報 + 切換
bash encode.sh
# 然後把 ../world-config.js 第一行改為：window.USE_PLACEHOLDERS = false;
```

單段重roll：`bash render-desktop.sh leg media`（自動取上一段最後一格當起點）。

**NSFW 誤判**（Seedance 對室內場景很敏感）：腳本已自動重試 3 次；仍失敗時
`VMODEL=kling3_0 bash render-desktop.sh leg <name>`（換供應商的過濾器通常會過，
單段輕微畫風差異在 0.08 crossfade 下可接受）。

## QA 清單（skill Step 8，別跳過）

- 每個接縫前後截圖必須幾乎逐格相同（用 headless browser 捲到接縫兩側比對）。
- Console 無錯誤；`video.seekable.end(0) > 0`（blob 生效）；`currentTime` 跟著捲動走。
- 手機（真機或模擬 + CPU 4–6× throttle）：快速滑動不凍結；第一景海報即顯、
  一捲動影片就接手（iOS Safari 特別要測）；Network 面板確認手機吃到 `-m.mp4`
  且 `videoWidth < videoHeight`（原生直式）；URL bar 收合頁面不跳動；轉向重排正常。
- `prefers-reduced-motion`：退回靜圖淡接，不載入影片。
- 四語切換：文案換、影片鏈不動。

## 檔案對應

編碼輸出 → 網站讀取路徑（`world-config.js` 已預先接好，無需改路徑）：

```
assets/vid/<id>.mp4        桌機 leg（1080p, g8, crf20）
assets/vid/<id>-m.mp4      手機 leg（720 寬直式, g4, crf23）
assets/stills/<id>.webp    桌機海報（= leg 第一格）
assets/stills/<id>-m.webp  手機直式海報（= 直式 leg 第一格）
```
