// Builds /cv/ — a quiet, editorial one-page professional index in the style of
// novelistpark.github.io, populated entirely from the original site's own data
// (STR dict + TL timeline + EDU/LANGS/CERTS/CLIENTS/PARTNERS), four languages.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const S = require('./str_dict.js');
const D = JSON.parse(fs.readFileSync('cv_data.json', 'utf8'));

const LANGS = ['zh', 'ko', 'en', 'es'];
const strip = v => typeof v === 'string' ? v.replace(/<\/?[a-z][^>]*>/g, '') : v;
const pick = (obj, l) => strip((obj && (obj[l] ?? obj.en ?? obj.zh)) ?? '');

// Section labels drawn from the site's own strings where they exist.
const UI = {
  contact: { zh: '聯繫 / CONTACT', ko: '연락처 / CONTACT', en: 'CONTACT', es: 'CONTACTO' },
  partners: {  // heading composed from the site's own tmLabel wording
    zh: '長期合作 / LONG-TERM', ko: '장기 협력 / LONG-TERM', en: 'LONG-TERM ENGAGEMENTS', es: 'COLABORACIONES DE LARGO PLAZO' },
  work: { zh: S.zh.tlHeading + ' / WORK', ko: S.ko.tlHeading + ' / WORK', en: 'WORK', es: 'TRAYECTORIA' },
  clients: { zh: S.zh.clientsLabel + ' / CLIENTS', ko: S.ko.clientsLabel + ' / CLIENTS', en: 'SELECTED CLIENTS', es: 'CLIENTES DESTACADOS' },
  education: { zh: S.zh.eduDeg + ' / EDUCATION', ko: S.ko.eduDeg + ' / EDUCATION', en: 'EDUCATION', es: 'FORMACIÓN' },
  research: { zh: '研究發表 / RESEARCH', ko: '연구 실적 / RESEARCH', en: 'RESEARCH', es: 'INVESTIGACIÓN' },
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
    tl: D.TL.map(r => ({ y: r[0], t: r[1], title: l === 'zh' ? r[3] : l === 'ko' ? r[4] : r[5] })),
    clients: D.CLIENTS.map(g => ({
      title: pick(g.title, l),
      items: g.items.map(it => ({ name: pick(it.name, l), sub: pick(it.sub, l) })),
    })),
    edu: D.EDU.map(e => ({ year: e.year, school: pick(e.school, l), deg: pick(e.deg, l) })),
    bio: (D.BIO || {})[l] || '',
    dl: { label: { zh: '下載履歷 PDF ↓', ko: '이력서 PDF 다운로드 ↓', en: 'Download CV (PDF) ↓', es: 'Descargar CV (PDF) ↓' }[l],
          file: 'pdf/yu-hungpin-cv-' + l + '.pdf',
          name: { zh: '游宏斌_CV_精選版.pdf', ko: '游宏斌_CV_KO.pdf', en: '游宏斌_CV_EN.pdf', es: '游宏斌_CV_ES.pdf' }[l] },
    pubs: (D.PUBS || []).map(x => ({ y: x.y, cko: x.cko, cen: x.cen, tr: l === 'zh' ? x.zh : l === 'es' ? x.es : null, kci: l === 'zh' || l === 'ko' ? 'KCI 등재' : 'KCI-indexed' })),
    langs: D.LANGS.map(x => ({ name: pick(x.name, l), level: pick(x.level, l) })),
    certs: (D.CERTS[l] || D.CERTS.en).map(c => ({ name: c.name, issuer: c.issuer })),
    titleTag: { zh: '游宏斌 YU HUNG PIN — CV', ko: '유홍빈 YU HUNG PIN — CV', en: 'Yu Hung-Pin — CV', es: 'Yu Hung-Pin — CV' }[l],
  };
}

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
.yr{flex:0 0 44px;font-size:12.5px;color:var(--light);font-variant-numeric:tabular-nums}
.ttl{flex:1;font-family:'Cormorant Garamond','Noto Serif TC','Noto Serif KR',serif;font-size:16.5px;font-weight:600;line-height:1.45}
.typ{flex:0 0 auto;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--light);text-align:right}
.kv{padding:6px 0;font-size:14px}
.kv b{font-weight:500}
.kv .sub{color:var(--light);font-size:12.5px}
.group{margin-bottom:26px}
.gtitle{font-size:12px;letter-spacing:.1em;color:var(--mid);font-weight:500;margin-bottom:8px}
.cl{display:flex;flex-wrap:wrap;gap:6px 0;font-size:14px}
.cl .it{padding:3px 0;flex:0 0 100%;display:flex;gap:10px;align-items:baseline}
.cl .nm{font-weight:400}
.cl .t1 .nm{font-weight:500}
.cl .sb{color:var(--light);font-size:12px}
.mailrow{font-size:16px}
.mail{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;border-color:var(--ac)}
.dl{display:inline-block;margin-top:10px;font-size:13px;color:var(--mid);text-decoration:none;border-bottom:1px solid var(--rule)}
.dl:hover{color:var(--ac);border-color:var(--ac)}
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
const HTML_LANG = { zh:'zh-Hant', ko:'ko', en:'en', es:'es' };
function render(l){
  const d = DATA[l];
  document.documentElement.lang = HTML_LANG[l];
  document.title = d.titleTag;
  let tlRows = '', lastYear = null;
  for (const r of d.tl){
    const y = r.y === lastYear ? '' : r.y; lastYear = r.y;
    tlRows += '<div class="row"><span class="yr">'+y+'</span><span class="ttl">'+esc(r.title)+'</span><span class="typ">'+esc(d.types[r.t]||'')+'</span></div>';
  }
  const partners = d.partners.map(p => '<div class="row"><span class="yr">'+esc(p.period.split('–')[0])+'</span><span class="ttl">'+esc(p.org)+'</span><span class="typ">'+esc(p.period)+'</span></div>'
    + '<div class="kv" style="margin:-6px 0 8px 62px"><span class="sub">'+esc(p.desc)+'</span></div>').join('');
  const clients = d.clients.map(g => '<div class="group"><div class="gtitle">'+esc(g.title)+'</div><div class="cl">'
    + g.items.map(it => '<span class="it'+'"><span class="nm">'+esc(it.name)+'</span>'+(it.sub?'<span class="sb">'+esc(it.sub)+'</span>':'')+'</span>').join('') + '</div></div>').join('');
  const edu = d.edu.map(e => '<div class="row"><span class="yr">'+esc(String(e.year).split('–')[0])+'</span><span class="ttl">'+esc(e.school)+'</span></div><div class="kv" style="margin:-6px 0 8px 62px"><span class="sub">'+esc(e.deg)+'</span></div>').join('');
  const em = t => esc(t).replace(/유홍빈|Yu Hung-pin|Hungpin Yu/g, m => '<b style="font-weight:600">'+m+'</b>');
  const pubs = d.pubs.map(x => '<div class="row"><span class="yr">'+x.y+'</span><span class="ttl">'+em(x.cko)+'</span><span class="typ">'+esc(x.kci)+'</span></div>'
    + '<div class="kv" style="margin:-6px 0 0 62px"><span class="sub">'+em(x.cen)+'</span></div>'
    + (x.tr ? '<div class="kv" style="margin:-2px 0 10px 62px"><span class="sub">'+esc(x.tr)+'</span></div>' : '<div style="height:10px"></div>')).join('');
  const langs = d.langs.map(x => '<div class="kv"><b>'+esc(x.name)+'</b> · <span class="sub">'+esc(x.level)+'</span></div>').join('');
  const certs = d.certs.map(c => '<div class="kv"><b>'+esc(c.name)+'</b><br><span class="sub">'+esc(c.issuer)+'</span></div>').join('');
  document.getElementById('app').innerHTML =
    '<header><h1>'+esc(d.name)+'</h1><div class="namesub">'+esc(d.nameSub)+'</div>'
    + '<p class="role">'+esc(d.role)+'</p>'
    + '<div class="tagline">'+esc(d.tagline)+'</div>'
    + '<div class="loc">'+esc(d.based)+' · '+esc(d.avail)+'</div></header>'
    + '<section><div class="slabel">'+esc(d.ui.contact)+'</div>'
    + '<div class="mailrow"><a class="mail" href="mailto:twkrbridge@gmail.com">twkrbridge@gmail.com</a></div>'
    + '<div class="kv"><span class="sub">'+esc(d.reply)+'</span></div>'
    + '<a class="dl" href="'+d.dl.file+'" download="'+esc(d.dl.name)+'">'+esc(d.dl.label)+'</a></section>'
    + '<section><div class="slabel">'+esc(d.ui.partners)+'</div>'+partners+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.work)+'</div>'
    + '<div class="kv" style="margin-bottom:12px"><span class="sub">'+esc(d.tlSub)+'</span></div>'+tlRows+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.clients)+'</div>'+clients+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.education)+'</div>'+edu+'</section>'
    + '<section><div class="slabel">'+esc(d.ui.research)+'</div>'
    + (d.bio ? '<div class="kv" style="margin-bottom:14px"><span class="sub" style="line-height:1.75">'+esc(d.bio)+'</span></div>' : '')
    + pubs+'</section>'
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
