"""Launch plan + captions + media descriptions for Growthity Studio.

python3 studio/data/launch_content.py <assets.json> <out_dir>
assets.json maps local file keys → uploaded asset ids. Writes one JSON per document and writes.json (batch entries).
Rules: vouvoiement, « Growthity », never « gratuit », CTA « Commencer » / « Lien en bio », no invented result figures.
"""
import json, os, sys, datetime

START = datetime.date(2026, 11, 16)  # J0 = lundi
CADENCE = [  # weekday → (type, time)
    (0, 'Reel', '12:30'), (1, 'Carrousel', '18:30'), (2, 'Reel', '12:30'),
    (3, 'Carrousel', '18:30'), (4, 'Reel', '12:30'), (5, 'Image', '11:00'),
]
WEEKS = [
    {'n': 1, 'title': 'Lancement : présenter Growthity', 'goal': 'Dire ce que fait Growthity, montrer le résultat dès le premier jour et installer le format « une phrase → une pub ».'},
    {'n': 2, 'title': 'La preuve par l’exemple', 'goal': 'Un métier par publication : studio de jardin, cuisiniste, restauration. Chacun doit se dire « ça marche aussi pour moi ».'},
    {'n': 3, 'title': 'La valeur : conseils pubs Meta', 'goal': 'Du contenu utile qu’on enregistre et qu’on partage : accroches, conseils, A/B test. C’est ce qui fait grandir le compte.'},
    {'n': 4, 'title': 'Passer à l’action', 'goal': 'Lever les dernières objections (FAQ, casting, scripts) et pousser vers « Lien en bio » pour commencer.'},
]

# slot plan: (media id, post id, title)
PLAN = [
    [('m-r6', 'l-01', 'Reel – Growthity est en ligne'), ('m-c8', 'l-02', 'Carrousel – Growthity est en ligne'), ('m-r7', 'l-03', 'Reel – Coulisses scierie'), ('m-c2', 'p-02', 'Carrousel – Coulisses bijou'), ('m-short1', 'l-05', 'Reel – Bijoux e-commerce'), ('m-p15', 'l-06', 'Citation – La meilleure pub')],
    [('m-short2', 'l-07', 'Reel – Studio de jardin'), ('m-c3', 'p-03', 'Carrousel – 3 phrases, 3 pubs'), ('m-r9', 'l-09', 'Reel – Coulisses cuisiniste'), ('m-c9', 'l-10', 'Carrousel – 5 pubs vidéo sans tournage'), ('m-short5', 'l-11', 'Reel – Restauration'), ('m-p7', 'p-07', 'Coulisses bougie – Tapé / Obtenu')],
    [('m-r12', 'l-13', 'Reel – 3 accroches, 1 vidéo'), ('m-c1', 'p-01', 'Carrousel – 5 accroches à copier'), ('m-short3', 'l-15', 'Reel – Produits e-commerce'), ('m-c4', 'p-04', 'Carrousel – 6 conseils pubs Meta'), ('m-r8', 'l-17', 'Reel – Coulisses installateur solaire'), ('m-p12', 'l-18', 'Checklist – Avant de lancer une pub')],
    [('m-r11', 'l-19', 'Reel – Un acteur pour chaque marque'), ('m-c10', 'l-20', 'Carrousel – 3 scripts UGC'), ('m-r10', 'l-21', 'Reel – Coulisses cheveux bouclés'), ('m-c11', 'l-22', 'Carrousel – FAQ Growthity'), ('m-short4', 'l-23', 'Reel – B2B'), ('m-p5', 'p-05', 'Anatomie d’une pub UGC')],
]
RESERVE = [('m-p6', 'p-06', 'Citation – Une bonne phrase'), ('m-p13', 'r-13', 'Les 3 formats Meta'), ('m-p14', 'r-14', 'Mythe / Réalité'), ('m-p16', 'r-16', 'Photo – Votre métier n’a pas besoin d’un studio'), ('m-p17', 'r-17', 'Photo – POV : vous lancez votre pub ce soir')]

