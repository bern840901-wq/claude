// Builds /cv/ — a quiet, editorial one-page professional index in the style of
// novelistpark.github.io, populated entirely from the original site's own data
// (STR dict + TL timeline + EDU/LANGS/CERTS/CLIENTS/PARTNERS), four languages.
import { createRequire } from 'module';
import fs from 'fs';
import { lbMap, zhUncovered } from './linebreak.mjs';
const require = createRequire(import.meta.url);
const S = require('./str_dict.js');
const D = JSON.parse(fs.readFileSync('cv_data.json', 'utf8'));

const LANGS = ['zh', 'ko', 'en', 'es'];
const strip = v => typeof v === 'string' ? v.replace(/<\/?[a-z][^>]*>/g, '') : v;
const PRESENT = { zh: '現在', ko: '현재', en: 'present', es: 'actualidad' };
const yearRange = (y, l) => { const [a, b] = String(y).split('–'); return b === undefined ? a : (b === '' ? a + '–' + PRESENT[l] : a + '–' + (b.length === 2 ? a.slice(0, 2) + b : b)); };
const pick = (obj, l) => strip((obj && (obj[l] ?? obj.en ?? obj.zh)) ?? '');

// Section labels drawn from the site's own strings where they exist.
const UI = {
  contact: { zh: '聯繫 / CONTACT', ko: '연락처 / CONTACT', en: 'CONTACT', es: 'CONTACTO' },
  partners: {  // heading composed from the site's own tmLabel wording
    zh: '長期合作 / LONG-TERM', ko: '장기 협력 / LONG-TERM', en: 'LONG-TERM ENGAGEMENTS', es: 'COLABORACIONES DE LARGO PLAZO' },
  interpretedFor: { zh: '曾服務對象 / INTERPRETED FOR', ko: '주요 통역 대상 / INTERPRETED FOR', en: 'INTERPRETED FOR', es: 'HE INTERPRETADO PARA' },
  work: { zh: S.zh.tlHeading + ' / WORK', ko: S.ko.tlHeading + ' / WORK', en: 'WORK', es: 'TRAYECTORIA' },
  clients: { zh: S.zh.clientsLabel + ' / CLIENTS', ko: S.ko.clientsLabel + ' / CLIENTS', en: 'SELECTED CLIENTS', es: 'CLIENTES DESTACADOS' },
  education: { zh: S.zh.eduDeg + ' / EDUCATION', ko: S.ko.eduDeg + ' / EDUCATION', en: 'EDUCATION', es: 'FORMACIÓN' },
  langstudy: { zh: S.zh.langStudyLabel + ' / LANGUAGE STUDY', ko: S.ko.langStudyLabel + ' / LANGUAGE STUDY', en: 'LANGUAGE STUDY', es: 'ESTUDIOS DE IDIOMAS' },
  research: { zh: '研究發表 / RESEARCH', ko: '연구 실적 / RESEARCH', en: 'RESEARCH', es: 'INVESTIGACIÓN' },
  teaching: { zh: '跨文化講座 / CROSS-CULTURAL TALKS', ko: '문화 간 이해 강연 / CROSS-CULTURAL TALKS', en: 'CROSS-CULTURAL TALKS', es: 'CHARLAS INTERCULTURALES' },
  languages: { zh: S.zh.eduLang + ' / LANGUAGES', ko: S.ko.eduLang + ' / LANGUAGES', en: 'LANGUAGES', es: 'IDIOMAS' },
  certs: { zh: S.zh.certLabel + ' / AWARDS', ko: S.ko.certLabel + ' / AWARDS', en: 'CERTIFICATIONS & AWARDS', es: 'CERTIFICACIONES Y PREMIOS' },
  film: { zh: '走進我的工作現場', ko: '현장 속으로', en: 'Walk through my world', es: 'Recorre mi mundo' },
  intl: { zh: 'KOREA · TAIWAN', ko: 'KOREA · TAIWAN', en: 'KOREA · TAIWAN', es: 'COREA · TAIWÁN' },
};

