// Line-break hints for the CV, shared by the /cv/ page and the DOCX/PDF build.
//
// The data text is never changed. For every display string this computes two
// lists of positions (p = the gap between s[p-1] and s[p]):
//   n — breaks that must NOT happen (inside a name, number+unit, before a
//       separator, a short parenthetical, a short last word, …)
// Chinese word boundaries are every other gap between two letters in Chinese
// text: the page sets word-break:keep-all and puts <wbr> there, so Chinese
// breaks only between words (and at spaces and punctuation); the DOCX build
// puts WORD JOINER in every n gap.
// n is stored compactly as "a-b c d-e" (inclusive ranges of positions).
// The Chinese vocabulary comes from zh_terms.json (built from the CV's own
// text; add a term there when a new case brings a new name).
import fs from 'fs';

const here = new URL('.', import.meta.url);
const TERMS = JSON.parse(fs.readFileSync(new URL('zh_terms.json', here), 'utf8'));
// Multi-word names that must stay on one line, any language.
const NAMES = JSON.parse(fs.readFileSync(new URL('nobreak_names.json', here), 'utf8'));

const HAN = /[㐀-鿿豈-﫿]/;
const HANGUL = /[가-힣ᄀ-ᇿ㄰-㆏]/;
const LATIN = /[A-Za-z0-9À-ɏ]/;
const isLetter = c => HAN.test(c) || HANGUL.test(c) || LATIN.test(c);

const zhTerms = [...new Set(TERMS)].filter(t => t.length >= 2).sort((a, b) => b.length - a.length);
const names = [...new Set(NAMES)].sort((a, b) => b.length - a.length);
// terms indexed by first character (longest first) so long pages stay fast
const byFirst = new Map();
for (const t of zhTerms) { const k = t[0]; if (!byFirst.has(k)) byFirst.set(k, []); byFirst.get(k).push(t); }

// mark every gap strictly inside [a, b)
const tie = (set, a, b) => { for (let p = a + 1; p < b; p++) set.add(p); };
// forbid the break at the space at index k (a break at a space falls after it)
const tieSpace = (set, k) => { set.add(k); set.add(k + 1); };

function each(re, s, fn) { re.lastIndex = 0; let m; while ((m = re.exec(s))) { fn(m); if (m[0] === '') re.lastIndex++; } }

