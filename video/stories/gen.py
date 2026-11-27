"""Stories « à la une » Instagram Growthity : génère les pages HTML (1080×1920) puis rendu Playwright → out/*.png/jpg.
Zone sûre stories : contenu entre 260 et 1600 px de haut."""
import os, json, subprocess
V = '/home/user/projet/video'
F = f'file://{V}/node_modules/@fontsource/inter/files/inter-latin-'
HEAD = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:I;font-weight:500;src:url({F}500-normal.woff2)}}
@font-face{{font-family:I;font-weight:700;src:url({F}700-normal.woff2)}}
@font-face{{font-family:I;font-weight:800;src:url({F}800-normal.woff2)}}
@font-face{{font-family:I;font-weight:900;src:url({F}900-normal.woff2)}}
*{{margin:0;box-sizing:border-box}}
body{{width:1080px;height:1920px;overflow:hidden;font-family:I,sans-serif;position:relative;background:#F4F1EA;color:#16141A}}
.glow{{position:absolute;inset:0;background:radial-gradient(900px 900px at 75% 20%,rgba(91,63,228,.20),transparent 70%),radial-gradient(800px 800px at 10% 90%,rgba(37,99,235,.14),transparent 70%)}}
.dark{{background:#0E0C1A;color:#fff}}
.g{{background:linear-gradient(120deg,#2563EB,#5B3FE4 52%,#9333EA);-webkit-background-clip:text;color:transparent}}
.gl{{background:linear-gradient(120deg,#60A5FA,#A78BFA 55%,#F0ABFC);-webkit-background-clip:text;color:transparent}}
.brand{{position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center;align-items:center;gap:14px;font-weight:800;font-size:42px;letter-spacing:-.02em}}
.tag{{display:inline-block;font-weight:800;font-size:30px;letter-spacing:.16em;color:#5B3FE4;background:rgba(91,63,228,.1);padding:12px 24px;border-radius:999px}}
.h1{{font-weight:900;font-size:110px;line-height:.98;letter-spacing:-.05em}}
.p{{font-weight:500;font-size:44px;line-height:1.3;color:#4B4752}}
.card{{background:#fff;border-radius:40px;box-shadow:0 40px 90px -40px rgba(40,30,20,.45),0 2px 6px rgba(40,30,20,.06)}}
.btn{{display:inline-block;background:#16141A;color:#fff;font-weight:900;font-size:46px;padding:28px 56px;border-radius:999px}}
.dots{{position:absolute;left:0;right:0;top:1640px;display:flex;justify-content:center;gap:12px}}
.dots i{{width:14px;height:14px;border-radius:7px;background:rgba(22,20,26,.2)}}.dots i.on{{background:#5B3FE4;width:40px}}
.ph{{position:absolute;inset:0;background-size:cover;background-position:center}}
.shade{{position:absolute;left:0;right:0;bottom:0;height:1200px;background:linear-gradient(transparent,rgba(0,0,0,.78))}}
</style></head><body>"""
LOGO = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="url(#lg)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2563EB"/><stop offset=".5" stop-color="#5B3FE4"/><stop offset="1" stop-color="#9333EA"/></linearGradient></defs><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>'
def brand(dark=False): return f'<div class="brand" style="color:{"#fff" if dark else "#16141A"}">{LOGO}growthity<span class="g">.ai</span></div>'
def dots(n, k, dark=False):
    return '<div class="dots">' + ''.join(f'<i class="{"on" if i == k else ""}" style="{"background:rgba(255,255,255,.35)" if dark and i != k else ""}"></i>' for i in range(n)) + '</div>'
def img(p): return f'file://{V}/{p}'
S = {}
# 1 · GROWTHITY
S['1-growthity-1'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:90px;right:90px;top:470px"><span class="tag">BIENVENUE 👋</span>
<div class="h1" style="margin-top:40px">Growthity,<br><span class="g">c'est quoi ?</span></div>
<p class="p" style="margin-top:44px">L'outil qui crée tes <b style="color:#16141A">pubs vidéo avec l'IA</b> et les lance sur <b style="color:#16141A">Facebook et Instagram</b>.</p>
<p class="p" style="margin-top:28px">Pas de tournage. Pas d'agence. Une phrase suffit.</p></div>{dots(2,0)}"""
items = [('✍️', 'Crée tes pubs vidéo', 'acteur, voix, sous-titres, montage'), ('🚀', 'Lance-les sur Meta Ads', 'Facebook + Instagram, guidé pas à pas'), ('📈', 'Suis tes performances', 'et les conseils de l’IA'), ('📩', 'Reçois tes leads', 'directement dans Growthity'), ('📅', 'Publie sur tes réseaux', 'Instagram, Facebook, TikTok, YouTube, LinkedIn'), ('🔔', 'Alertes WhatsApp', 'nouveau lead, pub qui s’essouffle…')]
rows = ''.join(f'<div style="display:flex;gap:26px;align-items:center;padding:24px 30px;{"border-top:2px solid #EEEAF3;" if i else ""}"><div style="width:84px;height:84px;border-radius:22px;background:#F3F0FB;display:grid;place-items:center;font-size:44px;flex:none">{e}</div><div><div style="font-weight:800;font-size:40px;letter-spacing:-.02em">{t}</div><div style="font-weight:500;font-size:30px;color:#6E6A73;margin-top:4px">{d}</div></div></div>' for i, (e, t, d) in enumerate(items))
S['1-growthity-2'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:70px;right:70px;top:400px"><div class="h1" style="font-size:92px">Tout.<br><span class="g">Au même endroit.</span></div>
<div class="card" style="margin-top:46px;padding:14px 10px">{rows}</div></div>{dots(2,1)}"""
# 2 · COMMENT ÇA MARCHE
S['2-comment-1'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:90px;right:90px;top:440px"><span class="tag">ÉTAPE 1 / 3</span>
<div class="h1" style="margin-top:36px">Écris<br><span class="g">une phrase.</span></div>
<div class="card" style="margin-top:60px;padding:40px">
<div style="font-weight:700;font-size:30px;color:#6E6A73">Que veux-tu créer aujourd'hui ?</div>
<div style="margin-top:22px;border:3px solid #5B3FE4;border-radius:28px;padding:30px;font-weight:600;font-size:40px;line-height:1.3">« Une pub vidéo pour ma nouvelle bougie, ambiance cosy, avec une actrice »</div>
<div style="display:flex;justify-content:flex-end;margin-top:22px"><div style="width:96px;height:96px;border-radius:48px;background:linear-gradient(120deg,#2563EB,#5B3FE4,#9333EA);display:grid;place-items:center;color:#fff;font-size:48px;font-weight:900">↑</div></div></div>
<p class="p" style="margin-top:40px">Growthity analyse ta marque et tes produits, puis écrit le script.</p></div>{dots(3,0)}"""
faces = ''.join(f'<div style="width:196px;height:245px;border-radius:24px;background:url({img("public/media/actors-real/r%03d.jpg" % k)}) center/cover;{"outline:6px solid #5B3FE4;outline-offset:-6px;" if k == 26 else ""}"></div>' for k in [0, 26, 37, 11, 13, 22, 9, 74, 85])
S['2-comment-2'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:90px;right:90px;top:440px"><span class="tag">ÉTAPE 2 / 3</span>
<div class="h1" style="margin-top:36px">Choisis<br><span class="g">ton acteur.</span></div>
<div style="margin-top:56px;display:grid;grid-template-columns:repeat(3,196px);gap:20px;justify-content:center">{faces}</div>
<p class="p" style="margin-top:40px">Des visages réalistes, ou un rendu cinématique. Voix, sous-titres et montage sont faits pour toi.</p></div>{dots(3,1)}"""
S['2-comment-3'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:90px;right:90px;top:440px"><span class="tag">ÉTAPE 3 / 3</span>
<div class="h1" style="margin-top:36px">Publie<br><span class="g">sur Meta.</span></div>
<div class="card" style="margin-top:60px;padding:44px;text-align:center">
<div style="display:inline-flex;align-items:center;gap:16px;background:#1877F2;color:#fff;font-weight:900;font-size:46px;padding:30px 54px;border-radius:999px;box-shadow:0 24px 50px -20px rgba(24,119,242,.7)">∞ Publier sur Meta</div>
<div style="margin-top:34px;font-weight:700;font-size:34px;color:#15803D">✓ Ta pub tourne sur Facebook et Instagram</div></div>
<p class="p" style="margin-top:40px">Pas de compte Meta Ads ? Growthity te guide pour le créer et le connecter.</p></div>{dots(3,2)}"""
# 3 · EXEMPLES
ex = [('thumbs/luxe-bg.jpg', 'Maillots de bain', 'Pub plage, style agence'), ('thumbs/luxe3-bg.jpg', 'Voyage & lifestyle', 'Santorin, coucher de soleil'), ('thumbs/ecom-actor.jpg', 'E-commerce', 'Une actrice + ton produit'), ('thumbs/b3d-bg.jpg', 'Commerce local', 'Le boulanger, en animation 3D')]
for i, (p, t, d) in enumerate(ex):
    S[f'3-exemples-{i+1}'] = f"""<div class="ph" style="background-image:url({img(p)})"></div><div class="shade"></div>
<div style="position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center"><div style="background:rgba(255,255,255,.92);border-radius:999px;padding:14px 30px;font-weight:800;font-size:34px;display:flex;align-items:center;gap:12px">{LOGO.replace('56', '40')}Créée avec Growthity</div></div>
<div style="position:absolute;left:80px;right:80px;top:1260px;color:#fff"><div style="font-weight:800;font-size:34px;letter-spacing:.14em;opacity:.85">EXEMPLE {i+1} / {len(ex)}</div>
<div style="font-weight:900;font-size:96px;letter-spacing:-.045em;line-height:1;margin-top:14px">{t}</div><div style="font-weight:500;font-size:42px;margin-top:16px;opacity:.9">{d}</div>
<div style="font-weight:700;font-size:34px;margin-top:22px" class="gl">Aucun tournage. Une phrase.</div></div>{dots(len(ex), i, True)}"""
# 4 · LEADS
st = [('Nouveau', '#2563EB'), ('Contacté', '#9333EA'), ('Devis envoyé', '#EA580C'), ('RDV fixé', '#0EA5E9'), ('Gagné', '#16A34A')]
leads = [('Sophie M.', 'Toulouse', 0), ('Karim B.', 'Lyon', 2), ('Julie D.', 'Nantes', 3), ('Hugo L.', 'Lille', 4)]
lrows = ''.join(f'<div style="display:flex;align-items:center;gap:22px;padding:24px 28px;{"border-top:2px solid #EEEAF3;" if i else ""}"><div style="width:72px;height:72px;border-radius:36px;background:#F3F0FB;display:grid;place-items:center;font-weight:900;font-size:32px;color:#5B3FE4">{n[0]}</div><div style="flex:1"><div style="font-weight:800;font-size:36px">{n}</div><div style="font-weight:500;font-size:28px;color:#6E6A73">{v} · via ta pub Meta</div></div><div style="font-weight:800;font-size:27px;color:{st[s][1]};background:{st[s][1]}1A;padding:10px 20px;border-radius:999px">{st[s][0]}</div></div>' for i, (n, v, s) in enumerate(leads))
S['4-leads-1'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:70px;right:70px;top:420px"><span class="tag">LEADS</span>
<div class="h1" style="margin-top:36px;font-size:96px">Tes leads arrivent<br><span class="g">dans Growthity.</span></div>
<div class="card" style="margin-top:50px;padding:10px 0">{lrows}</div>
<p class="p" style="margin-top:36px">Fini les leads achetés et partagés avec tes concurrents : ils sont à toi.</p></div>{dots(2,0)}"""
chips = ''.join(f'<div style="font-weight:800;font-size:36px;color:{c};background:{c}1A;padding:18px 32px;border-radius:999px">{t}</div>' for t, c in st)
S['4-leads-2'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:80px;right:80px;top:440px"><span class="tag">SUIVI</span>
<div class="h1" style="margin-top:36px;font-size:100px">Tes statuts,<br><span class="g">à ta façon.</span></div>
<div style="margin-top:56px;display:flex;flex-wrap:wrap;gap:18px">{chips}<div style="font-weight:800;font-size:36px;color:#5B3FE4;border:3px dashed #A78BFA;padding:15px 30px;border-radius:999px">+ Créer un statut</div></div>
<p class="p" style="margin-top:50px">Donne un statut à chaque lead, ou crée les tiens. Tu vois en un coup d'œil où en est chaque contact.</p></div>{dots(2,1)}"""
# 5 · TARIF
S['5-tarif-1'] = f"""<div class="ph" style="background-image:url({img('thumbs/luxe2-bg.jpg')});filter:blur(2px) brightness(.55)"></div>
{brand(True)}
<div style="position:absolute;left:80px;right:80px;top:560px;color:#fff;text-align:center">
<div style="font-weight:800;font-size:40px;letter-spacing:.2em;opacity:.85">TES PUBS VIDÉO DÈS</div>
<div style="font-weight:900;font-size:230px;letter-spacing:-.06em;line-height:1;margin-top:16px" class="gl">19,99 €</div>
<div style="font-weight:800;font-size:56px;margin-top:6px">par mois</div>
<div style="margin-top:60px;display:inline-block;text-align:left;font-weight:700;font-size:40px;line-height:1.7">✓ Pubs vidéo avec acteurs IA<br>✓ Publication sur Meta Ads<br>✓ Leads et performances<br>✓ Posts sur tes réseaux</div></div>{dots(2,0,True)}"""
S['5-tarif-2'] = f"""<div class="glow"></div>{brand()}
<div style="position:absolute;left:80px;right:80px;top:560px;text-align:center">
<div class="h1">Prêt à lancer<br><span class="g">ta première pub ?</span></div>
<p class="p" style="margin-top:44px">Crée ton compte en quelques minutes.</p>
<div style="margin-top:70px" class="btn">Commencer →</div>
<div style="margin-top:46px;font-weight:800;font-size:44px">👆 Lien en bio</div>
<div style="margin-top:14px;font-weight:700;font-size:36px;color:#6E6A73">growthity.ai</div></div>{dots(2,1)}"""
# couvertures rondes « à la une » (le cercle visible = centre ~ 60 % de la largeur)
W='<svg width="330" height="330" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
covers = [('growthity', W + '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>', 'Growthity'),
 ('comment', W + '<path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>', 'Comment ça marche'),
 ('exemples', W + '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z" fill="#fff"/></svg>', 'Exemples'),
 ('leads', W + '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.6 3.2-5.5 6.5-5.5s6 1.9 6.5 5.5"/><path d="M19 8v6M16 11h6"/></svg>', 'Leads'),
 ('tarif', W + '<path d="M20.5 13.5l-7 7a2 2 0 0 1-2.8 0l-7.2-7.2V4.5a1 1 0 0 1 1-1h8.8l7.2 7.2a2 2 0 0 1 0 2.8z"/><circle cx="8" cy="8" r="1.6" fill="#fff"/></svg>', 'Tarif')]
for k, ic, t in covers:
    inner = ic
    S[f'cover-{k}'] = f"""<div style="position:absolute;inset:0;background:linear-gradient(135deg,#2563EB,#5B3FE4 52%,#9333EA)"></div>
<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center">{inner}</div>"""
os.makedirs('pages', exist_ok=True)
for k, body in S.items(): open(f'pages/{k}.html', 'w').write(HEAD + body + '</body></html>')
json.dump(list(S), open('pages/list.json', 'w'))
print(len(S), 'pages')
