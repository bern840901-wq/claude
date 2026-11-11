# -*- coding: utf-8 -*-
# Print twin of twkrpuente.web.app/cv/ — content parsed verbatim from the
# page's embedded DATA (all four languages, full 72-case timeline).
# Style maps the page's CSS 1:1 (px → pt × 0.75): white ground, hairline
# section rules, Cormorant-family serif (EB Garamond) + Inter + Noto CJK.
import json, os, re
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SP = os.path.dirname(os.path.abspath(__file__))
OUT = f'{SP}/cv-docx'
os.makedirs(OUT, exist_ok=True)

page = open('/home/user/claude/cv/index.html', encoding='utf-8').read()
m = re.search(r'const DATA = (\{.*?\});\n', page, re.S)
DATA = json.loads(m.group(1))

INK, MID, LIGHT, HAIR, AC = '14110D', '555555', '8F8A80', 'E9E5DC', 'E8410E'
SERIF, SANS = 'EB Garamond', 'Inter'
CJK_SERIF = {'zh': 'Noto Serif CJK TC', 'ko': 'Noto Serif CJK KR', 'en': 'Noto Serif CJK TC', 'es': 'Noto Serif CJK TC'}
CJK_SANS = {'zh': 'Noto Sans CJK TC', 'ko': 'Noto Sans CJK KR', 'en': 'Noto Sans CJK TC', 'es': 'Noto Sans CJK TC'}
FNAME = {'zh': '游宏斌_CV_精選版', 'ko': '游宏斌_CV_KO', 'en': '游宏斌_CV_EN', 'es': '游宏斌_CV_ES'}
strip = lambda s: re.sub(r'<[^>]+>', '', s or '')
track = lambda em, size: int(em * size * 20)   # letter-spacing em → w:spacing (1/20 pt)

# QR — ink on white, quiet, lives in the footer (the page's foot links → print URL)
import qrcode
from PIL import Image
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
q.add_data('https://twkrpuente.web.app/'); q.make(fit=True)
q.make_image(fill_color=(20, 17, 13), back_color=(255, 255, 255)).convert('RGB') \
 .resize((420, 420), Image.NEAREST).save(f'{OUT}/qr.png')


def set_font(run, size, color=MID, bold=False, name=SANS, east=None, sp=None, caps=False, ul=None):
    run.font.size = Pt(size); run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    run.font.name = name
    r = run._element.get_or_add_rPr()
    rf = r.find(qn('w:rFonts'))
    if rf is None: rf = OxmlElement('w:rFonts'); r.append(rf)
    for a in ('w:ascii', 'w:hAnsi'): rf.set(qn(a), name)
    for a in ('w:eastAsia', 'w:cs'): rf.set(qn(a), east or name)
    # No East Asian locale on purpose: under ko-KR or zh-TW LibreOffice ignores
    # WORD JOINER and no-break spaces (and a joiner between two syllables even
    # becomes a break). Korean words are kept whole by keep_korean_words().
    if sp:
        e = OxmlElement('w:spacing'); e.set(qn('w:val'), str(sp)); r.append(e)
    if caps:
        r.append(OxmlElement('w:caps'))
    if ul:
        e = OxmlElement('w:u'); e.set(qn('w:val'), 'single'); e.set(qn('w:color'), ul); r.append(e)


def para(doc, before=0, after=0, line=None, align=None, indent=None):
    p = doc.add_paragraph()
    f = p.paragraph_format
    f.space_before = Pt(before); f.space_after = Pt(after)
    if line: f.line_spacing = line
    if align: p.alignment = align
    if indent: f.left_indent = Cm(indent)
    return p


def hairline_top(p, space='14'):
    pPr = p._p.get_or_add_pPr()
    bd = OxmlElement('w:pBdr'); e = OxmlElement('w:top')
    e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), HAIR)
    e.set(qn('w:space'), space)
    bd.append(e); pPr.append(bd)