// opts.latinTail=false: no last-word tie in Latin text (web pages whose CSS already
// avoids orphans with text-wrap:pretty); opts.tail=false: no last-word tie at all
// (large display text, where a tied pair may not fit the line).
export function lbInfo(s, opts) {
  opts = opts || {};
  const useTail = opts.tail !== false, latinTail = useTail && opts.latinTail !== false;
  const n = new Set();
  const words = [];                  // Chinese units found, as [a, b)

  // 1. Chinese vocabulary: leftmost-longest, non-overlapping
  if (HAN.test(s)) {
    const taken = new Array(s.length).fill(false);
    for (let i = 0; i < s.length; i++) {
      if (taken[i] || !HAN.test(s[i]) && !LATIN.test(s[i])) continue;
      for (const t of (byFirst.get(s[i]) || [])) {
        if (s.startsWith(t, i)) {
          let free = true; for (let k = i; k < i + t.length; k++) if (taken[k]) { free = false; break; }
          if (!free) continue;
          for (let k = i; k < i + t.length; k++) taken[k] = true;
          words.push([i, i + t.length]); tie(n, i, i + t.length); i += t.length - 1; break;
        }
      }
    }
  }

  // 2. multi-word names (Google for Education, Academia Iria Flavia, 대만 행정원 …)
  for (const t of names) { let i = s.indexOf(t); while (i >= 0) { tie(n, i, i + t.length); i = s.indexOf(t, i + 1); } }

  // 3. numbers with their unit: 115年 · 6日 · 18人團 · 2 場 · 2026년 · 3개교 · 6 days
  each(/\d+(?:[.,]\d+)?\s?[年月日人名場件個天次週級屆期位所校家團梯班屆]+/g, s, m => tie(n, m.index, m.index + m[0].length));
  each(/\d+(?:[.,]\d+)?[가-힣]+/g, s, m => tie(n, m.index, m.index + m[0].length));
  each(/\d+(?:[.,]\d+)? (?=[a-záéíóúñ]{2,}\b)/g, s, m => tieSpace(n, m.index + m[0].length - 1));
  // ranges: 363-393 · 2016–2017 · 2025–至今
  each(/\d+ ?[-–] ?(?:\d+|至今|現在|현재|present|presente|actualidad)/g, s, m => tie(n, m.index, m.index + m[0].length));

  // 4. separators never open a line: "X · Y", "X — Y", "X × Y", "X / Y", "X・Y", "X/Y"
  each(/\S( )(?:·|—|–|×|\/|\||&)(?= |$)/g, s, m => tieSpace(n, m.index + 1));
  each(/\S(?=[・·\/／])/g, s, m => n.add(m.index + 1));
  // …and a 1-character pair around a dot or arrow stays whole: 한·중, 중↔한, 영→한
  each(/(?:^|[\s(（])(\S)[·・→↔⇄](\S)(?=$|[\s)）,，])/g, s, m => { const a = m.index + m[0].length - 3; tie(n, a, a + 3); });
  each(/\S[→↔⇄]\S/g, s, m => tie(n, m.index, m.index + 3));

  // 5. parentheticals: never break before the bracket; keep short ones whole
  each(/\S(?=[（(])/g, s, m => n.add(m.index + 1));
  each(/[（(][^（）()]{1,14}[）)]/g, s, m => { const inner = m[0].slice(1, -1); const cjk = (inner.match(/[㐀-鿿가-힣]/g) || []).length; const han = (inner.match(/[㐀-鿿]/g) || []).length; const list = /[・·]/.test(inner) && !/[\/,，、]/.test(inner); if ((han <= 6 && inner.length <= 10 && !/[・·\/,，、]/.test(inner)) || (list && inner.length <= 14 && cjk <= 10)) tie(n, m.index, m.index + m[0].length); });
  // "Service (KERIS)": an abbreviation in brackets stays with the word before it
  each(/\S( )\((?:[A-Z][A-Za-z0-9&.'’\-À-ɏ]{0,13})(?: [A-Z][A-Za-z\-À-ɏ]{1,10})?\)/g, s, m => tieSpace(n, m.index + 1));   // (KERIS) (Taiwan) (Kyung Hee); never a year
  each(/\S( )\([A-Z][A-Za-zÀ-ɏ0-9'’\-]{1,12}, [A-Z][a-zÀ-ɏ]{2,10}\)/g, s, m => { tieSpace(n, m.index + 1); tie(n, m.index + 2, m.index + m[0].length); });   // (TIAC, Taiwan) (Yilan, Taiwán)

  // 6. short bracketed titles stay whole: 《消失的國界》 <조선어> <THE BORDERLESS WORLD>
  each(/[《〈「<«“][^《》〈〉「」<>«»“”]{1,26}[》〉」>»”]/g, s, m => { const inner = m[0].slice(1, -1); const han = (inner.match(/[㐀-鿿]/g) || []).length, hg = (inner.match(/[가-힣]/g) || []).length; if (han <= 8 && hg <= 10 && inner.length <= 24) tie(n, m.index, m.index + m[0].length); });

  // abbreviation before a spelled-out name: "TITA (Administración …", "KERIS (Korea …"
  each(/\b[A-Z][A-Z0-9]{1,7}( )[（(]/g, s, m => tieSpace(n, m.index + m[0].length - 2));
  // inside a Latin-script parenthetical, the last two words stay together (no lone 'Agency)')
  each(/\(([^()]+)\)/g, s, m => {
    const inner = m[1]; if (!/[A-Za-z]/.test(inner) || /[㐀-鿿]/.test(inner)) return;
    const sp = []; for (let k = 0; k < inner.length; k++) if (inner[k] === ' ') sp.push(m.index + 1 + k);
    if (sp.length >= 2) tieSpace(n, sp[sp.length - 1]);
  });
  // "(BIFF)/ ACFM": a slash after a bracket keeps its neighbour
  each(/[)）]\/( )/g, s, m => tieSpace(n, m.index + 2));
  // ordinals and a year with the word after it: 5.º y 6.º · 2026 Busan
  each(/\d\.º y \d\.º/g, s, m => tie(n, m.index, m.index + m[0].length));
  each(/[㐀-鿿가-힣]( )(?=\d+ ?[級屆期급회])/g, s, m => tieSpace(n, m.index + 1));
  each(/\S( )(?=\d+\(\d+\))/g, s, m => tieSpace(n, m.index + 1));

  // a Chinese or Korean name keeps the abbreviation after it: 國際貿易署 TITA, 한국교육과정평가원 KICE
  each(/[㐀-鿿가-힣]( )(?=[A-Z][A-Z0-9&]{1,7}(?![A-Za-z0-9㐀-鿿]))/g, s, m => tieSpace(n, m.index + 1));

  // 7. Latin compounds: Cross-Cultural, Korean–Chinese, 한-대만
  each(/[A-Za-zÀ-ɏ가-힣]+(?:[-–][A-Za-zÀ-ɏ가-힣]+)+/g, s, m => { if (m[0].length <= 30) tie(n, m.index, m.index + m[0].length); });
  // ALL-CAPS names of 2–3 words: MORE ON ACADEMY, STUDIO DRAGON, YU HUNG PIN
  each(/\b[A-Z][A-Z0-9&.'’]+(?: [A-Z][A-Z0-9&.'’]*){1,2}\b/g, s, m => { if (m[0].length <= 24 && !/[a-z]/.test(m[0])) tie(n, m.index, m.index + m[0].length); });
  // "Univ. de Nayarit", "Univ. Kyung Hee", "Konkuk Univ.", "Depto. contra …"
  each(/\b(?:Univ|Dept|Depto|Int|Inst|Mfg|Org)\.( )(?=[A-Za-zÀ-ɏ])/g, s, m => tieSpace(n, m.index + m[0].length - 1));
  each(/[A-Za-zÀ-ɏ]( )(?:Univ|Dept|Depto)\./g, s, m => tieSpace(n, m.index + 1));
  // a level stays with its number: Nivel 6, Grade 5–6, TOPIK II 6
  each(/\b(?:Nivel|nivel|Level|level|Grade|grade|Grado|grado|II)( )\d/g, s, m => tieSpace(n, m.index + m[0].length - 2));

  // 8. Korean: a word (between spaces) never breaks inside, except after a
  //    separator with 2+ characters on both sides (질의응답・대만 may break after ・)
  each(/\S+/g, s, m => {
    const tok = m[0]; if (!HANGUL.test(tok)) return;
    for (let k = 1; k < tok.length; k++) {
      const a = tok[k - 1], b = tok[k];
      if (HANGUL.test(a) && HANGUL.test(b)) continue;          // keep-all / ko-KR already hold these
      if (LATIN.test(a) && LATIN.test(b)) continue;            // never a break opportunity
      if (/[・·\/,，、;]/.test(a)) {
        const left = tok.slice(0, k - 1).split(/[・·\/,，、;]/).pop(), right = tok.slice(k).split(/[・·\/,，、;]/)[0];
        if (left.length >= 2 && right.length >= 2) continue;
      }
      n.add(m.index + k);
    }
  });
  // country marker + institution (대만 행정원), person + title (○○○ 이사장)
  each(/(?:^|[\s・·(（])(?:대만|한국|주한|대만의) (?=\S)/g, s, m => tieSpace(n, m.index + m[0].length - 1));
  // a month stays with what follows it: 11 月教育部…, 11월 대만…, 5 月 NTCU…
  each(/\d{1,2} ?[月월](?= ?[^\s\d・·,，、。）)])/g, s, m => { const e = m.index + m[0].length; if (s[e] === ' ') tieSpace(n, e); else n.add(e); });
  // a one-character Chinese word right after an opening bracket stays with what follows: （自 2019 年…
  each(/[（(][\u3400-\u9fff] (?=\S)/g, s, m => tieSpace(n, m.index + m[0].length - 1));
  each(/[가-힣]{2,4} (?=(?:회장|부회장|이사장|사장|부사장|시장|부시장|군수|구청장|교장|총장|원장|대표|차관|장관|대사|국장|처장|청장|의원)(?:$|[\s,·・)]))/g, s, m => tieSpace(n, m.index + m[0].length - 1));

  // 9. no short last line: the last word (or Chinese unit) stays with the one before
  const tail = s.replace(/[\s.。．)）」》〉]+$/, '');
  const lastSpace = tail.lastIndexOf(' ');
  if (lastSpace > 0) {
    const last = tail.slice(lastSpace + 1);
    const prev = tail.slice(0, lastSpace).split(' ').pop() || '';
    let short;
    if (HANGUL.test(last)) short = useTail && last.length <= 4;
    else if (HAN.test(last)) short = useTail && last.length <= 2;
    else short = latinTail && last.length <= 15 && (prev.length + 1 + last.length) <= 26;   // never one word alone
    if (short && prev.length > 0) tieSpace(n, lastSpace);
  }
  // Chinese text: every gap between two letters that is NOT a word boundary
  // must not break (the page derives the <wbr> points as the complement)
  if (HAN.test(s)) {
    const inWord = new Set();
    for (const [a, b] of words) for (let p = a + 1; p < b; p++) inWord.add(p);
    for (let p = 1; p < s.length; p++) if (inWord.has(p)) n.add(p);
    // no short last line: the last allowed break must leave 4+ Chinese characters
    const tailEnd = s.replace(/[\s.。．)）」》〉、・]+$/, '').length;
    const L = /[㐀-鿿A-Za-z0-9가-힣]/;
    for (let p = useTail ? tailEnd - 1 : 0; p > 0; p--) {
      const atSpace = s[p - 1] === ' ';
      const letterGap = L.test(s[p - 1]) && L.test(s[p]) && (HAN.test(s[p - 1]) || HAN.test(s[p]));
      if (!(atSpace || letterGap) || n.has(p)) continue;
      const rest = s.slice(p, tailEnd), hanN = (rest.match(/[㐀-鿿]/g) || []).length;
      const latN = (rest.match(/[A-Za-z0-9]/g) || []).length;
      const short = atSpace ? (hanN <= 4 && latN === 0 && !/\s/.test(rest)) : ((hanN <= 3 && latN === 0 && !/\s/.test(rest)) || (hanN <= 2 && latN <= 5 && rest.length <= 8));
      if (short) { if (atSpace) tieSpace(n, p - 1); else n.add(p); }
      break;
    }
  }
  // gaps between two Latin letters or digits never break anyway; drop them
  const ps = [...n].filter(p => p > 0 && p < s.length && !(LATIN.test(s[p - 1]) && LATIN.test(s[p]))).sort((x, y) => x - y);
  if (!ps.length) return '';
  const parts = []; let a0 = ps[0], b0 = ps[0];
  for (const p of ps.slice(1)) { if (p === b0 + 1) b0 = p; else { parts.push(a0 === b0 ? String(a0) : a0 + '-' + b0); a0 = b0 = p; } }
  parts.push(a0 === b0 ? String(a0) : a0 + '-' + b0);
  return parts.join(' ');
}

export function decodeN(code) {
  const n = new Set();
  for (const part of String(code || '').split(' ')) { if (!part) continue; const [a, b] = part.split('-').map(Number); for (let p = a; p <= (b || a); p++) n.add(p); }
  return n;
}

// Hints are keyed by a short hash of the string (FNV-1a over UTF-16 code
// units, base 36) so the page does not carry every string twice. The page and
// build-cv-docx.py compute the same hash.
export function lbKey(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

// Walk a payload and collect hints for every display string.
export function lbMap(obj) {
  const map = {};
  const walk = o => {
    if (typeof o === 'string') { if (o.length > 1 && !/^https?:/.test(o)) { const k = lbKey(o); if (k in map) return; const c = lbInfo(o); if (c) map[k] = c; } }
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => { if (!['url', 'doiUrl', 'file', 'id'].includes(k)) walk(v); });
  };
  walk(obj);
  return map;
}

// Chinese stretches of 2+ characters that no vocabulary term covers: printed by
// the build so a new name from a new case gets added to zh_terms.json.
export function zhUncovered(obj) {
  const out = new Set();
  const walk = o => {
    if (typeof o === 'string') {
      if (!HAN.test(o)) return;
      const cov = new Array(o.length).fill(false);
      for (let i = 0; i < o.length; i++) { const t = (byFirst.get(o[i]) || []).find(t => o.startsWith(t, i)); if (t) { cov.fill(true, i, i + t.length); i += t.length - 1; } }
      let run = '';
      for (let i = 0; i <= o.length; i++) { if (i < o.length && HAN.test(o[i]) && !cov[i]) run += o[i]; else { if (run.length >= 2) out.add(run); run = ''; } }
    } else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => { if (k !== '_lb') walk(v); });
  };
  walk(obj);
  return [...out];
}
