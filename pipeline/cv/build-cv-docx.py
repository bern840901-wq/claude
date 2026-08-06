# -*- coding: utf-8 -*-
# Rebuild of the four-language CV 精選版 (2-page) from the site's live data.
# Content sources: cv_data.json (72-case timeline, partners, edu, langs, certs)
# + str_dict.json (site 4-language copy). Design tokens per twkr-cv-suite.
import json, os, re, subprocess, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

SP = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(f'{SP}/cv_data.json', encoding='utf-8'))
S = json.load(open(f'{SP}/str_dict.json', encoding='utf-8'))
OUT = f'{SP}/cv-docx'
os.makedirs(OUT, exist_ok=True)

NAVY, TAUPE, INK, TEAL, RULE = '152840', '7A6E62', '1C1810', '1D6E5E', 'D4C5B0'
BAN_L, BAN_R, BAN_TXT = '152840', '1E3A52', 'A8C4B8'
CAT = {  # text color / fill per skill §3
    'government': ('1A5E8A', 'E6F0F8'), 'business': ('7B4000', 'F5EDE0'),
    'media': ('5A2E7A', 'EDE6F5'), 'exhibition': ('1D6E5E', 'E0F0EC'),
}
CATL = {
    'government': {'zh': '政府・官方', 'ko': '정부·공공', 'en': 'Government · Official', 'es': 'Gobierno · Oficial'},
    'business': {'zh': '商務・技術', 'ko': '비즈니스·기술', 'en': 'Business · Tech', 'es': 'Negocios · Tecnología'},
    'media': {'zh': '媒體・影視', 'ko': '미디어·영상', 'en': 'Media · Film', 'es': 'Medios · Audiovisual'},
    'exhibition': {'zh': '展會・文化', 'ko': '전시·문화', 'en': 'Exhibition · Culture', 'es': 'Ferias · Cultura'},
}
FORM = {  # compact form labels (skill §8 table)
    'esc': {'zh': '隨行口譯', 'ko': '수행 통역', 'en': 'Escort', 'es': 'Acompañam.'},
    'mtg': {'zh': '會議口譯', 'ko': '회의 통역', 'en': 'Conference', 'es': 'Conferencia'},
    'int': {'zh': '訪談翻譯', 'ko': '인터뷰 통역', 'en': 'Interview', 'es': 'Entrevista'},
    'evt': {'zh': '活動翻譯', 'ko': '행사 통역', 'en': 'Event', 'es': 'Evento'},
    'exh': {'zh': '展會口譯', 'ko': '전시 통역', 'en': 'Exhibition', 'es': 'Feria'},
    'sub': {'zh': '字幕筆譯', 'ko': '자막 번역', 'en': 'Subtitling', 'es': 'Subtitulado'},
    'rep': {'zh': '業務代表', 'ko': '업무 담당', 'en': 'Representative', 'es': 'Representante'},
    'con': {'zh': '會議口譯', 'ko': '회의 통역', 'en': 'Conference', 'es': 'Conferencia'},
}