def slabel(doc, text, lang, before=19):
    # .slabel: 11px uppercase .22em light, hairline above, ~14px padding-top
    p = para(doc, before=before, after=8)
    hairline_top(p)
    r = p.add_run(T(text))
    set_font(r, 8.25, LIGHT, False, SANS, CJK_SANS[lang], sp=track(.22, 8.25), caps=True)
    return p


def no_borders(tbl):
    tblPr = tbl._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for tag in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{tag}'); e.set(qn('w:val'), 'none'); b.append(e)
    tblPr.append(b)


def fixed_widths(tbl, widths):
    tbl.autofit = False
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = tbl._tbl.tblPr
    layout = OxmlElement('w:tblLayout'); layout.set(qn('w:type'), 'fixed'); tblPr.append(layout)
    grid = tbl._tbl.find(qn('w:tblGrid'))
    for gc, w in zip(grid.findall(qn('w:gridCol')), widths): gc.set(qn('w:w'), str(w))
    for row in tbl.rows:
        for c, w in zip(row.cells, widths): c.width = Emu(w * 635)


def tcmar(cell, top, bottom, left=0, right=0):
    tcPr = cell._tc.get_or_add_tcPr()
    mm = OxmlElement('w:tcMar')
    for tag, v in (('top', top), ('bottom', bottom), ('left', left), ('right', right)):
        e = OxmlElement(f'w:{tag}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); mm.append(e)
    tcPr.append(mm)


def cantsplit(tbl):
    for tr in tbl.rows:
        trPr = tr._tr.get_or_add_trPr()
        trPr.append(OxmlElement('w:cantSplit'))


def hairline_left(p, space='4'):
    pPr = p._p.get_or_add_pPr()
    bd = OxmlElement('w:pBdr'); e = OxmlElement('w:left')
    e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), HAIR)
    e.set(qn('w:space'), space)
    bd.append(e); pPr.append(bd)


# Line-break hints come from the page build (linebreak.mjs → DATA[lang]['_lb']):
# n = gaps that must not break. A forbidden gap at a space becomes a no-break
# space; any other forbidden gap gets a WORD JOINER. Chinese gaps that are not
# word boundaries are in n too, so Chinese now breaks only between words.
# Presentation only: the PDF text differs from DATA by invisible characters.
import re as _re
_WJ, _NBSP, _NNBSP = '\u2060', '\u00a0', '\u202f'
_HANCJK = _re.compile(r'[\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]')   # Han + CJK punctuation, not Hangul
_HANGUL = _re.compile(r'[\uac00-\ud7a3\u1100-\u11ff\u3130-\u318f]')
LBM = {}
def lbkey(s):
    # same hash as linebreak.mjs lbKey: FNV-1a over UTF-16 code units, base 36
    h = 0x811c9dc5
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8); h = (h * 0x01000193) & 0xffffffff
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'; out = ''
    while True:
        h, r = divmod(h, 36); out = digits[r] + out
        if not h: return out
def T(text):
    """Apply the line-break hints to one display string."""
    if not text: return text
    code = LBM.get(lbkey(text))
    if not code: return text
    n = set()
    for part in code.split():
        a, _, b = part.partition('-'); n.update(range(int(a), int(b or a) + 1))
    out = []
    for i, c in enumerate(text):
        if i and i in n and c != ' ' and text[i - 1] != ' ' and not (_HANGUL.match(c) and _HANGUL.match(text[i - 1])):
            out.append(_WJ)
        if c == ' ' and (i + 1) in n:
            a = text[i - 1] if i else ''; b = text[i + 1] if i + 1 < len(text) else ''
            # LibreOffice does not hold U+00A0 next to Han; U+202F holds there, and two
            # of them are exactly as wide as a normal space. Next to Hangul or Latin,
            # U+00A0 holds (no East Asian locale) and keeps the normal width.
            out.append(_NNBSP * 2 if (_HANCJK.match(a or ' ') or _HANCJK.match(b or ' ')) else _NBSP)
        else:
            out.append(c)
    return ''.join(out)


