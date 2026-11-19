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
# Semaine 1 (fixe) : présenter l'outil
W1 = ['m-tout-au-meme-endroit', 'm-cp2', 'm-c8', 'm-split-chat-adrien', 'm-pov-1-premiere-pub', 'm-reel-lancement-calendrier']
EXCLUDE = {'m-r6'}  # retiré à la demande
# piliers : chaque jour a son rôle ; dans un pilier, les séries sont entrelacées (ordre des épisodes conservé)
PILLARS = {
    'demo': [['m-reel-lancement-whatsapp'], ['m-cp4', 'm-cp5'], ['m-short1', 'm-short2', 'm-short3', 'm-short4', 'm-short6', 'm-short7'],
             ['m-split-stats-adrien', 'm-split-spy-adrien', 'm-split-brand-adrien', 'm-split-buyer-adrien', 'm-split-batch-adrien', 'm-split-edit-adrien', 'm-split-cal-adrien', 'm-split-wa-adrien']],
    'edu': [['m-brief-1-andromeda', 'm-brief-2-apprentissage', 'm-brief-3-structure', 'm-brief-4-fatigue', 'm-brief-5-budget', 'm-brief-6-advantage', 'm-brief-7-pixel-capi', 'm-brief-8-chiffres', 'm-brief-9-regularite', 'm-brief-10-alertes'],
            ['m-vf-1-ciblage', 'm-vf-2-likes', 'm-vf-3-crea', 'm-vf-4-quotidien', 'm-vf-5-surveiller', 'm-vf-6-24h', 'm-vf-7-vertical', 'm-vf-8-sous-titres', 'm-vf-9-3-secondes']],
    'metier': [['m-pub3d-boulanger', 'm-pub3d-fleuriste', 'm-pub3d-garagiste', 'm-pub3d-coach', 'm-pub3d-immo', 'm-pub3d-resto', 'm-pub3d-patissiere', 'm-pub3d-caviste'],
               ['m-multi-decors-naomi', 'm-multi-decors-steve', 'm-multi-decors-alice', 'm-multi-decors-raphael', 'm-multi-decors-amelie'],
               ['m-avap2-gel', 'm-avap-sac', 'm-avap-5-julien', 'm-avap-6-helene']],
    'fun': [[f'm-roast-{i}-corinne' for i in range(1, 9)], ['m-pov-2-tournage', 'm-pov-3-neveu'],
            ['m-reply-flan-aicha', 'm-reply-fake-aicha', 'm-reply-poster-aicha', 'm-reply-surveiller-aicha']],
}
DAY_PILLAR = {0: 'demo', 1: 'edu', 3: 'metier', 4: 'fun'}  # mercredi = statique, samedi = pilier le plus en retard
WED = ['m-c11', 'm-c21', 'm-c4', 'm-p17', 'm-c20', 'm-c26', 'm-p13', 'm-c10', 'm-c18', 'm-p12', 'm-c27', 'm-p5', 'm-c2', 'm-p14', 'm-p6']  # semaines 2 à 16
SAT_STATIC = {2: 'm-p15', 5: 'm-p16', 8: 'm-p7', 11: 'm-p29', 14: 'm-p28'}
NOW = 1795176000000
NEW_POSTS = {'l-tout-au-meme-endroit': {'type': 'post', 'title': 'Reel – Tout. Au même endroit.', 'mediaId': 'm-tout-au-meme-endroit', 'format': '9:16', 'networks': ['Instagram', 'Facebook'], 'status': 'review', 'ad': None, 'createdAt': NOW, 'updatedAt': NOW, 'createdBy': None,
    'caption': 'Un monteur, une agence, un media buyer… et des outils partout ?\\n\\nGrowthity réunit tout : les meilleures IA pour créer vos pubs, la publication sur tous vos réseaux, l’analyse de vos performances avec les conseils de l’IA, et un media buyer qui pilote vos campagnes Meta jour et nuit.\\n\\nTout. Au même endroit. Lien en bio pour commencer.\\n\\n#lancement #growthity #publicitemeta #facebookads #instagramads #ugc'}}
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
        if p.get('type') == 'post' and p.get('mediaId') in favs:
            post_of.setdefault(p['mediaId'], pid)
    post_of.setdefault('m-tout-au-meme-endroit', 'l-tout-au-meme-endroit')
    live = set()
    organic = ({m for m in post_of} | set(W1)) - EXCLUDE
    def weave(series):
        out = [((i + 0.5) / len(sr), j, m) for j, sr in enumerate(series) for i, m in enumerate(sr)]
        return [m for _, _, m in sorted(out)]
    Q = {k: weave(v) for k, v in PILLARS.items()}
    planned = set(W1) | set(WED) | set(SAT_STATIC.values()) | {m for q in Q.values() for m in q}
    assert not (organic - planned), f'favoris non placés : {organic - planned}'
    assert not (planned - organic), f'hors favoris : {planned - organic}'
    slots = []
    def kind(mid):
        return 'Carrousel' if M[mid].get('kind') == 'carousel' else ('Image' if M[mid].get('kind') == 'image' else 'Reel')
    for w in range(1, WEEKS_N + 1):
        for d in range(6):
            day = START + datetime.timedelta(days=7 * (w - 1) + d)
            if day in OFF:
                continue
            if w == 1:
                mid = W1[d]
            elif d == 2:
                mid = WED[w - 2]
            elif d == 5 and w in SAT_STATIC:
                mid = SAT_STATIC[w]
            else:
                pil = DAY_PILLAR.get(d)
                if d == 5 or not Q.get(pil):
                    left = [k for k in Q if Q[k]]
                    if not left:
                        continue
                    pil = max(left, key=lambda k: len(Q[k]))
                mid = Q[pil].pop(0)
            slots.append((w, d, day, kind(mid), mid))
    assert not any(Q.values()), Q
    writes, k_by_w = [], {}
    for w, d, day, typ, mid in slots:
        k = k_by_w.get(w, 0); k_by_w[w] = k + 1
        pid = post_of[mid]
        if pid not in P:
            writes.append({'op': 'set', 'collection': 'posts', 'doc_id': pid, 'data': NEW_POSTS[pid] | {'date': f'{day.isoformat()}T{TIME[typ]}', 'launch': {'week': w, 'slot': k}}})
            print(f'S{w:02d} {day:%a %d/%m} {TIME[typ]} {typ:9} {mid:32} (nouvelle fiche)')
            continue
        writes.append({'op': 'update', 'collection': 'posts', 'doc_id': pid, 'if_version': P[pid]['__v'] if '__v' in P[pid] else None,
                       'data': {'date': f'{day.isoformat()}T{TIME[typ]}', 'launch': {'week': w, 'slot': k}, 'status': 'review'}})
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