# ── curated case selection: match by zh title substring, order = final order ──
PICK = [
    '臺北流行音樂中心',            # 2026 NEW — Chosun Ilbo × TMC
    '臺灣國家教育研究院',          # NAER field study
    'NTCU × KERIS 業務協約',       # KERIS MOU
    'Google Korea',
    '釜山 Global OTT Awards',
    '三立《消失的國界》',
    '《我是遺物整理師》原型',
    '首爾三所高中',                # NTHU IBP
    '文化部次長',                  # 2025
    'STUDIO DRAGON',
    '釜山影展 BIFF',
    '桃園國際機場',
    '中華職棒 CPBL',               # 2024
    '民主勞總',
    '國立臺灣國樂團',              # 2023
    '數位發展部',                  # 2022
    '交通部鐵道局',                # 2021
    'SBS 電視劇《你喜歡布拉姆斯嗎》',  # 2020
    '警政署',
    'YICFFF',                      # 2016
]
# Spanish titles for the curated set (European style; orgs keep original/EN names)
ES_T = {
    '臺北流行音樂中心': "Chosun Ilbo × Taipei Music Center — entrevista exclusiva en video al presidente (ZH→KO consecutiva)",
    '臺灣國家教育研究院': "NAER (Taiwán) — estudio de campo en Corea sobre política de becas estatales (NIIED·KICE·KEDI)",
    'NTCU × KERIS 業務協約': "NTCU × KERIS — ceremonia de firma del MOU",
    'Google Korea': "Google Korea — reunión de Google for Education",
    '釜山 Global OTT Awards': "Global OTT Awards de Busan (KISF) — delegación de actores de Taiwán, para TAICCA",
    '三立《消失的國界》': "SETN <THE BORDERLESS WORLD> — serie de reportajes sobre la sociedad coreana",
    '《我是遺物整理師》原型': "Kim Sae-byeol ('Move to Heaven') — entrevista",
    '首爾三所高中': "NTHU IBP — visitas de admisión a tres institutos de Seúl",
    '文化部次長': "Viceministerio de Cultura de Taiwán × TAICCA — agenda oficial en Corea",
    'STUDIO DRAGON': "TAICCA × Studio Dragon — firma de MOU",
    '釜山影展 BIFF': "Festival de Cine de Busan (BIFF/ACFM) — acompañamiento oficial, TAICCA",
    '桃園國際機場': "Aeropuerto Int. de Taoyuan — visita oficial al Aeropuerto de Incheon",
    '中華職棒 CPBL': "Liga de béisbol CPBL (Taiwán) — visita oficial a la liga KBO (Corea)",
    '民主勞總': "KCTU × Confederación de Sindicatos de Taiwán — justicia climática y transición justa",
    '國立臺灣國樂團': "Orquesta Nacional China de Taiwán (NCO) — gira en Corea «和而不同»",
    '數位發展部': "Ministerio de Desarrollo Digital de Taiwán × III — intercambio tecnológico con Encored (Corea)",
    '交通部鐵道局': "Oficina Ferroviaria de Taiwán × KNR × KRRI — reunión técnica",
    'SBS 電視劇《你喜歡布拉姆斯嗎》': "SBS «Do You Like Brahms?» — subtítulos para Taiwán",
    '警政署': "Oficina de Taipéi en Corea × Policía × Aduanas de Incheon — visita oficial",
    'YICFFF': "YICFFF — Festival Int. de Folclore y Juegos Infantiles de Yilan (ZH·KO·EN) ✦ UNESCO CIOFF",
}
rows = []
for key in PICK:
    hit = next((r for r in D['TL'] if key in r[3]), None)
    assert hit, f'no TL match: {key}'
    rows.append({'y': hit[0], 't': hit[1], 'cat': hit[2],
                 'zh': hit[3], 'ko': hit[4], 'en': hit[5], 'es': ES_T[key]})
assert all(rows[i]['y'] >= rows[i+1]['y'] for i in range(len(rows)-1)), 'not year-descending'