// per-language payload assembled from site data
const payload = {};
for (const l of LANGS) {
  const L = S[l];
  payload[l] = {
    name: l === 'zh' ? '游宏斌' : (l === 'ko' ? '유홍빈 YU HUNG PIN' : 'Yu Hung-Pin'),
    nameSub: l === 'zh' ? 'YU HUNG PIN · 유홍빈' : (l === 'ko' ? '游宏斌' : '游宏斌 · 유홍빈'),
    role: L.role,
    tagline: L.tagline,
    based: L.basedIn,
    avail: L.available,
    reply: L.ctReply,
    tlSub: L.tlSub,
    cta2: L.cta2,
    ui: Object.fromEntries(Object.entries(UI).map(([k, v]) => [k, v[l]])),
    types: Object.fromEntries(Object.entries(D.T).map(([k, v]) => [k, pick(v, l)])),
    partners: D.PARTNERS[l] || D.PARTNERS.en,
    // r[6] (optional) = the subject matter of that assignment, in the client's
    // own official terminology — so a reader sees WHAT was interpreted, not
    // only for whom.
    tl: D.TL.map((r, i) => ({ y: r[0], t: r[1], title: l === 'zh' ? r[3] : l === 'ko' ? r[4] : l === 'es' ? ((D.TLES && D.TLES[i]) || r[5]) : r[5],
                         sub: r[6] ? (r[6][l] || r[6].en || '') : '' })),
    clients: D.CLIENTS.map(g => ({
      title: pick(g.title, l),
      items: g.items.map(it => ({ name: pick(it.name, l), sub: pick(it.sub, l) })),
    })),
    edu: D.EDU.map(e => ({ year: yearRange(e.year, l), school: pick(e.school, l), deg: pick(e.deg, l), note: pick(e.note, l) })),
    // the site's own 語言進修 block (school, course, years) — wording verbatim; only the
    // open-ended range takes the CV's "present" word so it reads like the degree rows
    langstudy: (((D.LANGSTUDY || {})[l]) || (D.LANGSTUDY || {}).en || []).map(x => ({
      y: yearRange(String(x.y).replace(/–(至今|현재|present|presente)$/, '–'), l), s: x.s, c: x.c, n: x.n || '' })),   // n: scholarship, its own line (the site joins it to c with " · ")
    // who the owner has interpreted for (FOR): principal, then the engagement on one line
    interpretedFor: (D.FOR || []).map(e => ({ year: yearRange(e.year, l), who: pick(e.who, l), what: pick(e.what, l) })),
    // talks & lessons (TEACHING): same shape as a degree row — title, institution, one note line
    teaching: (D.TEACHING || []).map(e => ({ year: yearRange(e.year, l), title: pick(e.title, l), org: pick(e.org, l), note: pick(e.note, l), url: e.url || '', linkLabel: e.linkLabel ? pick(e.linkLabel, l) : '' })),
    bio: (D.BIO || {})[l] || '',
    orcid: D.ORCID || null,
    dl: { label: { zh: '下載履歷 PDF ↓', ko: '이력서 PDF 다운로드 ↓', en: 'Download CV (PDF) ↓', es: 'Descargar CV (PDF) ↓' }[l],
          file: 'pdf/yu-hungpin-cv-' + l + '.pdf',
          name: { zh: '游宏斌_CV_精選版.pdf', ko: '游宏斌_CV_KO.pdf', en: '游宏斌_CV_EN.pdf', es: '游宏斌_CV_ES.pdf' }[l] },
    pubs: (D.PUBS || []).map(x => ({ y: x.y, cko: x.cko, cen: x.cen, doi: x.doi, doiUrl: x.doiUrl, tr: l === 'zh' ? x.zh : l === 'es' ? x.es : null, kci: l === 'zh' || l === 'ko' ? 'KCI 등재' : 'KCI-indexed' })),
    langs: D.LANGS.map(x => ({ name: pick(x.name, l), level: pick(x.level, l) })),
    certs: (D.CERTS[l] || D.CERTS.en).map(c => ({ name: c.name, issuer: c.issuer })),
    titleTag: { zh: '游宏斌 YU HUNG PIN — CV', ko: '유홍빈 YU HUNG PIN — CV', en: 'Yu Hung-Pin — CV', es: 'Yu Hung-Pin — CV' }[l],
  };
}

// line-break hints for every display string (see linebreak.mjs)
for (const l of LANGS) payload[l]._lb = lbMap(payload[l]);
{ const gaps = zhUncovered(payload.zh); if (gaps.length) console.log('Chinese not in zh_terms.json (may break inside):', gaps.join(' · ')); }

