# 游宏斌作品集 — scroll-world 改造版

原站 [twkrpuente.web.app](https://twkrpuente.web.app/) 的「scroll-world」重製：
捲動即推動一台攝影機，從日出機場出發，一鏡到底穿過 7 個真實口譯工作場景
（政府會談廳 → 技術談判室 → 電視攝影棚 → 展會大廳 → 口譯筆記書房 → 首爾夜景收尾）。

- **文案 100% 原站原文**（中／韓／英／西四語，右下角切換；切語言只換文字，鏡頭不動）
- **目前為 PREVIZ 佔位模式**：`world-config.js` 首行 `USE_PLACEHOLDERS = true`，
  以品牌色扁平插畫預覽整條旅程；Higgsfield 實景渲染完成後改為 `false` 即上線
- 品牌沿用原站：米色紙 `#EDE6D5`・墨黑 `#14110D`・朱紅 `#E8410E`

## 檔案

| 檔案 | 說明 |
|---|---|
| `index.html` | 頁面入口：主題、字型、語言切換、掛載引擎 |
| `scrub-engine.js` | scroll-world 捲動引擎（skill 原版，未改） |
| `world-config.js` | 7 景設定 + 四語文案（自原站字典逐字生成，勿手改文案） |
| `assets/stills/ph-*.svg` | 佔位場景圖（7 橫式 + 7 直式） |
| `pipeline/` | Higgsfield 渲染管線：prompts、批次腳本、費用估算、QA 清單 |

## 本機預覽

```bash
npx http-server -p 8080   # 或任何靜態伺服器
# open http://localhost:8080/?lang=zh   (zh / ko / en / es)
```

## 下一步：實景渲染

見 [`pipeline/README.md`](pipeline/README.md) — 需要 `higgsfield auth login`
（瀏覽器 OAuth）與約 890–1130 credits（桌機＋手機原生 9:16 兩條鏈）。