UI = {
    'zh': {'profile': '專業簡介', 'partners': '長期合作單位', 'work': '精選口筆譯經歷（2016–2026）',
           'edu': '語言能力・資格・學歷', 'th': ['年份', '案件說明', '口譯形式', '類別'],
           'sub': '游宏斌 YU HUNG PIN', 'subsub': '유홍빈 · Bridging Intercultural Communication',
           'loc': '臺灣人 · 首爾定居 2017 至今', 'langsT': '語言能力', 'certsT': '資格與獎項', 'eduT': '正規學歷',
           'clients': '服務實績', 'full': '完整 60+ 案件作品集：twkrpuente.web.app（掃描 QR）'},
    'ko': {'profile': '프로필', 'partners': '장기 협력 기관', 'work': '주요 통번역 경력 (2016–2026)',
           'edu': '언어 능력 · 자격 · 학력', 'th': ['연도', '업무 내용', '통역 형태', '분류'],
           'sub': '유홍빈 YU HUNG PIN', 'subsub': '游宏斌 · Bridging Intercultural Communication',
           'loc': '대만인 · 2017년부터 서울 거주', 'langsT': '언어 능력', 'certsT': '자격·수상', 'eduT': '학력',
           'clients': '주요 클라이언트', 'full': '전체 60+ 케이스 포트폴리오: twkrpuente.web.app (QR 스캔)'},
    'en': {'profile': 'PROFILE', 'partners': 'LONG-TERM PARTNERS', 'work': 'SELECTED WORK (2016–2026)',
           'edu': 'LANGUAGES · CREDENTIALS · EDUCATION', 'th': ['Year', 'Case', 'Mode', 'Category'],
           'sub': 'YU HUNG PIN 游宏斌', 'subsub': '유홍빈 · Bridging Intercultural Communication',
           'loc': 'Taiwanese · based in Seoul since 2017', 'langsT': 'Languages', 'certsT': 'Credentials & Awards', 'eduT': 'Education',
           'clients': 'CLIENTS', 'full': 'Full 60+ case portfolio: twkrpuente.web.app (scan QR)'},
    'es': {'profile': 'PERFIL', 'partners': 'COLABORACIONES A LARGO PLAZO', 'work': 'EXPERIENCIA SELECCIONADA (2016–2026)',
           'edu': 'IDIOMAS · TÍTULOS · FORMACIÓN', 'th': ['Año', 'Caso', 'Modalidad', 'Categoría'],
           'sub': 'YU HUNG PIN 游宏斌', 'subsub': '유홍빈 · Bridging Intercultural Communication',
           'loc': 'Taiwanés · residente en Seúl desde 2017', 'langsT': 'Idiomas', 'certsT': 'Títulos y premios', 'eduT': 'Formación',
           'clients': 'CLIENTES', 'full': 'Portafolio completo (60+ casos): twkrpuente.web.app (escanear QR)'},
}
FNAME = {'zh': '游宏斌_CV_精選版', 'ko': '游宏斌_CV_KO', 'en': '游宏斌_CV_EN', 'es': '游宏斌_CV_ES'}
EMAIL, PHONE = 'twkrbridge@gmail.com', ''  # 電話號碼不入公開倉庫；正式產出時從私人存檔（CV 檔案庫 artifact）補上
strip = lambda s: re.sub(r'<[^>]+>', '', s)

# ── QR (skill §4: 420px, navy on white) ──
import qrcode
from PIL import Image
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
qr.add_data('https://twkrpuente.web.app/'); qr.make(fit=True)
qr.make_image(fill_color=(21, 40, 64), back_color=(255, 255, 255)).convert('RGB') \
  .resize((420, 420), Image.NEAREST).save(f'{OUT}/qr.png')

# ── docx helpers (minimal editorial style, mirrors /cv/ page tokens) ──
INKC, MID, LIGHT, HAIR, AC = '14110D', '555555', '8F8A80', 'E9E5DC', 'E8410E'
SERIF, SANS = 'EB Garamond', 'Inter'
CJK_SERIF = {'zh': 'Noto Serif CJK TC', 'ko': 'Noto Serif CJK KR', 'en': 'Noto Serif CJK TC', 'es': 'Noto Serif CJK TC'}
CJK_SANS = {'zh': 'Noto Sans CJK TC', 'ko': 'Noto Sans CJK KR', 'en': 'Noto Sans CJK TC', 'es': 'Noto Sans CJK TC'}

def set_font(run, size=8.5, color=MID, bold=False, name=SANS, east=None, track=None, caps=False):
    run.font.size = Pt(size); run.font.bold = bold
    run.font.color.rgb = RGBColor.from_string(color)
    run.font.name = name
    r = run._element.get_or_add_rPr()
    rf = r.find(qn('w:rFonts'))
    if rf is None: rf = OxmlElement('w:rFonts'); r.append(rf)
    for a in ('w:ascii', 'w:hAnsi'): rf.set(qn(a), name)
    for a in ('w:eastAsia', 'w:cs'): rf.set(qn(a), east or name)
    if track:
        sp = OxmlElement('w:spacing'); sp.set(qn('w:val'), str(track)); r.append(sp)
    if caps:
        cp = OxmlElement('w:caps'); r.append(cp)

