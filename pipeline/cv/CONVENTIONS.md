# 案件記錄規範（CV 四語版 × 網站時間軸 × 精選卡）

適用對象：`pipeline/cv/cv_data.json` 的 `TL`（繁中／韓／英）與 `TLES`（西）、`home/index.html` 內的 `TL`／`TLES` 與精選卡 `title`。
四處用詞必須一致：CV 列 = 網站時間軸列；精選卡標題可較長，但機關名稱與縮寫須相同。

## 1. 機關國別標示（2026-10-21 定案，依全站既有寫法統一）

讀該語言的人，不認識這個機關也要能從這一列看出它是哪一國的。

| 機關所在國 | 繁中版 | 韓文版 | 英文版 | 西文版 |
|---|---|---|---|---|
| 韓國 | 前綴「韓國」，不加括號；接中文機關名不空格（韓國行政安全部、韓國成均館大學），接拉丁字母名稱空一格（韓國 CJ ENM、韓國 Team Monolith） | 不標 | 機關後括號 (Korea) | 機關後括號 (Corea) |
| 臺灣 | 不標 | 前綴「대만 」（대만 행정원 …） | 機關後括號 (Taiwan) | 機關後括號 (Taiwán) |

- 英西文的國名一律放機關名後面的括號裡，不用「, Korea」逗號式。已有縮寫或地名括號時合併成一個：TAICCA (Taiwan)、Taoyuan International Airport Corporation (TIAC, Taiwan)、YIAF (Yilan, Taiwan)；有上級機關時國名跟在最上層機關後：Civil Service Development Institute (CSDI), Executive Yuan (Taiwan)。
- 名稱本身已含國名者不再加（韓國教育開發院、Korea Railroad Research Institute、Google Korea、Taipei Mission in Korea、Oficina de Corea en Taipéi）。
- 一列裡同時有臺韓雙方時各自標自己的；「訪韓團／방한단／delegation」這類語境不取代機關本身的標示。
- 全站現況（2026-10-21 盤點 79 列＋12 卡）：繁中「韓國X」前綴 29 處、韓文「대만 X」前綴 41 處、英文「(Taiwan)」35 處、西文「(Taiwán)」35 處，皆為各語言的主流寫法；以上規則即據此定案。

## 2. 機關全稱與縮寫

- 上級機關寫全稱：行政院人事行政總處 公務人力發展學院（CSDI）；인사혁신처 국가공무원인재개발원(NHI)；행정안전부 지방자치인재개발원(LOGODI)。
- 縮寫放在機關名後的括號：繁中全形（CSDI）、韓英西半形(CSDI)。
- 英文官方名以機關自用者為準（Ministry of Personnel Management、Ministry of the Interior and Safety、Directorate-General of Personnel Administration）；西文照英文官方名翻譯，機構縮寫保留。

## 3. 列的結構

- 多場次案件：一列總括（委託單位 ＋ 考察／訪韓團名稱）＋ 每場一列（受訪機關 拜會・委託單位 訪韓團）。總括列不重複寫口譯形式（右欄已有）。
- 同一年內最新在上；年份只寫年。
- 口譯形式：esc 隨行、mtg 會議、int 訪談、evt 活動、exh 展會、sub 字幕、rep 業務代表。

## 4. 學歷區

- 順序：主修與學位 → 學校與科系 → 獎學金；年份寫完整區間，進行中寫「2021–現在／현재／present／actualidad」。
- 正規學歷只放學位（博士候選人、碩士、學士）；語言課程（含 2017–2018 慶熙大學國際教育院韓國語課程）一律放「語言進修」。
- 語言進修（`cv_data.json` 的 `LANGSTUDY`）：照網站「語言進修」區塊原文四語收錄（每條以語言開頭：「西班牙語 · 學校」「韓語 · 學校」；學校 → 課程，獎學金（`n`）在 CV 自成一行、網站另起一行以藍色等寬字顯示（同正規學歷的獎學金）；學院內部用語加註，如「APTO 合格」「Refuerzo C1（C1 強化課程）」），緊接在正規學歷之後、自成一區，最新在上；年份寫完整區間（網站的「至今／presente」在 CV 改成「現在／actualidad」）。網站與 CV 兩邊要同步改。

## 5. 流程

1. `scratchpad/patch_cases.py <cases.json>`（以繁中標題為鍵，可用 `replaces` 換掉舊寫法）→ 同步 `cv_data.json` 與網站 bundle。
2. `node build-cv.mjs` → `python3 build-cv-docx.py` → soffice 轉 PDF → 四版頁數與最後一頁檢查（以語言＋證照頁收尾，不得孤行）。
3. 無頭瀏覽器檢查四語 `/cv/` 與 `/home/` → `refresh_archive.py` → commit、push → 使用者部署。
