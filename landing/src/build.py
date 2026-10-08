"""Builds every page of the Growthity site into landing/*.html.

Pages share one header (mega menu + mobile menu), one footer, site.css and site.js. Live demos are
HTML blocks in src/blocks/, written once and reused on the home page and on the inner pages.
Run: python3 landing/src/build.py
"""
import html
import os
import re
import sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)
sys.path.insert(0, SRC)
from sitemap import PAGES, GROUPS, NEW, FEATURED, TONES, ICONS, CHEV, ARROW, CHECK  # noqa: E402

AUTH = 'https://growthity.ai/auth'
EXT = ' target="_blank" rel="noopener"'
HOME = 'index.html'


def block(name):
    with open(os.path.join(SRC, 'blocks', name + '.html'), encoding='utf-8') as f:
        return f.read().rstrip('\n')


def mini(mid):
    """One card of the 'Tout le reste' grid, picked by its scene id (m-insp, m-tpl, m-clone, ...)."""
    m = re.search(r'  <article class="mini rv">\n(?:(?!</article>).)*?id="%s"(?:(?!</article>).)*?</article>' % mid, block('minis'), re.S)
    return m.group(0).strip()


def href(slug):
    return slug + '.html'


def tone(t):
    c, s = TONES[t]
    return ' style="--tone:%s;--tone-soft:%s"' % (c, s)


def thumb_html(src, alt=''):
    return '<img src="media/%s" alt="%s" loading="lazy">' % (src, html.escape(alt, quote=True))


# ---------------------------------------------------------------- header / footer

LOGO_SVG = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#2563EB"/><stop offset=".52" stop-color="#5B3FE4"/><stop offset="1" stop-color="#9333EA"/></linearGradient></defs><path d="M2 17 8.5 10.5 13.5 15.5 22 7M16 7h6v6" stroke="url(#lg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def mitem(entry, current):
    slug = entry[0] if isinstance(entry, tuple) else entry
    g, title, desc, ic, t, _ = PAGES[slug]
    if isinstance(entry, tuple):
        title, desc, ic, t = entry[1], entry[2], entry[3], entry[4]
        current = None
    cur = ' aria-current="page"' if slug == current else ''
    new = ' <span class="new">Nouveau</span>' if slug in NEW else ''
    return ('<a class="mitem" href="%s"%s><span class="ic"%s>%s</span><span><b>%s%s</b><small>%s</small></span></a>'
            % (href(slug), cur, tone(t), ICONS[ic], html.escape(title), new, html.escape(desc)))


def featured(key):
    """Mini product-UI card at the right of a mega-menu panel."""
    go = ARROW.replace('<svg', '<svg width="14" height="14"')
    if key == 'produit':
        ads = [('lena-serum.poster.webp', 'Gagnant', ''), ('ugc-solaire.poster.webp', '5 j', ' lose'), ('real-42.poster.webp', 'Gagnant', '')]
        ui = ('<div class="mui"><div class="mq"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.6-4.6"/></svg>'
              'sérum vitamine C<span class="chip ok">● 4 gagnantes</span></div><div class="mads">%s</div></div>'
              % ''.join('<div class="mad%s"><img src="media/%s" alt="" loading="lazy"><span>%s</span></div>' % (c, m, t) for m, t, c in ads))
        return ('<a class="mfeat ui" href="espion-meta-ads.html">%s<span class="new">Nouveau</span><b>Espion Meta Ads</b>'
                '<small>Growthity repère les pubs de votre secteur qui tournent depuis des semaines.</small><span class="go">Découvrir %s</span></a>' % (ui, go))
    if key == 'ressources':
        ch = ['Le hook des 3 secondes', 'Le script qui vend', 'Choisir le bon acteur', 'Tester sans se ruiner']
        ui = ('<div class="mui guide"><span class="gtag">Guide · 8 min de lecture</span><b>La pub UGC<br>qui convertit</b><ol>%s</ol><div class="gbar"><i></i></div></div>'
              % ''.join('<li><i>0%d</i>%s</li>' % (i + 1, c) for i, c in enumerate(ch)))
        return ('<a class="mfeat ui" href="guide-pub-ugc.html">%s<b>Apprenez la méthode</b>'
                '<small>Hooks, scripts, acteurs, tests : tout pour créer des pubs qui vendent.</small><span class="go">Lire le guide %s</span></a>' % (ui, go))
    return ''