TAGS = {
    'base': '#growthity #publicitemeta #facebookads #instagramads #ugc',
}
CAP = {
    'l-01': "Growthity est en ligne.\n\nVos pubs Meta, sans tournage, sans studio, sans agence. Vous décrivez votre produit en une phrase : Growthity écrit le script, choisit l’acteur, monte la vidéo et la publie sur Facebook et Instagram.\n\nLien en bio pour commencer.\n\n#lancement " + TAGS['base'],
    'l-02': "Comment ça marche, en 4 étapes 👉\n\n1. Vous décrivez votre pub en une phrase\n2. Growthity écrit le script et choisit l’acteur\n3. Vous choisissez le format : Reel, fil ou carrousel\n4. Vous publiez directement sur Meta\n\nEnregistrez ce post, et dites-nous en commentaire quel produit vous testeriez en premier.\n\n" + TAGS['base'],
    'l-03': "Une scierie familiale, une phrase, une pub.\n\nTapé dans Growthity : « Scierie familiale dans les Vosges. Une employée présente le bois de chauffage livré à domicile. »\nObtenu : cette vidéo, prête pour Reels.\n\nVotre métier mérite sa pub. Lien en bio.\n\n#artisan #coulisses " + TAGS['base'],
    'p-02': None,  # keep existing caption
    'l-05': "Un bracelet, une photo produit… et cette vidéo UGC.\n\nPas de shooting, pas d’influenceuse : une actrice IA le présente, face caméra, avec sous-titres et voix en français.\n\nVous vendez des bijoux en ligne ? Lien en bio.\n\n#bijoux #ecommerce " + TAGS['base'],
    'l-06': "La meilleure pub n’est pas la plus chère.\nC’est celle que vous lancez.\n\nEnregistrez ce post pour le jour où vous hésiterez.\n\n#entrepreneur #marketingdigital " + TAGS['base'],
    'l-07': "Vous vendez des studios de jardin ?\n\nUn propriétaire présente le sien, devant sa maison. Vidéo générée à partir d’une phrase, prête pour Instagram et Facebook.\n\nLien en bio pour faire la vôtre.\n\n#studiodejardin #artisan " + TAGS['base'],
    'p-03': None,
    'l-09': "Pas de caméra. Juste ça.\n\nTapé dans Growthity : « Cuisiniste à Bordeaux. Un client raconte comment sa cuisine a été refaite. »\nRésultat : un témoignage face caméra, sous-titré, au format Reel.\n\nLien en bio.\n\n#cuisine #renovation #coulisses " + TAGS['base'],
    'l-10': "5 pubs vidéo à faire sans tournage 👇\n\n01 Le témoignage\n02 La démonstration\n03 La réaction\n04 Le POV\n05 Les coulisses\n\nLaquelle allez-vous tester cette semaine ? Dites-le en commentaire.\n\n#ideesdepub " + TAGS['base'],
    'l-11': "Vous faites des pâtes fraîches. Pas des vidéos.\n\nGrowthity tourne la pub de votre atelier à votre place, et la diffuse autour de vous sur Instagram et Facebook.\n\nLien en bio.\n\n#restauration #artisan #pmelocale " + TAGS['base'],
    'p-07': None,
    'l-13': "Même vidéo. 3 accroches.\n\nSur Meta, ce sont souvent les deux premières secondes qui font la différence. Lancez plusieurs débuts sur la même vidéo et gardez celui qui retient le plus.\n\nEnregistrez ce Reel pour votre prochaine campagne.\n\n#abtest #accroche " + TAGS['base'],
    'p-01': None,
    'l-15': "Un porte-savon, une bougie, des sneakers, un smartphone pliant.\n\nQuatre produits, quatre pubs vidéo, zéro tournage. Juste une phrase à chaque fois.\n\nLien en bio pour essayer avec le vôtre.\n\n#ecommerce #produit " + TAGS['base'],
    'p-04': None,
    'l-17': "Une phrase. Une pub.\n\nTapé : « Installateur de panneaux solaires en Occitanie. Une cliente explique pourquoi elle a sauté le pas. »\nObtenu : cette vidéo, prête à publier.\n\nDécrivez, on tourne. Lien en bio.\n\n#solaire #artisan #coulisses " + TAGS['base'],
    'l-18': "Avant de lancer votre pub Meta, vérifiez ces 6 points ✅\n\n☐ Une accroche dans la première seconde\n☐ Des sous-titres lisibles sans le son\n☐ Le format 9:16 pour Reels et Stories\n☐ Un seul message, un seul bénéfice\n☐ Un appel à l’action clair\n☐ Deux ou trois versions à tester\n\nEnregistrez-la et partagez-la à la personne qui gère vos pubs.\n\n#checklist " + TAGS['base'],
    'l-19': "Choisissez votre acteur.\n\nGaragiste, boutique de jouets, mode, immobilier : chaque marque a le visage qui parle à son public. Avec Growthity, vous le choisissez en un clic.\n\nLien en bio.\n\n#acteursia " + TAGS['base'],
    'l-20': "3 scripts UGC à copier-coller 👉\n\n1. Le témoignage\n2. La démonstration\n3. L’objection\n\nRemplacez les [crochets] par votre produit, collez dans Growthity, c’est prêt.\n\nEnregistrez ce post pour votre prochaine pub.\n\n#scriptugc #copywriting " + TAGS['base'],
    'l-21': "Tapé en 10 secondes.\n\n« Masque hydratant pour cheveux bouclés. Une cliente partage sa routine du matin. »\nRésultat : une vidéo UGC face caméra, au format Reel.\n\nVotre produit, raconté. Lien en bio.\n\n#beaute #cosmetique #coulisses " + TAGS['base'],
    'l-22': "Vos questions sur Growthity 👇\n\n• Les acteurs sont-ils réels ?\n• Faut-il savoir monter une vidéo ?\n• Quels formats ?\n• Peut-on publier directement ?\n\nLes réponses sont dans le carrousel. Une autre question ? Posez-la en commentaire.\n\n#faq " + TAGS['base'],
    'l-23': "Votre offre B2B, présentée face caméra. Sans caméra.\n\nCaroline et Lila présentent vos services comme le ferait votre meilleur commercial, en vidéo, sur Facebook et Instagram.\n\nLien en bio pour commencer.\n\n#b2b #prospection " + TAGS['base'],
    'p-05': None,
    'p-06': None,
    'r-13': "Les 3 formats Meta à connaître 📐\n\n9:16 (1080 × 1920) pour Reels et Stories\n4:5 (1080 × 1350) pour le fil\n1:1 (1080 × 1080) pour le fil et les carrousels\n\nEnregistrez ce post, il vous resservira.\n\n#formats " + TAGS['base'],
    'r-14': "Mythe : « Une pub vidéo, il faut un tournage. »\nRéalité : une phrase suffit pour la créer.\n\nScript, acteur IA, voix et sous-titres sont générés pour vous. Lien en bio.\n\n" + TAGS['base'],
    'r-16': "Votre métier n’a pas besoin d’un studio. Juste d’une phrase bien écrite.\n\nLien en bio pour faire votre première pub.\n\n#artisan " + TAGS['base'],
    'r-17': "POV : vous lancez votre pub ce soir. Sans tournage, sans agence.\n\nLien en bio.\n\n" + TAGS['base'],
}

