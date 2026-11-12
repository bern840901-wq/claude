# twkrpuente.web.app — 游宏斌 四語作品集與 CV

- 站內文案一律照使用者給的用詞，不自行改寫；新增內容四語（繁中／韓／英／西）同步。
- 案件記錄規範（機關國別標示、全稱與縮寫、列的結構、學歷區、流程）見 `pipeline/cv/CONVENTIONS.md`，新案一律照此記錄。
- 每個新案都要檢查各語言的寫法習慣與斷句（`CONVENTIONS.md` §5 第一條），並把檢查結果告訴使用者。
- 產生器與資料：`pipeline/cv/`（`cv_data.json` 為單一資料源；`build-cv.mjs` 產 `/cv/`；`build-cv-docx.py` 產四語 DOCX，再以 LibreOffice 轉 PDF）。
- 部署：`git pull && firebase deploy --only hosting:twkrpuente`（由使用者在本機執行）。