def tcmar(cell, top=40, bottom=40, left=0, right=0):
    tcPr = cell._tc.get_or_add_tcPr()
    m = OxmlElement('w:tcMar')
    for tag, v in (('top', top), ('bottom', bottom), ('left', left), ('right', right)):
        e = OxmlElement(f'w:{tag}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); m.append(e)
    tcPr.append(m)

def vcenter(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    va = OxmlElement('w:vAlign'); va.set(qn('w:val'), 'center'); tcPr.append(va)

def no_borders(tbl):
    tblPr = tbl._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for tag in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{tag}'); e.set(qn('w:val'), 'none'); b.append(e)
    tblPr.append(b)

def hairline_top(p, color=HAIR):
    pPr = p._p.get_or_add_pPr()
    bd = OxmlElement('w:pBdr'); e = OxmlElement('w:top')
    e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), color)
    e.set(qn('w:space'), '10')
    bd.append(e); pPr.append(bd)

def para(doc, text=None, size=8.5, color=MID, bold=False, align=None,
         before=0, after=0, line=None, name=SANS, east=None, track=None, caps=False):
    p = doc.add_paragraph()
    fmt = p.paragraph_format
    fmt.space_before = Pt(before); fmt.space_after = Pt(after)
    if line: fmt.line_spacing = line
    if align: p.alignment = align
    if text is not None:
        r = p.add_run(text); set_font(r, size, color, bold, name, east, track, caps)
    return p

def section_label(doc, title, lang, before=13, after=6):
    # the page's .slabel: small uppercase letterspaced, hairline on top
    p = doc.add_paragraph(); hairline_top(p)
    p.paragraph_format.space_before = Pt(before); p.paragraph_format.space_after = Pt(after)
    r = p.add_run(title); set_font(r, 7.5, LIGHT, False, SANS, CJK_SANS[lang], track=44, caps=True)
    return p

def fixed_widths(tbl, widths):
    tbl.autofit = False
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = tbl._tbl.tblPr
    layout = OxmlElement('w:tblLayout'); layout.set(qn('w:type'), 'fixed'); tblPr.append(layout)
    grid = tbl._tbl.find(qn('w:tblGrid'))
    for gc, w in zip(grid.findall(qn('w:gridCol')), widths): gc.set(qn('w:w'), str(w))
    for row in tbl.rows:
        for c, w in zip(row.cells, widths): c.width = Emu(w * 635)

def cantsplit(tbl):
    for tr in tbl.rows:
        trPr = tr._tr.get_or_add_trPr()
        cs_el = OxmlElement('w:cantSplit'); trPr.append(cs_el)

