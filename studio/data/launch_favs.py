"""Plan de lancement reconstruit à partir des favoris du Studio.

python3 studio/data/launch_favs.py <db_dir> <out.json>
<db_dir> : export ArtifactData (media/*.json, posts/*.json). Écrit la liste des écritures (batch) et affiche le calendrier.
Organique : tous les favoris dont la fiche post est de type « post » (sauf déjà publiés). Pubs : favoris « Visuel pub » / « UGC réaliste ».
"""
import datetime, glob, json, os, sys

START = datetime.date(2026, 11, 23)  # lundi
WEEKS_N = 16
OFF = {datetime.date(2026, 12, 25), datetime.date(2027, 1, 1)}
TIME = {'Reel': '12:30', 'Carrousel': '18:30', 'Image': '11:00'}
FIRST = ['m-r6', 'm-cp2', 'm-short1', 'm-reel-lancement-calendrier', 'm-pov-1-premiere-pub', 'm-reel-lancement-whatsapp']
SERIES = [
    ['m-cp4', 'm-cp5'],
    ['m-pub3d-boulanger', 'm-pub3d-fleuriste', 'm-pub3d-garagiste', 'm-pub3d-coach', 'm-pub3d-immo', 'm-pub3d-resto', 'm-pub3d-patissiere', 'm-pub3d-caviste'],
    [f'm-roast-{i}-corinne' for i in range(1, 9)],
    ['m-brief-1-andromeda', 'm-brief-2-apprentissage', 'm-brief-3-structure', 'm-brief-4-fatigue', 'm-brief-5-budget', 'm-brief-6-advantage', 'm-brief-7-pixel-capi', 'm-brief-8-chiffres', 'm-brief-9-regularite', 'm-brief-10-alertes'],
    ['m-vf-1-ciblage', 'm-vf-2-likes', 'm-vf-3-crea', 'm-vf-4-quotidien', 'm-vf-5-surveiller', 'm-vf-6-24h', 'm-vf-7-vertical', 'm-vf-8-sous-titres', 'm-vf-9-3-secondes'],
    ['m-split-chat-adrien', 'm-split-stats-adrien', 'm-split-spy-adrien', 'm-split-brand-adrien', 'm-split-buyer-adrien', 'm-split-batch-adrien', 'm-split-edit-adrien', 'm-split-cal-adrien', 'm-split-wa-adrien'],
    ['m-reply-flan-aicha', 'm-reply-fake-aicha', 'm-reply-poster-aicha', 'm-reply-surveiller-aicha'],
    ['m-multi-decors-naomi', 'm-multi-decors-steve', 'm-multi-decors-alice', 'm-multi-decors-raphael', 'm-multi-decors-amelie'],
    ['m-pov-2-tournage', 'm-pov-3-neveu'],
    ['m-avap2-gel', 'm-avap-sac', 'm-avap-5-julien', 'm-avap-6-helene'],
    ['m-short2', 'm-short3', 'm-short4', 'm-short6', 'm-short7'],
]
# statiques : (semaine, jour) → média ; mercredi chaque semaine + samedi des semaines 2, 5, 9, 13
STATIC = {(1, 2): 'm-p15', (2, 2): 'm-c11', (2, 5): 'm-p7', (3, 2): 'm-c21', (4, 2): 'm-c4', (5, 2): 'm-p17', (5, 5): 'm-p16',
          (6, 2): 'm-c20', (7, 2): 'm-c26', (8, 2): 'm-p13', (9, 2): 'm-c10', (9, 5): 'm-p29', (10, 2): 'm-c18', (11, 2): 'm-p12',
          (12, 2): 'm-c27', (13, 2): 'm-p5', (13, 5): 'm-p28', (14, 2): 'm-c2', (15, 2): 'm-p14', (16, 2): 'm-p6'}
