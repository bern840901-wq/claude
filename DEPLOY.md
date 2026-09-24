# 上線指南（Cloud Shell）

網址規劃：

```
twkrpuente.web.app/       ← 電影頁（scroll-world）
twkrpuente.web.app/home/  ← 原站作品集
twkrpuente.web.app/cv/    ← 履歷（附四語 PDF 下載）
```

這個 repo 的根目錄**就是網站內容**。`firebase.json` 與 `.firebaserc` 已經設好
`twkrpuente` 這個 hosting target，所以直接在 repo 裡部署即可，不必再下載 zip、
也不必把檔案搬到別的資料夾。

---

## 平常更新（兩行）

```bash
cd ~/twkrpuente-site
git pull && firebase deploy --only hosting:twkrpuente
```

就這樣。`git pull` 抓最新內容，`firebase deploy` 直接把 repo 根目錄發佈上去。

---

## 第一次設定（只做一次）

```bash
cd ~
git clone -b claude/scroll-world-skill-setup-hkgxfz \
  https://github.com/bern840901-wq/claude.git twkrpuente-site
cd ~/twkrpuente-site
firebase deploy --only hosting:twkrpuente
```

已經有舊的 clone 的話，改成把它拉到最新並切到正確分支：

```bash
cd ~/twkrpuente-site           # 或你原本 clone 的路徑
git fetch origin claude/scroll-world-skill-setup-hkgxfz
git checkout claude/scroll-world-skill-setup-hkgxfz
git reset --hard origin/claude/scroll-world-skill-setup-hkgxfz
```

> `git reset --hard` 會丟掉本機未提交的修改。這個 clone 只用來部署，不該有本機
> 修改；先跑 `git status` 確認是乾淨的再執行。

---

## 從舊流程切換過來（做一次，要先檢查）

Firebase hosting 的部署是**整站替換**——沒出現在這次部署裡的檔案會從線上消失。
所以第一次用新流程之前，先確認舊的發佈資料夾裡沒有 repo 以外的檔案：

```bash
comm -13 \
  <(cd ~/twkrpuente-site && git ls-files \
      | grep -vE '^(pipeline/|README\.md$|DEPLOY\.md$|\.gitignore$|firebase\.json$|\.firebaserc$)' | sort) \
  <(cd ~/portfolio-site/twkrpuente && find . -type f | sed 's|^\./||' | sort)
```

**沒有任何輸出 = 安全**，舊資料夾的檔案 repo 全都有，可以直接切換。

（左邊那份清單就是會發佈的 59 個檔案：`index.html`、`scrub-engine.js`、
`world-config.js`、`og.png`、`home/index.html`、`cv/index.html`、四份 CV PDF，
以及 `assets/` 底下 49 個影音與圖片素材。）

有輸出的話，那幾個檔案只存在於舊資料夾；把它們貼給 Claude 判斷是該加進 repo
還是本來就該淘汰，不要直接部署。

### 已處理過的：`pue.html` / `preview-pue.png`

舊發佈資料夾裡有這兩個檔案，是一份沒有任何頁面連到的舊版作品集（25MB，內容
停在「桃園國際機場公司副總」那一版）。內容已由 `/home/` 取代，但網址可能曾經
分享出去過，所以沒有直接刪除，而是在 `firebase.json` 設了 301 轉址：

```
/pue.html         →  /home/
/preview-pue.png  →  /og.png
```

舊連結照常可用，並且會把訪客帶到現行版本。

---

## 上傳中斷了怎麼辦

素材有 125MB，Cloud Shell 偶爾會在上傳途中斷線：

```
Error: Task ... failed: retries exhausted after 6 attempts, with error:
Failed to make request to https://upload-firebasehosting.googleapis.com/...
```

**網站不會壞。** Firebase 是全部檔案上傳完才切換版本，中途失敗等於什麼都沒發生，
線上仍是上一版。

直接重跑即可：

```bash
firebase deploy --only hosting:twkrpuente
```

已經上傳成功的檔案 Firebase 會依內容雜湊比對，不會重傳，所以每重試一次進度都會
往前。連續失敗三次以上再換手：

```bash
firebase deploy --only hosting:twkrpuente --debug 2>&1 | tail -40
```

---

## 驗收

```bash
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://twkrpuente.web.app/
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://twkrpuente.web.app/home/
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://twkrpuente.web.app/cv/
```

三行都要是 `200`，而且 bytes 要跟 repo 裡對應檔案的大小一致：

```bash
cd ~/twkrpuente-site && stat -c '%n %s' index.html home/index.html cv/index.html
```

確認不該公開的東西沒被發佈（三行都要是 `404`）：

```bash
for p in pipeline/cv/cv_data.json .git/config DEPLOY.md; do
  curl -s -o /dev/null -w "$p → %{http_code}\n" "https://twkrpuente.web.app/$p"
done
```

部署時 Firebase 會印出 `found N files in .`，**N 應該是 59**。明顯更多的話就是
`ignore` 沒生效，把數字告訴 Claude。

頁面本身：

- [ ] `/` 橋動畫開場 → 7 景一鏡到底 → 結尾卡三個出口
- [ ] `/home/` 作品集正常，精選作品抽屜可開、術語對照有內容
- [ ] `/cv/` 四語切換正常，PDF 下載連結可用
- [ ] 手機直式播放、頂欄「查看作品集」膠囊看得到
- [ ] 瀏覽器語言為韓／英／西時文案自動切換（預設中文）

---

## 快取

`firebase.json` 設了兩條規則：

| 檔案 | Cache-Control | 意思 |
|---|---|---|
| `**/*.html` | `no-cache, no-store, must-revalidate` | 每次都抓新的，改版立即生效 |
| `**/*.pdf` | `public, max-age=0, must-revalidate` | 每次向伺服器確認，沒變就回 304（不重抓） |

影片、音訊、圖片走 Firebase 預設快取。如果換掉了同名的素材檔而瀏覽器還顯示舊的，
用無痕視窗開，或在網址後加 `?v=2`。

---

## 其他站台不受影響

這個 repo 的設定只定義 `twkrpuente` 一個 target，所以從這裡部署不會動到
`~/portfolio-site` 底下的 `twkrbridge`、`twkrlink`、`taiwankorea`、`twkrbridgeold`。
那幾個站要更新時，照舊在 `~/portfolio-site` 操作。
