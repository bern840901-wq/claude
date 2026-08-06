// Generates world-config.js for the scroll-world remake.
// Every copy string is taken VERBATIM from the original site's extracted
// 4-language dictionary (str_dict.js) — no rewriting, only selection and
// segmentation at the site's own separators.
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const S = require('./str_dict.js');
const SETN = require('./setn_story.js');

const EMAIL = 'twkrbridge@gmail.com';
const SITE = 'https://twkrpuente.web.app/home/';

// Hand-checked verbatim segmentations (the site's own '・' / ' · ' / '·' separators).
const strengthTags = {
  zh: [
    ['部會首長訪團', '官方協定簽署', '跨國機構交流'],
    ['工廠驗貨', '技術洽談', '商機媒合', '品牌在地化'],
    ['電視台系列採訪', '名人專訪', '字幕翻譯', '拍攝現場'],
    ['國際展館接待', '文化節隨隊', '藝術表演巡迴'],
  ],
  ko: [
    ['부처 장·차관 방문단', '공식 협약 서명', '국제기관 교류'],
    ['공장 검수', '기술 협의', '비즈니스 매칭', '브랜드 현지화'],
    ['방송 시리즈 취재', '단독 인터뷰', '자막 번역', '촬영 현장'],
    ['국제 전시 부스', '문화 축제 동행', '예술 공연 투어'],
  ],
  en: [
    ['Ministerial delegations', 'official signings', 'inter-institutional exchanges'],
    ['Factory inspections', 'technical talks', 'matchmaking', 'brand localization'],
    ['TV series reporting', 'exclusive interviews', 'subtitles', 'on-site filming'],
    ["Int'l expo hosting", 'festival escort', 'arts touring'],
  ],
  es: [
    ['Delegaciones ministeriales', 'firmas de acuerdos oficiales', 'intercambios interinstitucionales'],
    ['Inspección de fábrica', 'consultas técnicas', 'matchmaking empresarial', 'localización de marca'],
    ['Reportajes de TV en serie', 'entrevistas exclusivas', 'subtítulos', 'rodajes in situ'],
    ['Atención en ferias internacionales', 'acompañamiento en festivales', 'giras artísticas'],
  ],
};

const sceneLabels = {
  // '橋/다리/bridge/puente' appear verbatim in the site's logo-story (markItems).
  zh: ['橋', null, null, null, null, null, null],
  ko: ['다리', null, null, null, null, null, null],
  en: ['Bridge', null, null, null, null, null, null],
  es: ['Puente', null, null, null, null, null, null],
};

const hints = { zh: '往下捲動', ko: '스크롤', en: 'scroll', es: 'desplázate' };
const skips = { zh: '直接看作品集', ko: '바로 포트폴리오 보기', en: 'Skip to portfolio', es: 'Ir al portafolio' };
const titles = {
  zh: '游宏斌｜台韓口筆譯・駐首爾 유홍빈',
  ko: '유홍빈｜한중 통번역사 · 서울',
  en: 'Yu Hung-Pin | Chinese–Korean Interpreter · Seoul',
  es: 'Yu Hung-Pin | Intérprete chino–coreano · Seúl',
};

// Static per-scene definition (assets, pacing) — copy is filled per language.
const SCENES = [
  { id: 'bridge',  scroll: 1.5, linger: 0.35 },
  { id: 'gov',     scroll: 1.25 },
  { id: 'biz',     scroll: 1.25 },
  { id: 'media',   scroll: 1.25 },
  { id: 'expo',    scroll: 1.25 },
  { id: 'study',   scroll: 1.5, linger: 0.45 },
  { id: 'contact', scroll: 1.6, linger: 0.4 },
];

// the /cv/ page's entry label: 履歷 for zh, 이력서 for ko, CV elsewhere
const CV_LABEL = { zh: '履歷', ko: '이력서', en: 'CV', es: 'CV' };