WEEKS = [
    ('Growthity est en ligne', 'Présenter l’outil : une phrase, une pub, publiée sur Meta. Reel de lancement, Du chat à la pub, nouveautés calendrier et alertes.'),
    ('Ce que Growthity fait pour toi', 'Montrer le chat en action (split-screen), répondre aux premières questions (FAQ) et lancer les séries récurrentes.'),
    ('Une pub par métier · Noël', 'Pubs 3D par métier et carrousel « Noël : 4 idées de pubs » au moment où les clients préparent leurs cadeaux.'),
    ('Le brief Meta', 'Contenu utile qu’on enregistre : comment Meta diffuse les pubs, vrai ou faux, et les notes de Corinne sur de vraies pubs.'),
    ('Semaine de Noël', 'Rythme allégé (25 décembre off) : contenus légers, POV et multi-décors.'),
    ('Préparer la nouvelle année', '1er janvier off. « 5 erreurs qui coûtent cher » pour bien repartir en janvier.'),
    ('Nouvelle année, nouvelles pubs', 'Tout ton mois de posts programmé, avant / après, et les séries qui continuent.'),
    ('Comprendre ses pubs', 'Formats Meta, lecture des chiffres, réponses aux commentaires.'),
    ('Les scripts qui marchent', 'Scripts UGC à copier, calendrier de publication, une actrice dans tous les décors.'),
    ('Une pub pour chaque métier', 'Le carrousel métiers et les épisodes 3D suivants : chacun doit se dire « ça marche pour moi ».'),
    ('Avant de lancer', 'Checklist avant de lancer une pub, media buyer et analyse des pubs concurrentes.'),
    ('Surveiller sans y passer ses soirées', 'Les alertes media buyer, la fatigue créative, le budget.'),
    ('Anatomie d’une bonne pub', 'Décortiquer ce qui fait vendre une pub UGC et quand une pub s’essouffle.'),
    ('Les coulisses', 'Coulisses d’une pub (bijou), vidéo brute devenue virale, avant / après.'),
    ('Mythes et réalités', 'Casser les idées reçues sur les pubs Meta : tournage, ciblage, likes.'),
    ('Ancrer l’habitude', 'Dernière semaine du plan : une bonne phrase suffit. Ensuite, on garde le rythme avec les pubs du moment.'),
]


def main(db, out):
    M = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(f'{db}/media/*.json')}
    P = {os.path.basename(f)[:-5]: json.load(open(f)) for f in glob.glob(f'{db}/posts/*.json')}
    favs = {k for k, d in M.items() if d.get('fav')}
    post_of = {}
    for pid, p in P.items():
        if p.get('type') == 'post' and p.get('mediaId') in favs and p.get('status') != 'live':
            post_of.setdefault(p['mediaId'], pid)
    live = {p.get('mediaId') for p in P.values() if p.get('status') == 'live'}
    organic = {m for m in post_of if m not in live}
    planned = set(FIRST) | {m for s in SERIES for m in s} | set(STATIC.values())
    missing = organic - planned
    extra = planned - organic
    assert not missing, f'favoris non placés : {missing}'
    assert not extra, f'hors favoris : {extra}'
    # reels : FIRST puis entrelacement proportionnel des séries (ordre de chaque série conservé)
    rest = []
    for s in SERIES:
        n = len(s)
        rest += [((i + 0.5) / n, j, m) for j, m in enumerate([None]) for i, m in enumerate(s)]
    rest.sort(key=lambda x: (x[0], x[1]))
    reels = FIRST + [m for _, _, m in rest]
    slots, ri = [], 0
    for w in range(1, WEEKS_N + 1):
        for d in range(6):
            day = START + datetime.timedelta(days=7 * (w - 1) + d)
            if day in OFF:
                continue
            if (w, d) in STATIC:
                mid = STATIC[(w, d)]
                typ = 'Carrousel' if M[mid].get('kind') == 'carousel' else 'Image'
            elif ri < len(reels):
                mid, typ = reels[ri], 'Reel'; ri += 1
            else:
                continue
            slots.append((w, d, day, typ, mid))
    assert ri == len(reels), 'pas assez de créneaux'
    writes, k_by_w = [], {}
    for w, d, day, typ, mid in slots:
        k = k_by_w.get(w, 0); k_by_w[w] = k + 1
        pid = post_of[mid]
        writes.append({'op': 'update', 'collection': 'posts', 'doc_id': pid, 'if_version': P[pid]['__v'] if '__v' in P[pid] else None,
                       'data': {'date': f'{day.isoformat()}T{TIME[typ]}', 'launch': {'week': w, 'slot': k}, 'status': 'review' if P[pid].get('status') in ('idea', 'make', 'review', None) else P[pid]['status']}})
        print(f'S{w:02d} {day:%a %d/%m} {TIME[typ]} {typ:9} {mid:32} {M[mid]["title"][:60]}')
    keep = {post_of[m] for _, _, _, _, m in slots}
    for pid, p in P.items():
        if p.get('launch') and pid not in keep:
            data = {'launch': {'__delete__': True}}
            if p.get('status') != 'live':
                data.update({'date': '', 'status': 'idea'})
            writes.append({'op': 'update', 'collection': 'posts', 'doc_id': pid, 'data': data})
            print('retiré du plan :', pid, p.get('title', '')[:50], '(publié, gardé)' if p.get('status') == 'live' else '')
    ads = sorted(m for m in favs if m not in organic and m not in live)
    json.dump({'writes': writes, 'ads': ads, 'n_org': len(slots)}, open(out, 'w'), ensure_ascii=False, indent=1)
    print(len(slots), 'publications organiques ;', len(ads), 'favoris pour les pubs :', ads)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