def build(lang):
    L, U = lambda o: o[lang], UI[lang]
    KS, KA = CJK_SERIF[lang], CJK_SANS[lang]
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    for m in ('top_margin', 'bottom_margin'): setattr(sec, m, Cm(1.5))
    for m in ('left_margin', 'right_margin'): setattr(sec, m, Cm(1.7))
    doc.styles['Normal'].font.name = SANS
    doc.styles['Normal'].paragraph_format.space_after = Pt(0)

    NAME = {'zh': '游宏斌', 'ko': '유홍빈', 'en': 'YU HUNG PIN', 'es': 'YU HUNG PIN'}[lang]
    NSUB = {'zh': 'YU HUNG PIN · 유홍빈', 'ko': '游宏斌 · YU HUNG PIN',
            'en': '游宏斌 · 유홍빈', 'es': '游宏斌 · 유홍빈'}[lang]

    # ── header: seal, name, role, contact — white ground, no banner ──
    hd = doc.add_table(rows=1, cols=2); no_borders(hd)
    fixed_widths(hd, [7600, 1760])
    c0, c1 = hd.rows[0].cells
    tcmar(c0, 0, 40, 0, 100); tcmar(c1, 0, 0, 0, 0)
    p = c0.paragraphs[0]; p.paragraph_format.space_after = Pt(6)
    r = p.add_run('譯~역'); set_font(r, 11, AC, True, SERIF, KS)
    p = c0.add_paragraph(); p.paragraph_format.space_after = Pt(2)
    r = p.add_run(NAME + '  '); set_font(r, 23, INKC, True, SERIF, KS)
    r = p.add_run(NSUB); set_font(r, 9, LIGHT, False, SANS, KA, track=20)
    p = c0.add_paragraph(); p.paragraph_format.space_after = Pt(4); p.paragraph_format.line_spacing = 1.3
    r = p.add_run(strip(L(S)['role'])); set_font(r, 8.2, MID, False, SANS, KA)
    p = c0.add_paragraph()
    r = p.add_run(U['loc'] + '   ·   ' + PHONE + '   ·   ' + EMAIL)
    set_font(r, 7.8, LIGHT, False, SANS, KA)
    pq = c1.paragraphs[0]; pq.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pq.paragraph_format.space_after = Pt(2)
    pq.add_run().add_picture(f'{OUT}/qr.png', width=Cm(1.65))
    p = c1.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run('twkrpuente.web.app'); set_font(r, 6.6, LIGHT, False, SANS, KA, track=16)

    # ── one quiet summary line (the page's tlSub) ──
    para(doc, strip(L(S)['tlSub']), 8.6, MID, before=8, after=2, line=1.4, east=KA)

    # ── profile ──
    section_label(doc, U['profile'], lang)
    para(doc, strip(L(S)['lede']), 10.5, INKC, bold=True, after=4, line=1.4, name=SERIF, east=KS)
    para(doc, strip(L(S)['aboutDesc']), 8.4, MID, after=0, line=1.45, east=KA)

    # ── long-term partners ──
    section_label(doc, U['partners'], lang)
    pt = doc.add_table(rows=len(D['PARTNERS'][lang]), cols=3); no_borders(pt)
    fixed_widths(pt, [1150, 4310, 3900]); cantsplit(pt)
    for i, pr in enumerate(D['PARTNERS'][lang]):
        cells = pt.rows[i].cells
        for c in cells: tcmar(c, 26, 26, 0, 120)
        r = cells[0].paragraphs[0].add_run(pr['period']); set_font(r, 7.8, LIGHT, False, SANS, KA)
        r = cells[1].paragraphs[0].add_run(pr['org']); set_font(r, 9.6, INKC, True, SERIF, KS)
        r = cells[2].paragraphs[0].add_run(pr['desc']); set_font(r, 7.6, LIGHT, False, SANS, KA)
        vcenter(cells[0]); vcenter(cells[1]); vcenter(cells[2])

    # ── selected work (the page's timeline rows: year · title · type) ──
    section_label(doc, U['work'], lang)
    tb = doc.add_table(rows=len(rows), cols=3); no_borders(tb)
    fixed_widths(tb, [880, 6480, 2000]); cantsplit(tb)
    for i, cs in enumerate(rows):
        cells = tb.rows[i].cells
        for c in cells: tcmar(c, 30, 30, 0, 100)
        y = '2016–17' if cs['y'] == 2016 and 'YICFFF' in cs['zh'] else str(cs['y'])
        r = cells[0].paragraphs[0].add_run(y); set_font(r, 8, LIGHT, False, SANS, KA)
        r = cells[1].paragraphs[0].add_run(cs[lang]); set_font(r, 9.6, INKC, True, SERIF, KS)
        cells[1].paragraphs[0].paragraph_format.line_spacing = 1.22
        p3 = cells[2].paragraphs[0]; p3.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p3.add_run(FORM[cs['t']][lang]); set_font(r, 6.6, LIGHT, False, SANS, KA, track=28, caps=True)
        vcenter(cells[0]); vcenter(cells[2])
    para(doc, U['full'], 7.6, LIGHT, before=4, align=WD_ALIGN_PARAGRAPH.RIGHT, east=KA)

    # ── clients ──
    section_label(doc, U['clients'], lang)
    ct4 = doc.add_table(rows=1, cols=4); no_borders(ct4)
    fixed_widths(ct4, [2340, 2340, 2340, 2340])
    for gi, grp in enumerate(D['CLIENTS']):
        c = ct4.rows[0].cells[gi]; tcmar(c, 0, 0, 0, 140)
        p = c.paragraphs[0]; p.paragraph_format.space_after = Pt(4)
        r = p.add_run(grp['title'][lang]); set_font(r, 6.8, LIGHT, False, SANS, KA, track=30, caps=True)
        for it in grp['items']:
            p = c.add_paragraph(); p.paragraph_format.space_after = Pt(2.5); p.paragraph_format.line_spacing = 1.15
            r = p.add_run(strip(it['name'][lang])); set_font(r, 8.6, INKC, it['tier'] == 1, SERIF, KS)
            sub = strip(it['sub'][lang])
            if sub:
                r = p.add_run('  ' + sub); set_font(r, 6.8, LIGHT, False, SANS, KA)

    # ── languages / credentials / education ──
    section_label(doc, U['edu'], lang)
    bt = doc.add_table(rows=1, cols=2); no_borders(bt)
    fixed_widths(bt, [4680, 4680])
    left, right = bt.rows[0].cells
    tcmar(left, 0, 0, 0, 200); tcmar(right, 0, 0, 0, 0)
    p = left.paragraphs[0]; p.paragraph_format.space_after = Pt(3)
    r = p.add_run(U['langsT']); set_font(r, 6.8, LIGHT, False, SANS, CJK_SANS[lang], track=30, caps=True)
    for lg in D['LANGS']:
        p = left.add_paragraph(); p.paragraph_format.space_after = Pt(2.5); p.paragraph_format.line_spacing = 1.3
        r = p.add_run(strip(lg['name'][lang])); set_font(r, 8.8, INKC, True, SERIF, KS)
        r = p.add_run('　' + strip(lg['level'][lang])); set_font(r, 7.4, MID, False, SANS, KA)
    p = left.add_paragraph(); p.paragraph_format.space_before = Pt(6); p.paragraph_format.space_after = Pt(3)
    r = p.add_run(U['certsT']); set_font(r, 6.8, LIGHT, False, SANS, KA, track=30, caps=True)
    for ct in D['CERTS'][lang]:
        p = left.add_paragraph(); p.paragraph_format.space_after = Pt(2.5); p.paragraph_format.line_spacing = 1.3
        r = p.add_run(ct['name']); set_font(r, 8.8, INKC, True, SERIF, KS)
        r = p.add_run('　' + ct['issuer']); set_font(r, 7.4, MID, False, SANS, KA)
    p = right.paragraphs[0]; p.paragraph_format.space_after = Pt(3)
    r = p.add_run(U['eduT']); set_font(r, 6.8, LIGHT, False, SANS, KA, track=30, caps=True)
    for ed in D['EDU']:
        p = right.add_paragraph(); p.paragraph_format.space_after = Pt(1.5); p.paragraph_format.line_spacing = 1.3
        r = p.add_run(ed['year'] + '  '); set_font(r, 7.6, LIGHT, False, SANS, KA)
        r = p.add_run(ed['deg'][lang]); set_font(r, 8.8, INKC, True, SERIF, KS)
        p = right.add_paragraph(); p.paragraph_format.space_after = Pt(3)
        note = strip(ed['note'][lang])
        t = ed['school'][lang] + (('  ·  ' + note) if note else '')
        r = p.add_run('        ' + t); set_font(r, 7.4, MID, False, SANS, KA)

    doc.save(f'{OUT}/{FNAME[lang]}.docx')
    return f'{OUT}/{FNAME[lang]}.docx'

for lang in ['zh', 'ko', 'en', 'es']:
    f = build(lang)
    print('built', f)