# ad primary texts (≤125 caractères avant « Voir plus »)
AD_TXT = {
    'a-short1': "Vous vendez des bijoux ? Votre pub vidéo est prête en une phrase. Sans shooting, sans influenceuse.",
    'a-short2': "Vos studios de jardin présentés en vidéo par un propriétaire. Sans tournage. Créez la vôtre sur Growthity.",
    'a-short3': "Une photo produit suffit pour une pub vidéo UGC. Testez avec votre produit sur Growthity.",
    'a-short4': "Votre offre B2B présentée face caméra, sans caméra. Générez votre pub vidéo sur Growthity.",
    'a-short5': "Artisans, restaurants : votre pub vidéo tournée pour vous, diffusée autour de vous. Commencez sur Growthity.",
    'a-crea01': "Elle n’existe pas. Sa vidéo pour un bracelet, si. Créez vos pubs UGC avec Growthity.",
    'a-crea02': "Vous vendez des studios de jardin ? Une actrice IA les présente pour vous.",
    'a-crea03': "0 shooting, 0 influenceuse. Une phrase, et votre vidéo UGC est prête.",
    'a-crea04': "Votre photo produit devient une pub vidéo portée. En une phrase.",
    'a-crea05': "Vous faites des pâtes, pas des vidéos. Growthity tourne la pub de votre atelier.",
    'a-crea06': "Votre offre B2B, présentée face caméra. Sans caméra.",
    'a-crea07': "Décrivez l’ambiance. On s’occupe de la vidéo qui la vend.",
    'a-crea08': "Aucune de ces personnes n’existe. Leurs pubs, si. Choisissez votre acteur IA.",
    'a-crea09': "Trouver une actrice, louer un studio, tourner, monter… ou écrire une phrase sur Growthity.",
    'a-crea10': "Votre produit en action. Sans studio, sans tournage. Juste une phrase.",
    'a-r6': "Vos pubs Meta, sans tournage. Growthity écrit, tourne et publie votre pub vidéo.",
    'a-r9': "Vos clients en vidéo, sans caméra. Une phrase suffit pour créer votre pub témoignage.",
    'a-r12': "Même vidéo, 3 accroches : testez et gardez la meilleure. Créez vos variantes sur Growthity.",
}
AD_NEW = [('a-r6', 'm-r6', 'Ad vidéo – Lancement, sans tournage'), ('a-r9', 'm-r9', 'Ad vidéo – Témoignage cuisiniste'), ('a-r12', 'm-r12', 'Ad vidéo – 3 accroches, 1 vidéo')]
ADS_NOTE = ("Semaine 1 : lancer 3 vidéos en test sur une même audience (Reel lancement, Short 1 bijoux, Short 3 e-commerce), objectif Ventes, bouton « Commencer ».\n"
            "Semaine 2 : garder les vidéos qui retiennent le plus, ajouter les visuels 4:5 (Elle n’existe pas, 0 shooting, Note iPhone).\n"
            "Semaine 3 : décliner les gagnantes avec de nouvelles accroches (Reel A/B), ouvrir une audience B2B avec le Short 4.\n"
            "Semaine 4 : relancer en retargeting les personnes qui ont vu les vidéos, avec la FAQ et le Reel casting.\n"
            "Budgets : à définir ensemble avant le lancement.")