_HG2 = _re.compile(r'(?<=[\uac00-\ud7a3])(?=[\uac00-\ud7a3])')
def keep_korean_words(doc):
    """Korean breaks only at spaces: a WORD JOINER between every two adjacent
    Hangul syllables, in every run of the document (titles quoted in the zh/en/es
    CVs too). Tested in LibreOffice 24.2: no mid-word breaks, and no-break spaces
    between Korean words then hold as well."""
    for t in doc.element.body.iter(qn('w:t')):
        if t.text and _HG2.search(t.text): t.text = _HG2.sub(_WJ, t.text)


ROW_WIDTHS = {'zh': (1050, 6940, 1250), 'ko': (1050, 6940, 1250), 'en': (1050, 6060, 2130), 'es': (1050, 6060, 2130)}


def rowtable(doc, entries, lang, widths=None):
    widths = widths or ROW_WIDTHS[lang]
    # the page's .row: [yr | ttl | typ] — 7px vertical padding, no rules.
    # A 4th entry field is the page's .kv.topic: the assignment's subject
    # matter, hung under the title behind the same hairline rule.
    KS, KA = CJK_SERIF[lang], CJK_SANS[lang]
    tb = doc.add_table(rows=len(entries), cols=3); no_borders(tb)
    fixed_widths(tb, list(widths)); cantsplit(tb)
    for i, ent in enumerate(entries):
        yr, ttl, typ = ent[0], ent[1], ent[2]
        topic = ent[3] if len(ent) > 3 else ''
        cells = tb.rows[i].cells
        for c in cells: tcmar(c, 46, 46, 0, 60)
        r = cells[0].paragraphs[0].add_run(yr); set_font(r, 9.4, LIGHT, False, SANS, KA)
        p = cells[1].paragraphs[0]; p.paragraph_format.line_spacing = 1.24
        r = p.add_run(T(ttl)); set_font(r, 11.5, INK, True, SERIF, KS)
        if topic:
            pt = cells[1].add_paragraph()
            f = pt.paragraph_format
            f.space_before = Pt(2); f.space_after = Pt(1); f.line_spacing = 1.34
            f.left_indent = Cm(0.22)
            hairline_left(pt)
            rt = pt.add_run(T(topic)); set_font(rt, 8.6, LIGHT, False, SANS, KA)
        p3 = cells[2].paragraphs[0]; p3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p3.add_run(T(typ)); set_font(r, 7.5, LIGHT, False, SANS, KA, sp=track(.14, 7.5), caps=True)
    return tb


def spacer(container):
    p = container.add_paragraph(); shrink(p); return p


def shrink(p):
    from docx.enum.text import WD_LINE_SPACING
    f = p.paragraph_format; f.space_before = Pt(0); f.space_after = Pt(0)
    f.line_spacing_rule = WD_LINE_SPACING.EXACTLY; f.line_spacing = Pt(1)
    return p


def entry_rows(container, entries, lang, widths=(1700, 7540)):
    # Education-style entries: [yr | title, then sub lines in the same cell].
    # One row per entry, rows can't split, title kept with its sub lines.
    # Two columns only: the page's .typ column is empty here, so the text cell
    # gets the full width a top-level sub_note paragraph used to have.
    KS, KA = CJK_SERIF[lang], CJK_SANS[lang]
    tb = container.add_table(rows=len(entries), cols=len(widths)); no_borders(tb)
    fixed_widths(tb, list(widths)); cantsplit(tb)
    for i, (yr, ttl, subs) in enumerate(entries):
        cells = tb.rows[i].cells
        for c in cells: tcmar(c, 46, 46, 0, 60)
        r = cells[0].paragraphs[0].add_run(yr); set_font(r, 9.4, LIGHT, False, SANS, KA)
        p = cells[1].paragraphs[0]; p.paragraph_format.line_spacing = 1.24; p.paragraph_format.keep_with_next = True
        r = p.add_run(T(ttl)); set_font(r, 11.5, INK, True, SERIF, KS)
        for j, sline in enumerate(subs):
            ps = cells[1].add_paragraph(); f = ps.paragraph_format
            f.space_before = Pt(1 if j == 0 else 0); f.space_after = Pt(3 if j == len(subs) - 1 else 0); f.line_spacing = 1.35
            if j < len(subs) - 1: f.keep_with_next = True
            r = ps.add_run(T(sline)); set_font(r, 9.4, LIGHT, False, SANS, KA)
    return tb