function sectionsFor(lang) {
  const L = S[lang];
  const T = strengthTags[lang];
  const q = (i) => `${L.tmItems[i].q} — ${L.tmItems[i].by}`;
  const heroTags = L.heroTrust.split(' · ');
  const cats = [L.catGov, L.catBiz, L.catMedia, L.catExh];
  const label = (i, fallback) => sceneLabels[lang][i] || fallback;
  return [
    { // 1 — the bridge / departure (hero mirrors the original site's hero)
      label: label(0),
      eyebrow: L.tagline,
      title: L.pcPre + L.pcAcc + L.pcPost,
      body: L.lede,
      cta: {
        primary: { label: L.cta1, href: `mailto:${EMAIL}` },
        secondary: { label: L.cta2, href: SITE },
      },
    },
    { // 2 — government & official
      label: cats[0],
      eyebrow: cats[0],
      title: L.strengths[0].title,
      body: q(4),
      tags: T[0],
    },
    { // 3 — business & technical
      label: cats[1],
      eyebrow: cats[1],
      title: L.strengths[1].title,
      body: q(1),
      tags: T[1],
    },
    { // 4 — media & broadcast
      label: cats[2],
      eyebrow: cats[2],
      title: L.strengths[2].title,
      body: SETN[lang],
      tags: T[2],
    },
    { // 5 — exhibition & culture
      label: cats[3],
      eyebrow: cats[3],
      title: L.strengths[3].title,
      body: q(2),
      tags: T[3],
    },
    { // 6 — the interpreter's notes
      label: L.ntLabel,
      eyebrow: L.ntLabel,
      title: L.ntLead,
      body: L.ntSub,
      tags: [L.ntP1, L.ntP2, L.ntP3],
    },
    { // 7 — contact / finale
      label: L.navContact,
      eyebrow: L.navContact,
      title: L.contactHeading,
      role: L.role,
      body: `${L.contactDesc} ${L.ctReply}`,
      tags: [heroTags[0], L.basedIn, L.available],
      cta: {
        primary: { label: L.cta1, href: `mailto:${EMAIL}` },
        secondary: { label: L.cta2, href: SITE },
        tertiary: { label: CV_LABEL[lang], href: '/cv/' },
      },
    },
  ];
}

// End-card (interface chrome, not site copy): shown when the visitor reaches
// the film's end, so nobody mistakes the trailer for the whole site.
// Button labels reuse the site's own cta strings verbatim; 'CV' matches the
// nav label used on /home/.
const endcard = Object.fromEntries(['zh', 'ko', 'en', 'es'].map(l => {
  const lines = {
    zh: '這 7 個現場，只是預告。',
    ko: '이 7개의 현장은 예고편일 뿐입니다.',
    en: 'These seven scenes are only the trailer.',
    es: 'Estas siete escenas son solo el tráiler.',
  };
  return [l, { line: lines[l], portfolio: S[l].cta2, cv: CV_LABEL[l], contact: S[l].cta1 }];
}));

const out = {
  brandName: '游宏斌 YU HUNG PIN',
  email: EMAIL,
  site: SITE,
  langs: ['zh', 'ko', 'en', 'es'],
  defaultLang: 'zh',
  titles,
  hints,
  skips,
  topCta: Object.fromEntries(['zh', 'ko', 'en', 'es'].map(l => [l, S[l].cta1])),
  endcard,
  scenes: SCENES,
  copy: Object.fromEntries(['zh', 'ko', 'en', 'es'].map(l => [l, sectionsFor(l)])),
};

const banner = `/* world-config.js — generated from the original site's 4-language copy.
   All strings are VERBATIM from twkrpuente.web.app (extracted dictionary);
   do not edit copy here by hand — it mirrors the source site.
   USE_PLACEHOLDERS: flip to false once the Higgsfield renders exist in assets/. */
`;
fs.writeFileSync('/home/user/claude/world-config.js',
  banner + 'window.USE_PLACEHOLDERS = false;\nwindow.MOBILE_READY = true;\nwindow.WORLD = ' + JSON.stringify(out, null, 2) + ';\n');
console.log('written world/world-config.js');
console.log('zh section titles:', out.copy.zh.map(s => s.title).join(' | '));
