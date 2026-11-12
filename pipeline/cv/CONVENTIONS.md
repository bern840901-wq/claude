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
- 駐韓國台北代表部：英文一律 Taipei Mission in Korea，西文一律 Oficina de Taipéi en Corea（2026-10-26 定案；不用 Taipei Representative Office／Taipei Office／Oficina de Representación）。
- 韓國教育學術資訊院（KERIS）：繁中一律「資訊院」（2026-11-09 定案，舊寫法「情報院」已全站改掉）；韓文 한국교육학술정보원(KERIS)。英西全稱：Korea Education and Research Information Service／Servicio Coreano de Información Educativa y de Investigación——新列寫「全稱 (KERIS)」；2026-05 NTCU × KERIS 一列沿用既有的「KERIS (全稱)」順序與 "&"，不回頭改。
- 首爾泳熏國際中學：英文照校方 Young Hoon International Middle School（兩個字）；西文 Escuela Secundaria Internacional Young Hoon。
- 法務部矯正署：韓文 대만 법무부 교정서；英文 Agency of Corrections, Ministry of Justice (Taiwan)；西文 Agencia de Instituciones Penitenciarias del Ministerio de Justicia (Taiwán)。首爾南部看守所：서울남부구치소／Seoul Nambu Detention Center／Centro de Detención de Seúl Nambu。
- 臺灣教育部：韓文「대만 교육부」；英文 Ministry of Education (Taiwan)；西文 Ministerio de Educación (Taiwán)。民國年（115年）只在繁中保留；韓、英、西一律改成西元（2026년／2026），2026-11-11 定案。
- 英文官方名以機關自用者為準（Ministry of Personnel Management、Ministry of the Interior and Safety、Directorate-General of Personnel Administration）；西文照英文官方名翻譯，機構縮寫保留。

## 3. 列的結構

- 多場次案件：一列總括（委託單位 ＋ 考察／訪韓團名稱）＋ 每場一列（受訪機關 拜會・委託單位 訪韓團）。總括列不重複寫口譯形式（右欄已有）。
- 單一場次的訪團案（沒有總括列）：標題順序為「委託單位／率團長官 → 訪 受訪機關 — 考察全名 口譯形式」（如 2026 法務部矯正署副署長率團 訪首爾南部看守所 — 115年…考察團 隨行口譯），精選卡標題用同一句。
- 同一年內最新在上；年份只寫年。
- 口譯形式：esc 隨行、mtg 會議、int 訪談、evt 活動、exh 展會、sub 字幕、rep 業務代表。

## 4. 學歷區

- 順序：主修與學位 → 學校與科系 → 獎學金；年份寫完整區間，進行中寫「2021–現在／현재／present／actualidad」。
- 正規學歷只放學位（博士候選人、碩士、學士）；語言課程（含 2017–2018 慶熙大學國際教育院韓國語課程）一律放「語言進修」。
- 語言進修（`cv_data.json` 的 `LANGSTUDY`）：照網站「語言進修」區塊原文四語收錄（每條以語言開頭：「西班牙語 · 學校」「韓語 · 學校」；學校 → 課程，獎學金（`n`）在 CV 自成一行、網站另起一行以藍色等寬字顯示（同正規學歷的獎學金）；學院內部用語加註，如「APTO 合格」「Refuerzo C1（C1 強化課程）」），緊接在正規學歷之後、自成一區，最新在上；年份寫完整區間（網站的「至今／presente」在 CV 改成「現在／actualidad」）。網站與 CV 兩邊要同步改。
- 塞萬提斯學院（Instituto Cervantes）：繁中照官方用「塞」（2026-11-11 定案，舊寫法「賽」已全站改掉）；語言進修列寫「西班牙 塞萬提斯學院首爾分院」。韓文用官方全名「주한 세르반테스 스페인 문화원」（語言能力列的短稱「세르반테스 문화원」也是官方用法）；西文照官網 Instituto Cervantes de Seúl；英文 Instituto Cervantes Seoul。

- 跨文化講座（`cv_data.json` 的 `TEACHING`，2026-11-09 新增；原名「講座・教學」，同日改名以免被誤認為口筆譯教學）：放在「研究發表」之後、「語言能力」之前，自成一區；條目格式同正規學歷（年份 → 標題 → 機構 → 一行說明），四語欄位 `title`／`org`／`note`。只收講座與教學，不計入口筆譯案件數。可附公開來源連結（`url`＋四語 `linkLabel`，如教育局新聞稿），網站與 /cv/ 顯示為小連結，PDF 為可點文字；首頁對應欄位 `u`／`ul`。區塊名：CV 用「跨文化講座 / CROSS-CULTURAL TALKS・문화 간 이해 강연 / CROSS-CULTURAL TALKS・CROSS-CULTURAL TALKS・CHARLAS INTERCULTURALES」，首頁短寫「跨文化講座・문화 간 이해 강연・Cross-Cultural Talks・Charlas interculturales」。韓文用一般用語「문화 간」（不用學術的「상호문화」），「문화 간」空一格。