def header(current):
    group = PAGES[current][0] if current in PAGES else None
    from sitemap import FEATURED  # noqa: F811
    btns, panels, sheet = [], [], []
    for key, (label, cols) in GROUPS.items():
        cls = ' cur' if key == group else ''
        btns.append('<button class="nl%s" type="button" data-p="%s" aria-expanded="false" aria-controls="mp-%s">%s%s</button>' % (cls, key, key, label, CHEV))
        colhtml = ''.join('<div class="mgroup">%s%s</div>' % ('<h6>%s</h6>' % h if h else '<h6>&nbsp;</h6>', ''.join(mitem(s, current) for s in items)) for h, items in cols)
        feat_html = featured(key) if key in FEATURED else ''
        panels.append('<div class="mpanel%s" id="mp-%s">%s%s</div>' % ('' if feat_html else ' c3', key, colhtml, feat_html))
        allitems = ''.join(mitem(s, current) for _, items in cols for s in items if not isinstance(s, tuple))
        sheet.append('<details%s><summary>%s%s</summary><div class="mlist">%s</div></details>' % (' open' if key == group else '', label, CHEV, allitems))
    demo_cur = ' aria-current="page"' if current == 'index' else ''
    return '''<div class="announce">
  <div class="wrap">
    <span><b>500 crédits offerts</b> <span class="muted hide-sm">sur votre premier abonnement Growthity</span></span>
    <a href="%(auth)s"%(ext)s>En profiter →</a>
  </div>
</div>

<header class="nav">
  <div class="wrap">
    <div class="bar">
      <a class="logo" href="%(home)s" aria-label="growthity.ai, accueil">
        %(logo)s
        growthity<b>.ai</b>
      </a>
      <nav class="nav-links" aria-label="Menu principal">
        %(btns)s
        <a href="%(home)s#demo"%(democur)s>Démo</a>
      </nav>
      <div class="mega" id="mega">%(panels)s</div>
      <div class="nav-cta">
        <a class="login" href="%(auth)s"%(ext)s>Connexion</a>
        <a class="btn btn-grad" href="%(auth)s"%(ext)s>S'inscrire</a>
        <button class="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><i></i></button>
      </div>
      <div class="mnav" id="mnav">%(sheet)s<div class="mcta"><a class="btn btn-ghost" href="%(auth)s"%(ext)s>Connexion</a><a class="btn btn-grad" href="%(auth)s"%(ext)s>S'inscrire</a></div></div>
    </div>
  </div>
</header>''' % dict(auth=AUTH, ext=EXT, home=HOME, logo=LOGO_SVG, btns='\n        '.join(btns), panels=''.join(panels),
                    sheet=''.join(sheet), democur=demo_cur)


def footer():
    cols = []
    for key, (label, groups) in GROUPS.items():
        links = ''.join('<li><a href="%s">%s</a></li>' % (href(s), html.escape(PAGES[s][1])) for _, items in groups for s in items if not isinstance(s, tuple))
        cols.append('<div><h6>%s</h6><ul>%s</ul></div>' % (label, links))
    legal = ''.join('<li><a href="https://growthity.ai/%s"%s>%s</a></li>' % (p, EXT, t) for p, t in
                    [('cgv', 'CGV'), ('mentions-legales', 'Mentions légales'), ('politique-de-confidentialite', 'Confidentialité'), ('suppression-des-donnees', 'Suppression des données')])
    return '''<footer class="foot">
  <div class="wrap">
    <div class="cols">
      <div class="about">
        <a class="logo" href="%s"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 17 8.5 10.5 13.5 15.5 22 7M16 7h6v6" stroke="url(#lg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>growthity<b>.ai</b></a>
        <p>Créez, publiez et pilotez vos pubs Facebook et Instagram avec l'IA. Conçu en France, hébergé en Europe.</p>
      </div>
      %s
      <div><h6>Légal</h6><ul>%s</ul></div>
    </div>
    <div class="base"><span>© 2026 Growthity · Conçu en France, hébergé en Europe</span><span>0 %% de commission sur votre budget Meta</span></div>
  </div>
</footer>''' % (HOME, '\n      '.join(cols), legal)


BASE = 'https://growthity.ai'
SEO = {}
for _f in sorted(os.listdir(os.path.join(SRC, 'seo'))) if os.path.isdir(os.path.join(SRC, 'seo')) else []:
    if _f.endswith('.json'):
        import json as _json
        with open(os.path.join(SRC, 'seo', _f), encoding='utf-8') as _h:
            SEO.update(_json.load(_h))