NEW_MEDIA = {
    'm-r6': ('Reel – Growthity est en ligne', 'video', '9:16', 'Reel Growthity', 'lancement', "Reel de lancement (~12 s). Accroche « Vos pubs Meta, sans tournage. », 3 acteurs (Camille, Anya, Marta), « Une phrase suffit. », carte de fin « Growthity est en ligne ». Musique, sans voix."),
    'm-r7': ('Reel – Coulisses scierie', 'video', '9:16', 'Reel Growthity', 'artisanat', "Coulisses : la phrase tapée dans Growthity (scierie familiale, bois de chauffage), puis la vidéo obtenue. Phrase reconstituée."),
    'm-r8': ('Reel – Coulisses installateur solaire', 'video', '9:16', 'Reel Growthity', 'énergie solaire', "Coulisses : phrase « installateur de panneaux solaires en Occitanie » puis vidéo obtenue. Phrase reconstituée."),
    'm-r9': ('Reel – Coulisses cuisiniste', 'video', '9:16', 'Reel Growthity', 'rénovation', "Coulisses : phrase « cuisiniste à Bordeaux, un client raconte » puis vidéo témoignage. Phrase reconstituée."),
    'm-r10': ('Reel – Coulisses cheveux bouclés', 'video', '9:16', 'Reel Growthity', 'beauté', "Coulisses : phrase « masque hydratant pour cheveux bouclés » puis vidéo UGC. Phrase reconstituée."),
    'm-r11': ('Reel – Un acteur pour chaque marque', 'video', '9:16', 'Reel Growthity', 'casting', "Grille de 4 acteurs (Antoine, Emiko, modèle 01, Thomas) puis focus sur chacun avec un métier : garagiste, jouets, mode, immobilier."),
    'm-r12': ('Reel – 3 accroches, 1 vidéo', 'video', '9:16', 'Reel Growthity', 'conseils', "Même vidéo (Zoé) avec 3 accroches A/B/C, puis « Meta garde celle qui retient ». Pédagogie A/B test."),
    'm-c8': ('Carrousel – Growthity est en ligne', 'carousel', '4:5', 'Carrousel', 'lancement', "6 slides : couverture lancement, 4 étapes (décrire, créer, choisir le format, publier), fin « Lien en bio »."),
    'm-c9': ('Carrousel – 5 pubs vidéo sans tournage', 'carousel', '4:5', 'Carrousel', 'conseils', "7 slides : témoignage, démonstration, réaction, POV, coulisses. Acteurs : homme, porte-savon, femme bougie, artisane pâtes."),
    'm-c10': ('Carrousel – 3 scripts UGC à copier', 'carousel', '4:5', 'Carrousel', 'conseils', "5 slides : scripts témoignage, démonstration, objection avec [crochets] à remplacer."),
    'm-c11': ('Carrousel – FAQ Growthity', 'carousel', '4:5', 'Carrousel', 'marque', "6 slides : acteurs IA, montage, formats, publication directe sur Meta."),
    'm-p12': ('Checklist – Avant de lancer une pub Meta', 'image', '4:5', 'Post organique', 'conseils', "6 points à cocher avant de lancer une pub."),
    'm-p13': ('Les 3 formats Meta', 'image', '4:5', 'Post organique', 'conseils', "9:16, 4:5, 1:1 avec dimensions et usages."),
    'm-p14': ('Mythe / Réalité', 'image', '4:5', 'Post organique', 'marque', "Mythe « il faut un tournage » / Réalité « une phrase suffit »."),
    'm-p15': ('Citation – La meilleure pub', 'image', '4:5', 'Post organique', 'marque', "« La meilleure pub n’est pas la plus chère. C’est celle que vous lancez. »"),
    'm-p16': ('Photo – Votre métier n’a pas besoin d’un studio', 'image', '4:5', 'Post organique', 'artisanat', "Photo de l’artisane de la scierie avec texte."),
    'm-p17': ('Photo – POV : vous lancez votre pub ce soir', 'image', '4:5', 'Post organique', 'marque', "Photo plein cadre (cheveux bouclés) avec texte POV."),
}
CATEGORY_EXISTING = {**{f'm-short{i}': 'Short Growthity' for i in range(1, 6)}, **{f'm-c{i}': 'Carrousel' for i in range(1, 5)}, 'm-p5': 'Post organique', 'm-p6': 'Post organique', 'm-p7': 'Post organique', **{f'm-crea{i:02d}': 'Visuel pub' for i in range(1, 11)}}