def sub_note(doc, text, lang, indent=1.64, before=0, after=3):
    p = para(doc, before=before, after=after, indent=indent, line=1.35)
    r = p.add_run(T(text)); set_font(r, 9.4, LIGHT, False, SANS, CJK_SANS[lang])
    return p



def add_link(p, text, url, size, color, name, east, ulcolor='C9C4BA'):
    from docx.opc.constants import RELATIONSHIP_TYPE as RT
    from docx.text.run import Run
    r_id = p.part.relate_to(url, RT.HYPERLINK, is_external=True)
    hl = OxmlElement('w:hyperlink'); hl.set(qn('r:id'), r_id)
    wr = OxmlElement('w:r'); wr.append(OxmlElement('w:rPr'))
    t = OxmlElement('w:t'); t.set(qn('xml:space'), 'preserve'); t.text = text; wr.append(t)
    hl.append(wr); p._p.append(hl)
    run = Run(wr, p)
    set_font(run, size, color, False, name, east, ul=ulcolor)
    return run


def build(lang):
    d = DATA[lang]
    global LBM; LBM = d.get('_lb', {})
    KS, KA = CJK_SERIF[lang], CJK_SANS[lang]
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.top_margin = Cm(1.9); sec.bottom_margin = Cm(2.4)
    sec.left_margin = sec.right_margin = Cm(2.67)
    doc.styles['Normal'].font.name = SANS
    doc.styles['Normal'].paragraph_format.space_after = Pt(0)

    # ── header ──
    p = para(doc, after=4)
    r = p.add_run(d['name']); set_font(r, 33, INK, True, SERIF, KS)
    p = para(doc, after=10)
    r = p.add_run(T(d['nameSub'])); set_font(r, 9.75, LIGHT, False, SANS, KA, sp=track(.14, 9.75))
    p = para(doc, after=7, line=1.7)
    r = p.add_run(T(strip(d['role']))); set_font(r, 11.25, MID, False, SANS, KA)
    p = para(doc, after=14)
    r = p.add_run(T(d['tagline'])); set_font(r, 9, LIGHT, False, SANS, KA, sp=track(.16, 9), caps=True)
    p = para(doc)
    r = p.add_run(T(d['based']) + ' · ' + T(d['avail'])); set_font(r, 10.1, MID, False, SANS, KA)

    # ── contact ──
    slabel(doc, d['ui']['contact'], lang, before=26)
    p = para(doc, after=5)
    r = p.add_run('twkrbridge@gmail.com'); set_font(r, 15.75, INK, True, SERIF, KS, ul=AC)
    p = para(doc)
    r = p.add_run(T(strip(d['reply']))); set_font(r, 9.4, LIGHT, False, SANS, KA)

    # ── long-term partners ──
    # ── interpreted for (principals first, the engagement under each) ──
    if d.get('interpretedFor'):
        slabel(doc, d['ui']['interpretedFor'], lang).paragraph_format.keep_with_next = True
        entry_rows(doc, [(str(x['year']), x['who'], [x['what']]) for x in d['interpretedFor']], lang)

    slabel(doc, d['ui']['partners'], lang)
    for pr in d['partners']:
        rowtable(doc, [(pr['period'].split('–')[0], pr['org'], pr['period'])], lang)
        sub_note(doc, pr['desc'], lang)

    # ── work (full timeline, year shown once per group) ──
    slabel(doc, d['ui']['work'], lang)
    p = para(doc, after=9, line=1.4)
    r = p.add_run(T(strip(d['tlSub']))); set_font(r, 9.4, LIGHT, False, SANS, KA)
    entries, last = [], None
    for row in d['tl']:
        y = '' if row['y'] == last else str(row['y'])
        last = row['y']
        entries.append((y, row['title'], d['types'].get(row['t'], ''), row.get('sub', '')))
    rowtable(doc, entries, lang)

    # ── clients ──
    slabel(doc, d['ui']['clients'], lang)
    for grp in d['clients']:
        p = para(doc, after=6)
        r = p.add_run(T(grp['title'])); set_font(r, 9, MID, True, SANS, KA, sp=track(.1, 9))
        for it in grp['items']:
            p = para(doc, after=1.5, line=1.2)
            r = p.add_run(T(strip(it['name']))); set_font(r, 10.5, INK, False, SANS, KA)
            if it.get('sub'):
                r = p.add_run('   ' + T(strip(it['sub']))); set_font(r, 9, LIGHT, False, SANS, KA)
        para(doc, after=7)

    # ── education ──
    # Each entry is one unsplittable row [yr | degree + school + scholarship], so a
    # title can never be parted from the lines under it.
    slabel(doc, d['ui']['education'], lang).paragraph_format.keep_with_next = True
    entry_rows(doc, [(str(e['year']), e['deg'],
                      [strip(e['school'])] + ([strip(e['note'])] if strip(e.get('note') or '') else []))
                     for e in d['edu']], lang)

    # ── language study (the site's 語言進修 block: school first, course under it) ──
    # Same construction as education: label kept with the first row, each entry
    # an unsplittable row, so the block may break only between entries.
    if d.get('langstudy'):
        slabel(doc, d['ui']['langstudy'], lang).paragraph_format.keep_with_next = True
        entry_rows(doc, [(str(x['y']), x['s'], [x['c']] + ([x['n']] if x.get('n') else [])) for x in d['langstudy']], lang)

    # ── research (KO title main, EN official small, zh/es translation) ──
    if d.get('pubs'):
        slabel(doc, d['ui']['research'], lang)
        if d.get('bio'):
            pb = para(doc, after=2, line=1.5); pb.paragraph_format.keep_together = True
            rb = pb.add_run(T(d['bio'])); set_font(rb, 9.4, LIGHT, False, SANS, CJK_SANS[lang])
        if d.get('orcid'):
            po = para(doc, after=9)
            add_link(po, 'ORCID ' + d['orcid']['id'], d['orcid']['url'], 8.6, LIGHT, SANS, CJK_SANS[lang])
        import re as _re
        _ME = '|'.join('\u2060?'.join(_re.escape(ch) for ch in nm) for nm in ('유홍빈', 'Yu Hung-pin', 'Hungpin Yu'))
        def _emrun(pp, text, size, color, name, east, base_bold=False):
            for part in _re.split('(' + _ME + ')', T(text)):
                if not part: continue
                rr = pp.add_run(part)
                own = part.replace('\u2060', '') in ('유홍빈', 'Yu Hung-pin', 'Hungpin Yu')
                set_font(rr, size, color, base_bold or own, name, east)
        for x in d['pubs']:
            tb = rowtable(doc, [(str(x['y']), '', x['kci'])], lang)
            pc = tb.rows[0].cells[1].paragraphs[0]; pc.paragraph_format.line_spacing = 1.24
            _emrun(pc, x['cko'], 10.6, INK, SERIF, CJK_SERIF[lang], base_bold=False)
            pe = para(doc, after=1, indent=1.64, line=1.35)
            _emrun(pe, x['cen'], 9.4, LIGHT, SANS, CJK_SANS[lang])
            if x.get('tr'):
                sub_note(doc, x['tr'], lang, after=1)
            if x.get('doiUrl'):
                pd = para(doc, after=6, indent=1.64)
                add_link(pd, 'doi.org/' + x['doi'], x['doiUrl'], 8.6, LIGHT, SANS, CJK_SANS[lang])
            else:
                para(doc, after=4)

    # ── teaching (talks & lessons) — same construction as education ──
    if d.get('teaching'):
        slabel(doc, d['ui']['teaching'], lang).paragraph_format.keep_with_next = True
        tb = entry_rows(doc, [(str(x['year']), x['title'], [x['org']] + ([x['note']] if x.get('note') else [])) for x in d['teaching']], lang)
        # optional public source (e.g. an education office press release): a small link line
        for i, x in enumerate(d['teaching']):
            if x.get('url') and x.get('linkLabel'):
                cell = tb.rows[i].cells[1]; cell.paragraphs[-1].paragraph_format.space_after = Pt(0)
                pl = cell.add_paragraph(); pl.paragraph_format.space_before = Pt(1); pl.paragraph_format.space_after = Pt(3); pl.paragraph_format.line_spacing = 1.35
                add_link(pl, T(x['linkLabel']), x['url'], 8.6, LIGHT, SANS, CJK_SANS[lang])

    # ── languages ──
    # Kept with the certs block below (and through it, the footer) so the
    # document always ends on a full credentials page rather than a thin one.
    sl = slabel(doc, d['ui']['languages'], lang); sl.paragraph_format.keep_with_next = True
    for x in d['langs']:
        p = para(doc, before=3, after=3, line=1.45); p.paragraph_format.keep_with_next = True
        r = p.add_run(T(strip(x['name']))); set_font(r, 9.75, LIGHT, True, SANS, KA, sp=track(.14, 9.75))
        r = p.add_run(' · '); set_font(r, 9.75, LIGHT, False, SANS, KA)
        r = p.add_run(T(strip(x['level']))); set_font(r, 9.4, LIGHT, False, SANS, KA)

    # ── certs / awards ──
    # Kept with what follows (the footer table) so the footer can never be
    # orphaned on a page of its own: if the body runs long, this whole block
    # moves to the last page together with it.
    sl = slabel(doc, d['ui']['certs'], lang); sl.paragraph_format.keep_with_next = True
    for c in d['certs']:
        p = para(doc, before=3, after=1); p.paragraph_format.keep_with_next = True
        r = p.add_run(T(c['name'])); set_font(r, 9.75, LIGHT, True, SANS, KA, sp=track(.14, 9.75))
        p = para(doc, after=4); p.paragraph_format.keep_with_next = True
        r = p.add_run(T(strip(c['issuer']))); set_font(r, 9.4, LIGHT, False, SANS, KA)

    # ── foot: the page's footer links become the printed URL + QR ──
    ft = doc.add_table(rows=1, cols=2); no_borders(ft)
    fixed_widths(ft, [7440, 1800])
    c0, c1 = ft.rows[0].cells
    tcmar(c0, 170, 0, 0, 0); tcmar(c1, 110, 0, 0, 0)
    p = c0.paragraphs[0]; hairline_top(p, space='10')
    add_link(p, T(d['cta2']), 'https://twkrpuente.web.app/home/', 9.4, LIGHT, SANS, KA)
    r = p.add_run('   ·   '); set_font(r, 9.4, LIGHT, False, SANS, KA)
    add_link(p, '▶ ' + T(d['ui']['film']), 'https://twkrpuente.web.app/', 9.4, LIGHT, SANS, KA)
    p2 = c0.add_paragraph(); p2.paragraph_format.space_before = Pt(4)
    r = p2.add_run('twkrpuente.web.app   ·   © 游宏斌 YU HUNG PIN')
    set_font(r, 9.4, LIGHT, False, SANS, KA)
    pq = c1.paragraphs[0]; pq.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pq.add_run().add_picture(f'{OUT}/qr.png', width=Cm(1.4))

    keep_korean_words(doc)
    doc.save(f'{OUT}/{FNAME[lang]}.docx')
    return f'{OUT}/{FNAME[lang]}.docx'


for lg in ['zh', 'ko', 'en', 'es']:
    print('built', build(lg))