def url(slug):
    return BASE + '/' if slug == 'index' else '%s/%s' % (BASE, slug)


def strip(t):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()


def seo_section(slug):
    d = SEO.get(slug)
    if not d:
        return ''
    blocks = ''.join('<div class="seo-b rv"><h3>%s</h3><p>%s</p></div>' % (fr(x['h3']), fr(x['p'])) for x in d['sections'])
    links = ''.join('<a href="%s">%s</a>' % (href(t) if t != 'index' else HOME, html.escape(a)) for a, t in d.get('links', []) if t != slug)
    return '''<section class="seo">
  <div class="wrap">
    <div class="seo-in">
      <div class="seo-head rv"><div class="eyebrow">En détail</div><h2>%s</h2><p>%s</p></div>
      <div class="seo-grid">%s</div>
    </div>
    %s
  </div>
</section>''' % (fr(d['h2']), fr(d['intro']), blocks, '<nav class="seo-links rv" aria-label="Recherches associées"><span>Recherches associées</span>%s</nav>' % links if links else '')


def with_seo(slug, body):
    sec_html = seo_section(slug)
    if not sec_html:
        return body
    for marker in ('<section class="tint" style="padding-top:60px">', '<section id="faq"', '<div class="final rv">'):
        i = body.find(marker)
        if i >= 0:
            return body[:i] + sec_html + '\n\n' + body[i:]
    return body + sec_html