## 4b. 曾服務對象（CV 專用，2026-11-11 新增）

- `cv_data.json` 的 `FOR`：放在「聯繫」之後、「長期合作」之前，只在 /cv/ 與 PDF（首頁已有精選卡片）。每條：年份（可寫區間）→ 對象（人或機關，粗體）→ 案子一行；四語欄位 `who`／`what`。同一位長官兼兩個職位時合成一條（文化部次長 兼 TAICCA 董事長）。區塊名：曾服務對象 / INTERPRETED FOR・주요 통역 대상 / INTERPRETED FOR・INTERPRETED FOR・HE INTERPRETADO PARA。
- 時間軸列不因此合併；對象若在列裡看不出來，補進列標題（如 2019 忠清道廳 → 加「臺南市副市長 隨行口譯」）。

## 5. 流程

1. `scratchpad/patch_cases.py <cases.json>`（以繁中標題為鍵，可用 `replaces` 換掉舊寫法）→ 同步 `cv_data.json` 與網站 bundle。
2. `node build-cv.mjs` → `python3 build-cv-docx.py` → soffice 轉 PDF → 四版頁數與最後一頁檢查（以語言＋證照頁收尾，不得孤行）。
3. 無頭瀏覽器檢查四語 `/cv/` 與 `/home/` → `refresh_archive.py` → commit、push → 使用者部署。

## 6. 換行（2026-11-11 新增）

CV 網頁與四語 PDF 的換行由 `linebreak.mjs` 統一決定，資料文字本身不動（只加看不見的不斷行字元／標記）。

- 中文只在詞與詞之間換行：詞表在 `zh_terms.json`（由現有中文全文逐句斷詞、人工複核後產生）。新案出現新的機關名、人名、職稱或術語時，把它加進 `zh_terms.json`（例如「矯正署」「副署長」「考察團」），否則它可能被拆在兩行。
- 英、西、韓文的多字專有名詞（Kyung Hee、Instituto Cervantes、The Borderless World…）列在 `nobreak_names.json`；新案有不能拆開的名字就加進去。
- 規則已涵蓋、不必另加：數字＋單位（115年、6日、2026년、6 days）、分隔號（ · — × / ・）不放行首、括號縮寫跟著前一個字（（KERIS）、(Taiwan)）、短括號整段、書名號〈〉《》<>«» 短標題、連字號詞（Cross-Cultural、Gyeonggi-do）、韓文國別＋機關（대만 행정원）、最後一個短字不單獨成行。
- PDF 由 LibreOffice 產生：文字一律不加東亞語言標記（加了 ko-KR／zh-TW 反而會讓不斷行字元失效）；韓文靠「每兩個韓文音節之間放 WORD JOINER」保持整詞（`build-cv-docx.py` 的 `keep_korean_words`）。
- 建置時若印出「Chinese not in zh_terms.json」，表示有中文沒被詞表涵蓋，照提示把詞加進 `zh_terms.json` 再重建。
- 首頁（/home/）與電影頁（/）用同一套規則：`node build-lb-runtime.mjs` 由 `linebreak.mjs`＋兩個詞表產生網站根目錄的 `/lb.js`，頁面載入後把每段文字就地加上看不見的不斷行字元（WORD JOINER／不斷行空格／分隔號後的零寬斷點），可見文字不變；換語言、開卡片時自動重做。網頁上英西文的「最後一字不單獨成行」交給 CSS（text-wrap:pretty），大字標題（≥22px）不做最後一字綁定，以免放不下。
- 放不下時自動放寬（2026-11-12）：綁在一起的詞組有可能比所在的框還寬（例如手機上點開卡片的大標題「桃園國際機場股份有限公司（TIAC）」），會被切掉。`lb.js` 在排版後檢查 16px 以上的文字，超出框的就改用較鬆的規則：先只保留中文與韓文整詞，仍放不下就還原成原文，讓瀏覽器自行換行；視窗大小改變或網頁字型載入後會重新檢查。檢查方式：開啟每張精選卡片，四語 × 手機／電腦，確認沒有文字超出右邊（韓文頁因 keep-all 可能有括號貼到留白的情況，不算被切掉）。
- 改了詞表或規則後要重跑：`node build-cv.mjs`、`node build-lb-runtime.mjs`、`build-cv-docx.py`（再轉 PDF），三頁才會一致。
- 流程：照 §5 跑 `node build-cv.mjs`（會自動算換行提示）→ `build-cv-docx.py` → PDF；首頁或電影頁有新文字時再跑 `node build-lb-runtime.mjs`。