def main(assets_path, out):
    A = json.load(open(assets_path))
    os.makedirs(out, exist_ok=True)
    now = 1794250000000
    docs = []  # (collection, id, op, data)
    for mid, (title, kind, fmt, cat, niche, note) in NEW_MEDIA.items():
        items = A[mid]
        docs.append(('media', mid, 'set', {'title': title, 'kind': kind, 'format': fmt, 'items': items, 'category': cat, 'niche': niche, 'note': note, 'source': 'claude', 'createdAt': now, 'createdBy': None}))
    for mid, cat in CATEGORY_EXISTING.items():
        docs.append(('media', mid, 'update', {'category': cat}))
    drive = json.load(open(os.path.join(os.path.dirname(__file__), 'drive_videos.json')))
    for i, v in enumerate(drive):
        fmt = '16:9' if 'ordi' in v['f'] else '9:16'
        docs.append(('media', f'm-drv-{i + 1:02d}', 'set', {'title': v['t'], 'kind': 'video', 'format': fmt, 'items': [], 'category': v['cat'], 'niche': '', 'note': f"Vidéo finale « {v['f']} », rangée dans Drive › Growthity-video › 3_Finales › {v['cat']}.", 'source': 'drive',
                                                            'drive': {'id': v['id'], 'url': f"https://drive.google.com/file/d/{v['id']}/view", 'file': v['f'], 'folder': v['cat']}, 'createdAt': now - 100000 - i, 'createdBy': None}))
    for w, week in enumerate(PLAN):
        for k, (mid, pid, title) in enumerate(week):
            dow, typ, time = CADENCE[k]
            day = START + datetime.timedelta(days=7 * w + dow)
            data = {'date': f'{day.isoformat()}T{time}', 'status': 'review', 'launch': {'week': w + 1, 'slot': k}, 'title': title}
            if pid.startswith('p-'):
                if CAP.get(pid):
                    data['caption'] = CAP[pid]
                docs.append(('posts', pid, 'update', data))
            else:
                fmt = '9:16' if typ == 'Reel' else '4:5'
                docs.append(('posts', pid, 'set', {'type': 'post', 'mediaId': mid, 'format': fmt, 'networks': ['Instagram', 'Facebook'], 'caption': CAP[pid], 'ad': None, 'createdAt': now, 'updatedAt': now, 'createdBy': None, **data}))
    for mid, pid, title in RESERVE:
        if pid.startswith('p-'):
            docs.append(('posts', pid, 'update', {'date': '', 'status': 'idea', 'title': title}))
        else:
            docs.append(('posts', pid, 'set', {'type': 'post', 'title': title, 'mediaId': mid, 'format': '4:5', 'networks': ['Instagram', 'Facebook'], 'caption': CAP[pid], 'date': '', 'status': 'idea', 'ad': None, 'createdAt': now, 'updatedAt': now, 'createdBy': None}))
    for aid, txt in AD_TXT.items():
        if aid in dict((a, 1) for a, _, _ in AD_NEW):
            continue
        docs.append(('posts', aid, 'update', {'caption': txt, 'status': 'review'}))
    for aid, mid, title in AD_NEW:
        docs.append(('posts', aid, 'set', {'type': 'ad', 'title': title, 'mediaId': mid, 'format': '9:16', 'networks': ['Instagram', 'Facebook'], 'caption': AD_TXT[aid], 'date': '', 'status': 'review',
                                           'ad': {'objective': 'Ventes', 'budget': '', 'cta': 'Commencer', 'link': 'https://growthity.ai', 'audience': ''}, 'createdAt': now, 'updatedAt': now, 'createdBy': None}))
    docs.append(('config', 'launch', 'set', {
        'start': START.isoformat(), 'rhythm': '6 posts / semaine',
        'intro': '4 semaines pour installer Growthity sur Instagram et Facebook : 12 Reels, 8 carrousels, 4 images, dans un ordre pensé pour faire découvrir, prouver, aider puis convertir.',
        'cadence': [{'d': d, 'type': t, 'time': h} for d, t, h in CADENCE],
        'cadenceNote': 'Un contenu par jour du lundi au samedi, dimanche off. Reels à 12 h 30 (pause déjeuner), carrousels à 18 h 30 (le soir, moment où l’on enregistre), image le samedi matin. Stories chaque jour pour relayer le post du jour.',
        'weeks': WEEKS, 'ads': ADS_NOTE}))
    return docs


if __name__ == '__main__':
    docs = main(sys.argv[1], sys.argv[2])
    json.dump(docs, open(os.path.join(sys.argv[2], 'docs.json'), 'w'), ensure_ascii=False)
    print(len(docs), 'documents')