def jsonld(slug, title, desc, body):
    import json
    org = {'@type': 'Organization', '@id': BASE + '/#org', 'name': 'Growthity', 'url': BASE + '/', 'logo': BASE + '/favicon.svg',
           'description': "Créez, publiez et pilotez vos pubs Facebook et Instagram avec l'IA. Conçu en France, hébergé en Europe.", 'areaServed': 'FR'}
    graph = [org]
    if slug == 'index':
        graph.append({'@type': 'WebSite', '@id': BASE + '/#site', 'url': BASE + '/', 'name': 'Growthity', 'inLanguage': 'fr-FR', 'publisher': {'@id': BASE + '/#org'}})
    if slug in ('index', 'chat-ia'):
        graph.append({'@type': 'SoftwareApplication', 'name': 'Growthity', 'applicationCategory': 'BusinessApplication', 'operatingSystem': 'Web',
                      'url': BASE + '/', 'inLanguage': 'fr-FR', 'description': desc, 'publisher': {'@id': BASE + '/#org'},
                      'featureList': ['Vidéos UGC générées par IA', '500+ acteurs UGC IA', 'Visuels et carrousels', 'Espion Meta Ads',
                                      'Publication Facebook et Instagram', 'Pilotage IA des campagnes', 'Leads et ventes attribués']})
    if slug in PAGES:
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': BASE + '/'},
            {'@type': 'ListItem', 'position': 2, 'name': PAGES[slug][1], 'item': url(slug)}]})
    if slug == 'guide-pub-ugc':
        graph.append({'@type': 'Article', 'headline': 'La pub UGC qui convertit', 'description': desc, 'inLanguage': 'fr-FR', 'url': url(slug),
                      'image': BASE + '/og/%s.jpg' % slug, 'author': {'@id': BASE + '/#org'}, 'publisher': {'@id': BASE + '/#org'}})
    qa = re.findall(r'<summary>(.*?)<i></i></summary><p>(.*?)</p>', body, re.S)
    if qa:
        seen, items = set(), []
        for q, a in qa:
            q = strip(q)
            if q in seen:
                continue
            seen.add(q)
            items.append({'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}})
        graph.append({'@type': 'FAQPage', 'mainEntity': items})
    return '<script type="application/ld+json">%s</script>' % json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False).replace('</', '<\\/')


def seo_head(slug, title, desc, body):
    og = BASE + '/og/%s.jpg' % slug
    e = lambda t: html.escape(t, quote=True)  # noqa: E731
    return '''<link rel="canonical" href="%(u)s">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#FCFCFD">
<meta property="og:type" content="%(ty)s">
<meta property="og:site_name" content="Growthity">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="%(t)s">
<meta property="og:description" content="%(d)s">
<meta property="og:url" content="%(u)s">
<meta property="og:image" content="%(og)s">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%(t)s">
<meta name="twitter:description" content="%(d)s">
<meta name="twitter:image" content="%(og)s">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
%(ld)s''' % dict(u=url(slug), ty='article' if slug == 'guide-pub-ugc' else 'website', t=e(title), d=e(desc), og=og, ld=jsonld(slug, title, desc, body))


def page(slug, title, desc, body):
    if slug in SEO:
        title, desc = SEO[slug]['title'], SEO[slug]['description']
    body = with_seo(slug, body)
    return '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%s</title>
<meta name="description" content="%s">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500&family=Grand+Hotel&display=swap">
<link rel="stylesheet" href="site.css">
%s
</head>
<body>

%s

<main id="top">
%s
</main>

%s

<script src="site.js"></script>
</body>
</html>
''' % (html.escape(title), html.escape(desc, quote=True), seo_head(slug, title, desc, body), header(slug), body, footer())


# ---------------------------------------------------------------- components

def fr(t):
    """French typography: no line break before ? ! : ; (non-breaking space)."""
    return re.sub(r' ([?!:;»])', '&nbsp;\\1', re.sub(r'« ', '«&nbsp;', t))


def h1(plain, grad=''):
    plain, grad = fr(plain), fr(grad)
    words = plain.split()
    out = ' '.join('<span class="w" style="--i:%d">%s</span>' % (i, w) for i, w in enumerate(words))
    if grad:
        out += ' <span class="w grad" style="--i:%d">%s</span>' % (len(words), grad)
    return '<h1>%s</h1>' % out


def crumbs(slug):
    g = PAGES[slug][0]
    return ('<nav class="crumbs" aria-label="Fil d\'Ariane"><a href="%s">Accueil</a>%s<span>%s</span>%s<span>%s</span></nav>'
            % (HOME, CHEV.replace('<path d="m6 9 6 6 6-6"/>', '<path d="m9 6 6 6-6 6"/>'), GROUPS[g][0],
               CHEV.replace('<path d="m6 9 6 6 6-6"/>', '<path d="m9 6 6 6-6 6"/>'), html.escape(PAGES[slug][1])))


def ctas(second=None):
    s = second or ('Voir la démo', HOME + '#demo')
    return ('<div class="hero-cta"><a class="btn btn-grad" href="%s"%s>Essayer Growthity %s</a><a class="btn btn-ghost" href="%s">%s</a></div>'
            % (AUTH, EXT, ARROW, s[1], s[0]))


META = ('<div class="hero-meta"><span>' + CHECK.replace('3.5', '3') + 'Conçu en France, hébergé en Europe</span><span>' + CHECK.replace('3.5', '3') +
        'Aucune compétence technique</span><span>' + CHECK.replace('3.5', '3') + '0 % de commission</span></div>')


def ticks(items):
    return '<ul class="ticks">%s</ul>' % ''.join('<li>%s%s</li>' % (CHECK, t) for t in items)


def hero_split(slug, pill, plain, grad, lede, tick_items, stage, second=None):
    return '''<div class="phero">
  <div class="wrap">
    <div class="split">
      <div class="copy">
        %s
        <span class="pill"><span class="tag">%s</span> %s</span>
        %s
        <p class="lede">%s</p>
        %s
        %s
      </div>
      %s
    </div>
  </div>
</div>''' % (crumbs(slug), pill[0], pill[1], h1(plain, grad), fr(lede), ticks(tick_items) if tick_items else '', ctas(second), stage)


def media(m, cls='', alt=''):
    """A video (name without extension) or an image (name with extension) from media/."""
    a = html.escape(re.sub('<[^>]+>|&nbsp;', ' ', alt), quote=True)
    if '.' in m:
        return '<img src="media/%s" alt="%s" loading="lazy"%s>' % (m, a, cls)
    lab = ' aria-label="%s"' % a if a else ''
    return '<video data-src="media/%s.mp4" poster="media/%s.poster.webp" muted loop playsinline preload="none"%s%s></video>' % (m, m, lab, cls)


def floats(items):
    return ''.join('<div class="fl %s%s" aria-hidden="true">%s</div>' % (k, ' sq' if '.' in m else '', media(m)) for k, m in zip('abcd', items))


def hero_center(slug, pill, plain, grad, lede, demo='', second=None, meta=True, fl=None):
    return '''<div class="phero center">%s
  <div class="wrap">
    %s
    <span class="pill"><span class="tag">%s</span> %s</span>
    %s
    <p class="lede">%s</p>
    %s
    %s
    %s
  </div>
</div>''' % (floats(fl) if fl else '', crumbs(slug), pill[0], pill[1], h1(plain, grad), fr(lede), ctas(second), META if meta else '',
             '<div class="bigdemo">%s</div>' % demo if demo else '')


def section(inner, cls='', sid='', style=''):
    a = (' class="%s"' % cls if cls else '') + (' id="%s"' % sid if sid else '') + (' style="%s"' % style if style else '')
    return '<section%s>\n  <div class="wrap">\n%s\n  </div>\n</section>' % (a, inner)


def head(eyebrow, plain, grad='', p='', more=None):
    plain, grad, p = fr(plain), fr(grad), fr(p)
    g = ' <span class="grad">%s</span>' % grad if grad else ''
    m = '<a class="more" href="%s">%s %s</a>' % (more[1], more[0], ARROW) if more else ''
    return '<div class="head rv">%s<h2>%s%s</h2>%s%s</div>' % (
        '<div class="eyebrow">%s</div>' % eyebrow if eyebrow else '', plain, g, '<p>%s</p>' % p if p else '', m)


def facts(items):
    return '<div class="wrap factsw"><div class="facts rv">%s</div></div>' % ''.join('<div><b>%s</b><span>%s</span></div>' % f for f in items)


def steps(items):
    return '<div class="steps3">%s</div>' % ''.join('<div class="step rv"><h3>%s</h3><p>%s</p></div>' % (fr(a), fr(c)) for a, c in items)


def features(items, md=None):
    if md:
        return bento(items, md)
    return '<div class="fgrid">%s</div>' % ''.join(
        '<div class="fcard rv"><span class="ic"%s>%s</span><h3>%s</h3><p>%s</p></div>' % (tone(t), ICONS[ic], fr(h), fr(p)) for ic, t, h, p in items)


def bento(items, md):
    """Feature grid with two large cards carrying a video or image (md: two media names)."""
    n, out, mi = len(items), [], iter(md)
    for i, (ic, t, h, p) in enumerate(items):
        big = i in (0, 3)
        wide = n == 6 and i == 5
        m = next(mi, None) if big else None
        txt = '<div><span class="ic"%s>%s</span><h3>%s</h3><p>%s</p></div>' % (tone(t), ICONS[ic], fr(h), fr(p))
        cls = 'bcard rv' + (' big' if big and m else '') + (' wide' if wide or (big and not m) else '')
        out.append('<div class="%s"%s>%s%s</div>' % (cls, tone(t), txt, '<div class="md">%s</div>' % media(m, alt='Exemple de pub Meta : ' + h) if m else ''))
    return '<div class="bento">%s</div>' % ''.join(out)


def hooks(items):
    return '<div class="hooks">%s</div>' % ''.join(
        '<div class="hook rv"><span class="chip">%s</span><q>%s</q><small><b>Pourquoi ça marche :</b> %s</small></div>' % (t, fr(q), fr(w)) for t, q, w in items)


XI = '<i><svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></i>'
VI = '<i><svg viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></i>'


def pains(big_without, without, big_with, with_):
    return ('<div class="vs static"><div class="col without rv"><div class="lab">Sans Growthity</div><div class="big">%s</div><ul>%s</ul></div>'
            '<div class="col with rv"><div class="lab">Avec Growthity</div><div class="big">%s</div><ul>%s</ul></div></div>'
            % (big_without, ''.join('<li class="x">%s<span>%s</span></li>' % (XI, fr(x)) for x in without),
               big_with, ''.join('<li class="in">%s%s</li>' % (VI, fr(x)) for x in with_)))


def faq2(items, title='Vos questions.', p="Tout ce qu'il faut savoir avant de vous lancer."):
    return ('<div class="faq2"><div class="fside rv"><div class="eyebrow">Questions fréquentes</div><h2>%s</h2><p>%s</p>'
            '<a class="more" href="faq.html">Toutes les questions %s</a></div>%s</div>' % (fr(title), fr(p), ARROW, faq(items)))


MODELS = ('<div class="models"><p>Propulsé par les meilleurs modèles d\'IA</p><div class="marq" aria-label="Modèles d\'IA utilisés">'
          '<div class="track" id="models"></div></div></div>')


def chat_custom(scens):
    """Chat demo running this page's own scenarios (labels become the tabs; a single one hides them)."""
    import json
    tabs = ''.join('<button role="tab" aria-selected="%s" data-s="%d">%s<span class="pg"><i></i></span></button>'
                   % ('true' if i == 0 else 'false', i, html.escape(sc['label'])) for i, sc in enumerate(scens))
    blk = block('chat-demo')
    i, j = blk.index('<div class="scen"'), blk.index('</div>', blk.index('<div class="scen"')) + 6
    solo = ' style="display:none"' if len(scens) == 1 else ''
    blk = blk[:i] + '<div class="scen" role="tablist" aria-label="Scénarios de démonstration"%s>%s</div>' % (solo, tabs) + blk[j:]
    data = json.dumps([{k: v for k, v in sc.items() if k != 'label'} for sc in scens], ensure_ascii=False).replace('</', '<\\/')
    return '<script>window.GROWTHITY_SCEN=%s</script>\n%s' % (data, blk)


def specs(items):
    """'Tout le détail' sheet: (icon, tone, title, [lines]) cards listing exact app capabilities."""
    return '<div class="specs">%s</div>' % ''.join(
        '<div class="spec rv"%s><h3><span class="ic">%s</span>%s</h3><ul>%s</ul></div>' % (tone(t), ICONS[ic], fr(h), ''.join('<li><span>%s</span></li>' % fr(x) for x in lines))
        for ic, t, h, lines in items)


def nums(items):
    return '<div class="wrap factsw"><div class="nums rv">%s</div></div>' % ''.join('<div><b>%s</b><span>%s</span></div>' % (b, fr(t)) for b, t in items)


def split(copy_html, mock_html, flip=False):
    return feat(copy_html, '<div class="stage rv">%s</div>' % mock_html, flip)


def uses(items):
    out = []
    for label, link in items:
        if link:
            out.append('<a href="%s">%s%s</a>' % (link, ICONS['check'], label))
        else:
            out.append('<span>%s%s</span>' % (ICONS['check'], label))
    return '<div class="uses rv">%s</div>' % ''.join(out)


def related(slugs):
    cards = []
    for s in slugs:
        g, title, desc, ic, t, th = PAGES[s]
        cards.append('<a class="rcard rv" href="%s"><div class="th">%s<span class="ic"%s>%s</span></div><div class="tx"><h3>%s</h3><p>%s</p><span class="go">Découvrir %s</span></div></a>'
                     % (href(s), thumb_html(th, title + ' avec Growthity'), tone(t), ICONS[ic], html.escape(title), html.escape(desc), ARROW))
    return '<div class="rel">%s</div>' % ''.join(cards)


def faq(items):
    return '<div class="faq">%s</div>' % ''.join('<details><summary>%s<i></i></summary><p>%s</p></details>' % (fr(q), fr(a)) for q, a in items)


def feat(copy, stage, flip=False):
    return '<div class="feat%s">\n%s\n%s\n</div>' % (' flip' if flip else '', copy, stage)


def copy(eyebrow, plain, grad, p, tick_items=None, more=None):
    m = '<a class="more" href="%s">%s %s</a>' % (more[1], more[0], ARROW) if more else ''
    plain, grad, p = fr(plain), fr(grad), fr(p)
    return '<div class="copy rv"><div class="eyebrow">%s</div><h2>%s <span class="grad">%s</span></h2><p>%s</p>%s%s</div>' % (
        eyebrow, plain, grad, p, ticks(tick_items) if tick_items else '', m)


def with_more(blk, slug, label='En savoir plus'):
    """Adds an 'En savoir plus' link at the end of a copy/head block from the home page."""
    i = blk.rstrip().rfind('</div>')
    return blk[:i] + '  <a class="more" href="%s">%s %s</a>\n' % (href(slug), label, ARROW) + blk[i:]


def final():
    return block('final')


def stack(*parts):
    return '\n\n'.join(p for p in parts if p)


# ---------------------------------------------------------------- build

def write(name, content):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(content)


if __name__ == '__main__':
    from pages import build_pages
    built = build_pages(sys.modules[__name__])
    for name, (title, desc, body) in built.items():
        write(name + '.html', page(name, title, desc, body))
    order = ['index'] + [s for s in PAGES]
    urls = ''.join('<url><loc>%s</loc><changefreq>weekly</changefreq><priority>%s</priority></url>' % (url(s), '1.0' if s == 'index' else '0.8' if PAGES[s][0] != 'ressources' else '0.6') for s in order if s in built)
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">%s</urlset>\n' % urls)
    write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n' % BASE)
    print('built %d pages (%d with SEO copy)' % (len(built), len([k for k in built if k in SEO])))
