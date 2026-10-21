# 案件記錄規範（CV 四語版 × 網站時間軸 × 精選卡）

適用對象：`pipeline/cv/cv_data.json` 的 `TL`（繁中／韓／英）與 `TLES`（西）、`home/index.html` 內的 `TL`／`TLES` 與精選卡 `title`。
四處用詞必須一致：CV 列 = 網站時間軸列；精選卡標題可較長，但機關名稱與縮寫須相同。

## 1. 機關國別標示（2026-10-21 定案）

讀該語言的人，不認識這個機關也要能從這一列看出它是哪一國的。

| 機關所在國 | 繁中版 | 韓文版 | 英文版 | 西文版 |
|---|---|---|---|---|
| 韓國 | 前綴「韓國」，不空格（韓國行政安全部、韓國成均館大學） | 不標 | 「, Korea」或「(Korea)」 | 「de Corea」或「(Corea)」 |
| 臺灣 | 不標 | 前綴「대만」 | 「, Taiwan」或「(Taiwan)」 | 「, Taiwán」或「(Taiwán)」 |

- 名稱本身已含國名者不再加（韓國教育開發院、Google Korea、Taipei Mission in Korea）。
- 一列裡同時有臺韓雙方時，各自標自己的；「訪韓團／방한단／delegation to Korea」這類語境不取代機關前綴。

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

## 5. 流程

1. `scratchpad/patch_cases.py <cases.json>`（以繁中標題為鍵，可用 `replaces` 換掉舊寫法）→ 同步 `cv_data.json` 與網站 bundle。
2. `node build-cv.mjs` → `python3 build-cv-docx.py` → soffice 轉 PDF → 四版頁數與最後一頁檢查（以語言＋證照頁收尾，不得孤行）。
3. 無頭瀏覽器檢查四語 `/cv/` 與 `/home/` → `refresh_archive.py` → commit、push → 使用者部署。