const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>游宏斌 YU HUNG PIN — CV</title>
<meta name="description" content="游宏斌（유홍빈）— 駐首爾中韓口筆譯・溝通顧問 CV。">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-NVSBEEP9CR"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-NVSBEEP9CR');</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=Noto+Serif+TC:wght@600;700&family=Noto+Serif+KR:wght@600;700&family=Noto+Sans+TC:wght@400;500&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
/* Korean wraps at 어절 boundaries, never mid-syllable; other scripts unaffected */
/* Words stay whole in every language: Korean wraps at spaces, Chinese only at
   the word boundaries the build marks with <wbr> (linebreak.mjs), plus spaces and
   punctuation. .nb holds a few characters together (a name and its bracket,
   a number and its unit). overflow-wrap:break-word only splits a unit that
   cannot fit a line on its own; min-width:0 lets text columns shrink to the
   screen instead of pushing past it. */
body{word-break:keep-all;overflow-wrap:break-word;line-break:strict}
.nb{white-space:nowrap}
.ttl,.typ,.edu>div,.kv,.cl .nm,.cl .sb{min-width:0}
h1,.ttl,.slabel,.nm{text-wrap:balance}
.role,.kv,.sub,.sb,.tagline,.loc,.gtitle{text-wrap:pretty}
:root{--ink:#14110D;--mid:#555;--light:#8f8a80;--rule:#E9E5DC;--bg:#FFFFFF;--ac:#E8410E}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:'Inter','Noto Sans TC',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased;line-height:1.6}
.wrap{max-width:640px;margin:0 auto;padding:72px 24px 96px}
a{color:inherit;text-decoration:none;border-bottom:1px solid var(--rule);transition:color .2s,border-color .2s}
a:hover{color:var(--ac);border-color:var(--ac)}
::selection{background:var(--ac);color:#fff}
.serif{font-family:'Cormorant Garamond','Noto Serif TC','Noto Serif KR',serif}
h1{font-family:'Cormorant Garamond','Noto Serif TC','Noto Serif KR',serif;font-weight:600;font-size:44px;line-height:1.1;letter-spacing:.01em}
.namesub{margin-top:6px;font-size:13px;letter-spacing:.14em;color:var(--light)}
.role{margin-top:18px;font-size:15px;color:var(--mid);line-height:1.7}
.tagline{margin-top:10px;font-size:12px;letter-spacing:.16em;color:var(--light);text-transform:uppercase}
.loc{margin-top:26px;font-size:13.5px;color:var(--mid)}
section{margin-top:64px}
.slabel{font-size:11px;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--light);border-top:1px solid var(--rule);padding-top:14px;margin-bottom:22px}
.row{display:flex;gap:18px;align-items:baseline;padding:7px 0}
.edu{display:grid;grid-template-columns:max-content 1fr;column-gap:18px;row-gap:14px;align-items:baseline;padding:7px 0}
.edu .yr{flex:none;white-space:nowrap}
.edu .kv{padding:2px 0 0}
.yr{flex:0 0 44px;font-size:12.5px;color:var(--light);font-variant-numeric:tabular-nums}
.ttl{flex:1;font-family:'Cormorant Garamond','Noto Serif TC','Noto Serif KR',serif;font-size:16.5px;font-weight:600;line-height:1.45;font-variant-numeric:lining-nums}
.typ{flex:0 1 auto;max-width:150px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--light);text-align:right;text-wrap:balance}
.kv{padding:6px 0;font-size:14px}
.kv b{font-weight:500}
.kv .sub{color:var(--light);font-size:12.5px}
/* subject matter of a single assignment — hangs under its row, hairline-tied to it */
.kv.topic{margin:-4px 0 10px 62px;padding-left:11px;border-left:1px solid var(--rule)}
.kv.topic .sub{font-size:12px;line-height:1.62;display:block}
@media (max-width:520px){.kv.topic{margin-left:0}}
.group{margin-bottom:26px}
.gtitle{font-size:12px;letter-spacing:.1em;color:var(--mid);font-weight:500;margin-bottom:8px}
.cl{display:flex;flex-wrap:wrap;gap:6px 0;font-size:14px}
.cl .it{padding:3px 0;flex:0 0 100%;display:flex;flex-wrap:wrap;column-gap:10px;align-items:baseline}
.cl .nm{font-weight:400}
.cl .t1 .nm{font-weight:500}
.cl .sb{color:var(--light);font-size:12px}
.mailrow{font-size:16px}
.mail{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;border-color:var(--ac)}
.dl{display:inline-block;margin-top:10px;font-size:13px;color:var(--mid);text-decoration:none;border-bottom:1px solid var(--rule)}
.dl:hover{color:var(--ac);border-color:var(--ac)}
.idl{color:var(--light);text-decoration:none;border-bottom:1px solid transparent;font-size:11.5px;letter-spacing:.02em}
.idl:hover{color:var(--ac);border-color:var(--ac)}
.orcid{display:inline-flex;align-items:center;gap:6px;margin:2px 0 16px;font-size:12px;color:var(--light);text-decoration:none}
.orcid:hover{color:var(--ac)}
.orcid i{width:9px;height:9px;border-radius:50%;background:#A6CE39;display:inline-block;font-style:normal}
.foot{margin-top:88px;border-top:1px solid var(--rule);padding-top:18px;display:flex;flex-wrap:wrap;gap:8px 22px;font-size:12.5px;color:var(--light)}
.langpill{position:fixed;top:18px;right:18px;display:flex;gap:2px;background:rgba(255,255,255,.9);backdrop-filter:blur(6px);border:1px solid var(--rule);border-radius:999px;padding:3px}
.langpill button{font:500 11px/1 'Inter',sans-serif;letter-spacing:.05em;border:0;background:none;color:var(--light);padding:7px 10px;border-radius:999px;cursor:pointer}
.langpill button.on{background:var(--ink);color:#fff}
.pct{display:inline-block;width:64px;height:3px;background:var(--rule);border-radius:2px;margin-left:12px;vertical-align:middle}
.pct i{display:block;height:100%;background:var(--ink);border-radius:2px}
@media print{.langpill{display:none}.wrap{padding-top:24px}}
@media (max-width:520px){h1{font-size:34px}.typ{display:none}}
</style>
</head>
<body>
<div class="langpill" role="group" aria-label="language">
  <button data-l="zh">中</button><button data-l="ko">한</button><button data-l="en">EN</button><button data-l="es">ES</button>
</div>
<div class="wrap" id="app"></div>
<script>
const DATA = ${JSON.stringify(payload)};
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Line-break hints computed at build time (linebreak.mjs): n = gaps that must
// not break, stored as "a-b c". A forbidden gap at a space becomes a no-break
// space; any other forbidden gap is held by a short .nb span; every other gap
// between two letters in Chinese text is a word boundary and gets <wbr>
// (the page uses word-break:keep-all). Presentation only — the data is untouched.
let LBM = {};
const HAN = /[\u3400-\u9fff\uf900-\ufaff]/, LET = /[\u3400-\u9fff\uf900-\ufaff\uac00-\ud7a3A-Za-z0-9\u00c0-\u024f]/;
const fmt = (v, boldRe) => {
  const s = String(v ?? '');
  let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const n = new Set(); for (const part of String(LBM[h.toString(36)] || '').split(' ')) { if (!part) continue; const [a, b] = part.split('-').map(Number); for (let p = a; p <= (b || a); p++) n.add(p); }
  const w = new Set(); if (HAN.test(s)) for (let p = 1; p < s.length; p++) if (!n.has(p) && LET.test(s[p - 1]) && LET.test(s[p]) && (HAN.test(s[p - 1]) || HAN.test(s[p]))) w.add(p);
  const hold = new Uint8Array(s.length), bold = new Uint8Array(s.length);
  // gaps between two letters are already held by keep-all; a span is only needed
  // where punctuation, a bracket or a hyphen is involved
  for (const p of n) if (s[p - 1] !== ' ' && s[p] !== ' ' && !(LET.test(s[p - 1]) && LET.test(s[p]))) { hold[p - 1] = 1; hold[p] = 1; }
  if (boldRe) { boldRe.lastIndex = 0; let m; while ((m = boldRe.exec(s))) for (let k = m.index; k < m.index + m[0].length; k++) bold[k] = 1; }
  let out = '', open = false, b = false;
  for (let i = 0; i < s.length; i++) {
    if (open && (!hold[i] || !n.has(i))) { if (b) { out += '</b>'; b = false; } out += '</span>'; open = false; }
    if (!open && w.has(i)) out += '<wbr>';
    if (hold[i] && !open) { if (b) { out += '</b>'; b = false; } out += '<span class="nb">'; open = true; }
    if (bold[i] && !b) { out += '<b style="font-weight:600">'; b = true; }
    else if (!bold[i] && b) { out += '</b>'; b = false; }
    const c = s[i];
    out += c === ' ' && n.has(i + 1) ? '&nbsp;' : esc(c);
  }
  if (b) out += '</b>';
  if (open) out += '</span>';
  return out;
};
const HTML_LANG = { zh:'zh-Hant', ko:'ko', en:'en', es:'es' };
function render(l){
  const d = DATA[l];
  LBM = d._lb || {};
  document.documentElement.lang = HTML_LANG[l];
  document.title = d.titleTag;
  let tlRows = '', lastYear = null;
  for (const r of d.tl){
    const y = r.y === lastYear ? '' : r.y; lastYear = r.y;
    tlRows += '<div class="row"><span class="yr">'+y+'</span><span class="ttl">'+fmt(r.title)+'</span><span class="typ">'+fmt(d.types[r.t]||'')+'</span></div>';
    if (r.sub) tlRows += '<div class="kv topic"><span class="sub">'+fmt(r.sub)+'</span></div>';
  }
  const partners = d.partners.map(p => '<div class="row"><span class="yr">'+esc(p.period.split('–')[0])+'</span><span class="ttl">'+fmt(p.org)+'</span><span class="typ">'+fmt(p.period)+'</span></div>'
    + '<div class="kv" style="margin:-6px 0 8px 62px"><span class="sub">'+fmt(p.desc)+'</span></div>').join('');
  const clients = d.clients.map(g => '<div class="group"><div class="gtitle">'+fmt(g.title)+'</div><div class="cl">'
    + g.items.map(it => '<span class="it'+'"><span class="nm">'+fmt(it.name)+'</span>'+(it.sub?'<span class="sb">'+fmt(it.sub)+'</span>':'')+'</span>').join('') + '</div></div>').join('');
  const edu = '<div class="edu">' + d.edu.map(e => '<span class="yr">'+esc(e.year)+'</span><div><div class="ttl">'+fmt(e.deg)+'</div><div class="kv"><span class="sub">'+fmt(e.school)+'</span>'+(e.note?'<br><span class="sub">'+fmt(e.note)+'</span>':'')+'</div></div>').join('') + '</div>';   // one shared grid: the year column is as wide as the widest range
  const langstudy = '<div class="edu">' + d.langstudy.map(x => '<span class="yr">'+esc(x.y)+'</span><div><div class="ttl">'+fmt(x.s)+'</div><div class="kv"><span class="sub">'+fmt(x.c)+'</span>'+(x.n?'<br><span class="sub">'+fmt(x.n)+'</span>':'')+'</div></div>').join('') + '</div>';   // same grid as the degrees: school as the title, course (and scholarship) under it
  const interpretedFor = '<div class="edu">' + d.interpretedFor.map(e => '<span class="yr">'+esc(e.year)+'</span><div><div class="ttl">'+fmt(e.who)+'</div><div class="kv"><span class="sub">'+fmt(e.what)+'</span></div></div>').join('') + '</div>';   // same grid as the degrees
  const teaching = '<div class="edu">' + d.teaching.map(e => '<span class="yr">'+esc(e.year)+'</span><div><div class="ttl">'+fmt(e.title)+'</div><div class="kv"><span class="sub">'+fmt(e.org)+'</span>'+(e.note?'<br><span class="sub">'+fmt(e.note)+'</span>':'')+(e.url?'<br><a class="orcid" href="'+esc(e.url)+'" target="_blank" rel="noopener">'+fmt(e.linkLabel)+'</a>':'')+'</div></div>').join('') + '</div>';   // same grid as the degrees; optional source link (press release)
  const ME = /유홍빈|Yu Hung-pin|Hungpin Yu/g;
  const pubs = d.pubs.map(x => '<div class="row"><span class="yr">'+x.y+'</span><span class="ttl">'+fmt(x.cko, ME)+'</span><span class="typ">'+esc(x.kci)+'</span></div>'
    + '<div class="kv" style="margin:-6px 0 0 62px"><span class="sub">'+fmt(x.cen, ME)+'</span></div>'
    + (x.tr ? '<div class="kv" style="margin:-2px 0 0 62px"><span class="sub">'+fmt(x.tr)+'</span></div>' : '')
    + (x.doiUrl ? '<div class="kv" style="margin:-2px 0 12px 62px"><a class="idl" href="'+x.doiUrl+'" target="_blank" rel="noopener">doi.org/'+esc(x.doi)+'</a></div>' : '<div style="height:12px"></div>')).join('');
  const langs = d.langs.map(x => '<div class="kv"><b>'+fmt(x.name)+'</b> · <span class="sub">'+fmt(x.level)+'</span></div>').join('');
  const certs = d.certs.map(c => '<div class="kv"><b>'+fmt(c.name)+'</b><br><span class="sub">'+fmt(c.issuer)+'</span></div>').join('');
  document.getElementById('app').innerHTML =
    '<header><h1>'+esc(d.name)+'</h1><div class="namesub">'+esc(d.nameSub)+'</div>'
    + '<p class="role">'+fmt(d.role)+'</p>'
    + '<div class="tagline">'+fmt(d.tagline)+'</div>'
    + '<div class="loc">'+fmt(d.based)+' · '+fmt(d.avail)+'</div></header>'
    + '<section><div class="slabel">'+esc(d.ui.contact)+'</div>'
    + '<div class="mailrow"><a class="mail" href="mailto:twkrbridge@gmail.com">twkrbridge@gmail.com</a></div>'
    + '<div class="kv"><span class="sub">'+fmt(d.reply)+'</span></div>'
    + '<a class="dl" href="'+d.dl.file+'" download="'+esc(d.dl.name)+'">'+esc(d.dl.label)+'</a></section>'
    + (d.interpretedFor.length ? '<section><div class="slabel">'+esc(d.ui.interpretedFor)+'</div>'+interpretedFor+'</section>' : '')
    + '<section><div class="slabel">'+esc(d.ui.partners)+'</div>'+partners+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.work)+'</div>'
    + '<div class="kv" style="margin-bottom:12px"><span class="sub">'+fmt(d.tlSub)+'</span></div>'+tlRows+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.clients)+'</div>'+clients+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.education)+'</div>'+edu+'</section>'
    + (d.langstudy.length ? '<section><div class="slabel">'+esc(d.ui.langstudy)+'</div>'+langstudy+'</section>' : '')
    + '<section><div class="slabel">'+esc(d.ui.research)+'</div>'
    + (d.bio ? '<div class="kv" style="margin-bottom:4px"><span class="sub" style="line-height:1.75">'+fmt(d.bio)+'</span></div>' : '')
    + (d.orcid ? '<a class="orcid" href="'+d.orcid.url+'" target="_blank" rel="noopener"><i></i>ORCID '+esc(d.orcid.id)+'</a>' : '')
    + pubs+'</section>'
    + (d.teaching.length ? '<section><div class="slabel">'+esc(d.ui.teaching)+'</div>'+teaching+'</section>' : '')
    + '<section><div class="slabel">'+esc(d.ui.languages)+'</div>'+langs+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.certs)+'</div>'+certs+'</section>'
    + '<div class="foot"><a href="/home/">'+esc(d.cta2)+'</a><a href="/">▶ '+esc(d.ui.film)+'</a><span>© 游宏斌 YU HUNG PIN</span></div>';
  document.querySelectorAll('.langpill button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
  try { localStorage.setItem('sw-lang', l); } catch(e) {}
  try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null,'',u); } catch(e) {}
}
const detect = () => { try { const prefs = navigator.languages || [navigator.language || 'en']; for (const pf of prefs) { const b = String(pf).toLowerCase().split('-')[0]; if (b === 'zh') return 'zh'; if (['ko','es','en'].includes(b)) return b; } } catch(e) {} return 'en'; };
const param = new URLSearchParams(location.search).get('lang');
let lang = ['zh','ko','en','es'].includes(param) ? param : ((function(){try{return localStorage.getItem('sw-lang')}catch(e){return null}})() || detect());
if (!['zh','ko','en','es'].includes(lang)) lang = 'zh';
document.querySelectorAll('.langpill button').forEach(b => b.addEventListener('click', () => render(b.dataset.l)));
render(lang);
</script>
</body>
</html>`;
fs.mkdirSync('/home/user/claude/cv', { recursive: true });
fs.writeFileSync('/home/user/claude/cv/index.html', html);
console.log('written cv/index.html', (html.length/1024).toFixed(0)+'KB');
