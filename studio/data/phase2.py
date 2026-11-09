"""Lancement – semaines 5 à 9 (14 déc → 16 jan) : vitrines « Tapé dans Growthity », carrousels métiers / Noël / erreurs, images Tapé-Obtenu.
python3 studio/data/phase2.py <showcase_assets.json> <out_dir>"""
import json, os, sys, datetime
START = datetime.date(2026, 11, 16)
T = '#growthity #publicitemeta #facebookads #instagramads #ugc'
IMG = {
 'm-c18': ['262dddc7f8603b634089374ece335be1','1f3fc00a8b4da608d91a7719bd64a58e','8397d7ee4099a8bc0e213dfd745c8860','b6a9bd28d9906bfe865f5722489489f2','c9f2e3edd73c4a530dc278ba54ea2eda','8ae112b257498eede7815c89d308037d','efd6a15a0386aa81fd8ae5c39ad34813','7f12a14c3c78e29d025ccb4f694f836b'],
 'm-c19': ['75efd0098e1788ff087426190a484f93','3ddcf809f621255fbe57b053a70fdf07','5a58c73e9ae8ac57a8448b916bbda4e0','d6e3afd2455c7b1e5b278c1fc416ef9c','5c5056b980fae67915e77b88fa73e48d','1d89b5ec479175d949b843108c7e5c4a','7343b63e40a07ff9a0ff5e54f9a7b576','a16c74c11a26a122cf2125ff46208619','8623121eaef69e8ed11f196464a4d071'],
 'm-c20': ['3d80fdc4fb80f6370ab6b2bd19decdaf','3dd1d61fae48b871e9f0395d2cb62b8c','898404c8e7d182f982e0e633f9c98682','8645d77505a7bc69cc284255da4fa62d','a04cbc33a2cee6ef26492b3984919c1e','632b01c953443c7d6fffa2b2c5a49023','3ae926f42e5371bc152ebfcf4e133cc2'],
 'm-c21': ['5360d0a56d731060225a2ef064d75f58','2895975fa5d458276e2c342db7b7830f','a7628ab1c98aeb4fa8d9fafc7a3f9186','7eb348ad545193b33d6ac70ff2c1d6ea','a3f26289716ab5b52e0054e336eb6a61','85634273d2e8937f4891c2fe413a318c'],
 'm-p22': ['e29bc54d68c2af3537c978d12191302c'], 'm-p23': ['963f918d6cabd7dc559c0874909bc723'], 'm-p24': ['2927eb3416218e8fcf60cc8b5e5b7538'], 'm-p25': ['a8f3da7f8eb59ff7dc040510b0628fb0'],
}
NEWMEDIA = {
 'm-c18': ('Carrousel – Une pub pour chaque métier', 'carousel', 'Carrousel', 'multi-niches', '8 slides avec de vraies pubs Growthity : fitness, t-shirt, sneakers, primeur, solaire, studio de jardin.'),
 'm-c19': ('Carrousel – 4 phrases, 4 pubs', 'carousel', 'Carrousel', 'coulisses', '9 slides : phrases réellement tapées (noms des exports) puis la vidéo obtenue : t-shirt, panneaux solaires, bananes, t-shirt blanc.'),
 'm-c20': ('Carrousel – 5 erreurs qui coûtent cher', 'carousel', 'Carrousel', 'conseils', '7 slides : parler de soi, accroche tardive, visuel « pub », pas de sous-titres, juger en 24 h.'),
 'm-c21': ('Carrousel – Noël : 4 idées de pubs', 'carousel', 'Carrousel', 'saisonnier', '6 slides : carte cadeau, ambiance, POV cadeau, déballage.'),
 'm-p22': ('Tapé / Obtenu – Fitness', 'image', 'Post organique', 'fitness', 'Phrase réelle + image de la pub obtenue (compléments fitness).'),
 'm-p23': ('Tapé / Obtenu – Bananes', 'image', 'Post organique', 'primeur', 'Phrase réelle + image de la pub obtenue (bananes, leads grossistes).'),
 'm-p24': ('Tapé / Obtenu – T-shirt', 'image', 'Post organique', 'mode', 'Phrase réelle + image de la pub obtenue (t-shirt).'),
 'm-p25': ('Tapé / Obtenu – Studio de jardin', 'image', 'Post organique', 'studio de jardin', 'Phrase réelle + image de la pub obtenue (tiny house).'),
}
SHOW = {s['id']: s for s in json.load(open(os.path.join(os.path.dirname(__file__), '../../video/src/reels/showcase.json')))}
SCAP = {
 's01': "Il vend des compléments fitness. Il a tapé une phrase.\nVoici la pub obtenue 💪\n\nPas de tournage en salle, pas de monteur : la vidéo est prête pour Reels.\n\nVotre produit est le prochain ? Lien en bio.",
 's02': "« je vend un t shirt et je veux faire une video de pub… »\nC’est tout ce qui a été tapé. Le résultat 👇\n\nUne marque de vêtements, une vidéo lifestyle, zéro shooting.\n\nLien en bio pour faire la vôtre.",
 's03': "Des sneakers, un client face caméra, une pub prête à publier.\n\nAvec Growthity, vous décrivez le produit : la vidéo suit.\n\nLien en bio.",
 's04': "Il vend des bananes et cherche des grossistes. Oui, même ça 🍌\n\nUne phrase dans Growthity, et voici la pub pour trouver des clients pros.\n\nVotre métier aussi a droit à sa pub. Lien en bio.",
 's05': "La facture d’électricité qui fâche… puis la solution sur le toit ☀️\n\nUne pub d’installateur solaire, créée à partir d’une phrase.\n\nLien en bio pour la vôtre.",
 's06': "Une pub cinématique pour un cabinet de conseil, sans caméra ni plateau.\n\nServices, B2B, accompagnement : Growthity s’adapte à votre ton.\n\nLien en bio.",
 's07': "« je vend des studio de jardin (tiny house)… »\nLe fondateur fait visiter, comme à un client 🏡\n\nUne phrase, une pub. Lien en bio.",
 's08': "Un t-shirt blanc, une rue, une lumière de fin de journée.\nTout est parti d’une phrase tapée dans Growthity.\n\nLien en bio.",
 's09': "Panneaux solaires, un bord de lac, un discours clair.\nVoici ce que Growthity a généré à partir d’une phrase.\n\nLien en bio pour votre entreprise.",
 's10': "Un t-shirt avec un cœur, une rue taguée, un vrai style street ❤️\nPub générée en une phrase.\n\nLien en bio.",
 's11': "Le témoignage face caméra, l’arme préférée des installateurs.\nPlus besoin de convaincre un client de se filmer : Growthity le génère.\n\nLien en bio.",
 's12': "Même produit, autre ambiance : la force de Growthity, c’est de décliner.\nUne phrase, plusieurs vidéos, et vous gardez la meilleure.\n\nLien en bio.",
 's13': "Alice fait visiter un studio de jardin, en 16 secondes.\nUne vidéo UGC verticale, prête pour Reels.\n\nLien en bio pour la vôtre.",
 's14': "B2B : présenter un outil sur tablette, face caméra, en 30 secondes.\nSans réserver de salle, sans équipe vidéo.\n\nLien en bio.",
}
CAP = {
 'm-c18': "Une pub pour chaque métier 👉\n\nFitness, mode, sneakers, primeur, solaire, studio de jardin : 6 vraies pubs générées avec Growthity à partir d’une phrase.\n\nEt vous, vous vendez quoi ? Dites-le en commentaire.",
 'm-c19': "4 phrases, 4 pubs. Les phrases sont telles qu’elles ont été tapées, fautes comprises 😅\n\nPas besoin d’un brief parfait : décrivez simplement ce que vous vendez.\n\nLien en bio.",
 'm-c20': "5 erreurs qui coûtent cher sur Meta 👇\n\n1. Parler de vous au lieu de votre client\n2. Une accroche qui arrive trop tard\n3. Un visuel qui ressemble à une pub\n4. Oublier les sous-titres\n5. Juger une pub en 24 heures\n\nEnregistrez ce post avant votre prochaine campagne.",
 'm-c21': "4 idées de pubs pour Noël 🎄\n\nLa carte cadeau, l’ambiance, le POV cadeau, le déballage.\nÀ lancer maintenant, pendant que vos clients cherchent leurs cadeaux.\n\nVotre pub de Noël, ce soir : lien en bio.",
 'm-p22': "Tapé : « je vends des compléments alimentaires fitness… »\nObtenu : cette pub, prête pour Reels.\n\nLien en bio.",
 'm-p23': "Tapé : « je vend des banane et je veux faire du leads… »\nObtenu : une pub pour trouver des grossistes.\n\nLien en bio.",
 'm-p24': "Tapé : « je vend un t shirt et je veux faire une video de pub… »\nObtenu : une vidéo lifestyle, sans shooting.\n\nLien en bio.",
 'm-p25': "Tapé : « je vend des studio de jardin (tiny house)… »\nObtenu : le fondateur qui fait visiter.\n\nLien en bio.",
}
# (week, weekday 0=lun, time, media, post id, type)
P = [
 (5,0,'12:30','m-s01','l-25','Reel'),(5,1,'11:00','m-p22','l-26','Image'),(5,2,'12:30','m-s02','l-27','Reel'),(5,3,'18:30','m-c21','l-28','Carrousel'),(5,4,'12:30','m-s03','l-29','Reel'),(5,5,'11:00',None,'r-17','Image'),
 (6,0,'12:30','m-s07','l-31','Reel'),(6,1,'11:00','m-p25','l-32','Image'),(6,2,'12:30','m-s04','l-33','Reel'),(6,3,'18:30','m-c18','l-34','Carrousel'),(6,5,'12:30',None,'r-fen1','Reel'),
 (7,0,'12:30','m-s05','l-37','Reel'),(7,1,'11:00','m-p23','l-38','Image'),(7,2,'12:30','m-s06','l-39','Reel'),(7,3,'18:30','m-c19','l-40','Carrousel'),(7,5,'12:30','m-s08','l-42','Reel'),
 (8,0,'12:30','m-s09','l-43','Reel'),(8,1,'11:00',None,'r-13','Image'),(8,2,'12:30','m-s14','l-45','Reel'),(8,3,'18:30','m-c20','l-46','Carrousel'),(8,4,'12:30','m-s10','l-47','Reel'),(8,5,'11:00','m-p24','l-48','Image'),
 (9,0,'12:30','m-s11','l-49','Reel'),(9,1,'11:00',None,'r-16','Image'),(9,2,'12:30','m-s13','l-51','Reel'),(9,3,'18:30',None,'p-06','Image'),(9,4,'12:30','m-s12','l-53','Reel'),(9,5,'11:00',None,'r-14','Image'),
]
WEEKS = [
 {'n': 5, 'title': 'Une pub par métier · Noël', 'goal': 'De vraies pubs Growthity, une par métier, avec la phrase tapée. Le carrousel Noël arrive au moment où les clients cherchent leurs cadeaux.'},
 {'n': 6, 'title': 'Fêtes de fin d’année', 'goal': 'Rythme allégé (25 décembre off) : studio de jardin, bananes, une pub par métier, et la mascotte Fennec pour le côté fun.'},
 {'n': 7, 'title': 'Préparer la nouvelle année', 'goal': 'Solaire, conseil, coulisses « 4 phrases, 4 pubs » (1er janvier off). On montre que n’importe quel métier peut s’y mettre.'},
 {'n': 8, 'title': 'Nouvelle année, nouvelles pubs', 'goal': 'Contenu utile (5 erreurs, formats Meta) et vitrines B2B pour les entreprises qui relancent leurs pubs en janvier.'},
 {'n': 9, 'title': 'Ancrer l’habitude', 'goal': 'Dernière semaine du plan : témoignages, variations d’une même pub, réassurance. Ensuite, on garde le rythme avec les pubs du moment.'},
]
def main(assets, out):
    A = json.load(open(assets)) if os.path.exists(assets) else {}
    docs = []; now = 1794250000000
    for mid, (title, kind, cat, niche, note) in NEWMEDIA.items():
        docs.append(('media', mid, 'set', {'title': title, 'kind': kind, 'format': '4:5', 'items': [{'asset': a, 'ct': 'image/png'} for a in IMG[mid]], 'category': cat, 'niche': niche, 'note': note, 'source': 'claude', 'createdAt': now, 'createdBy': None}))
    for sid, s in SHOW.items():
        if sid not in A: continue
        v, p = A[sid]
        note = f"Vitrine : intro « Tapé dans Growthity » + vraie pub Growthity ({s['src']}) avec sa voix off + carte de fin. " + ("Brief reconstitué (fichier « Nouvelle pub »). " if s.get('reconstructed') else "Phrase = début réel du nom de fichier. ") + "À écouter avant publication (voix off non transcrite)."
        docs.append(('media', 'm-' + sid, 'set', {'title': 'Reel – ' + s['title'], 'kind': 'video', 'format': '9:16', 'items': [{'asset': v, 'ct': 'video/mp4', 'poster': p}], 'category': 'Pub Growthity', 'niche': s['label'], 'note': note, 'source': 'claude', 'createdAt': now, 'createdBy': None}))
    for w, d, tm, mid, pid, typ in P:
        day = START + datetime.timedelta(days=7 * (w - 1) + d)
        data = {'date': f'{day.isoformat()}T{tm}', 'status': 'review', 'launch': {'week': w, 'slot': d}}
        if pid.startswith(('r-', 'p-')):
            docs.append(('posts', pid, 'update', data)); continue
        if mid.startswith('m-s'):
            sid = mid[2:]
            if sid not in A: continue
            title, cap = 'Reel – ' + SHOW[sid]['title'], SCAP[sid] + '\n\n' + T
        else:
            title, cap = NEWMEDIA[mid][0], CAP[mid] + '\n\n' + T
        docs.append(('posts', pid, 'set', {'type': 'post', 'title': title, 'mediaId': mid, 'format': '9:16' if typ == 'Reel' else '4:5', 'networks': ['Instagram', 'Facebook'], 'caption': cap, 'ad': None, 'createdAt': now, 'updatedAt': now, 'createdBy': None, **data}))
    return docs, WEEKS
if __name__ == '__main__':
    docs, weeks = main(sys.argv[1], sys.argv[2])
    json.dump({'docs': docs, 'weeks': weeks}, open(os.path.join(sys.argv[2], 'phase2.json'), 'w'), ensure_ascii=False)
    print(len(docs))
