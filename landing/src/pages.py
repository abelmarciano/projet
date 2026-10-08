"""Content of every page. Each builder returns (title, meta description, body html)."""


def build_pages(b):
    P = {}
    sec, head, feat, copy, stack = b.section, b.head, b.feat, b.copy, b.stack
    blk = b.block

    def chat(start=0):
        h = blk('chat-demo')
        return h.replace('id="chatdemo"', 'id="chatdemo" data-start="%d"' % start) if start else h

    def stage(inner):
        return '<div class="stage rv">%s</div>' % inner

    def minis(*ids, cols=None):
        st = ' style="grid-template-columns:%s"' % cols if cols else ''
        return '<div class="minis"%s>%s</div>' % (st, ''.join(b.mini(i) for i in ids))

    def tail(rel, qa, faq_title='Vos questions.'):
        return stack(
            sec(stack(head('Questions fréquentes', faq_title), b.faq(qa)), style='padding-top:40px') if qa else '',
            sec(stack(head('À découvrir aussi', 'Allez plus loin', 'avec Growthity.'), b.related(rel)), cls='tint', style='padding-top:60px'),
            b.final())

    # ================================================================= HOME
    P['index'] = ("Growthity · Pubs Meta par IA",
                  "Décrivez votre produit en une phrase : vidéos UGC, visuels et carrousels sont créés par l'IA, puis publiés sur Meta en un clic. Conçu et hébergé en France.",
                  stack(
                      blk('hero'),
                      sec(stack(b.with_more(blk('chat-head'), 'chat-ia', 'Tout savoir sur le chat'), blk('chat-demo')), sid='demo'),
                      sec(stack(feat(b.with_more(blk('fmt-copy'), 'formats'), blk('fmt-stage')),
                                feat(b.with_more(blk('ed-copy'), 'editeur-video'), blk('ed-stage'), flip=True)), cls='tint', style='padding-top:40px'),
                      sec(stack(b.with_more(blk('spy-head'), 'espion-meta-ads', 'Découvrir l\'Espion Meta Ads'), blk('spy-demo')), cls='night', sid='espion'),
                      sec(feat(b.with_more(blk('studio-copy'), 'studio-en-lot'), blk('studio-stage'), flip=True), sid='studio'),
                      sec(stack(feat(b.with_more(blk('pub-copy'), 'publication-meta'), blk('pub-stage')),
                                feat(b.with_more(blk('perf-copy'), 'leads-ventes'), blk('perf-stage'), flip=True)), cls='tint', sid='publication', style='padding-top:40px'),
                      sec(stack(b.with_more(blk('mb-head'), 'pilotage-ia', 'Découvrir le pilotage IA'), blk('mb-demo')), sid='pilotage'),
                      sec(stack(blk('minis-head'), blk('minis'))),
                      blk('vs'), blk('faq'), b.final()))

    # ================================================================= PRODUIT
    P['chat-ia'] = ("Chat créatif IA · Growthity",
                    "Décrivez votre produit, le chat de Growthity écrit le script, choisit l'acteur, génère la vidéo UGC et le visuel, puis publie la campagne sur Meta.",
                    stack(
                        b.hero_center('chat-ia', ('Produit', 'Chat créatif IA'), 'Votre agence créative,', 'dans un chat.',
                                      "Décrivez ce que vous vendez. Le chat écrit le script, choisit l'acteur, génère la vidéo et le visuel, puis lance la campagne sur Meta. Vous validez chaque étape, comme avec un collègue.",
                                      demo=chat()),
                        b.facts([('2 min', 'du brief à la pub en ligne'), ('500+', 'acteurs UGC IA'), ('9:16 · 1:1 · 4:5', 'tous les formats Meta'), ('0 %', 'de commission sur le budget')]),
                        sec(stack(head('Comment ça marche', 'Trois messages,', 'une campagne.'),
                                  b.steps([('Décrivez votre produit', "Une phrase suffit, ou collez le lien de votre fiche produit : photos, prix et arguments sont récupérés automatiquement."),
                                           ('Validez l\'angle et l\'acteur', "Le chat propose un angle, un script et trois profils d'acteurs crédibles pour votre cible. Vous choisissez, il génère."),
                                           ('Publiez sur Meta', "Dites où, à qui et combien. La campagne part sur Facebook et Instagram, et le chat suit les résultats pour vous.")]))),
                        sec(stack(head('Ce que le chat sait faire', 'Tout le métier de la pub,', 'en langage naturel.'),
                                  b.features([('store', 'pink', 'Import depuis votre boutique', "Collez un lien Shopify ou de votre site : le produit, ses photos et ses arguments sont importés en quelques secondes."),
                                              ('text', 'indigo', 'Scripts qui accrochent', "Hooks, angles avant / après, témoignage, démonstration : le chat écrit pour la vidéo courte, pas pour une brochure."),
                                              ('user', 'blue', 'Casting en un message', "Trois profils d'acteurs adaptés à votre cible, parmi plus de 500. Ou votre propre acteur, créé depuis une photo."),
                                              ('wand', 'orange', 'Retouches en une phrase', "« Plus court », « change l'accroche », « ajoute le prix » : seule la partie concernée est régénérée."),
                                              ('send', 'meta', 'Publication intégrée', "Audience, zone, budget et objectif se règlent dans la conversation. Pas besoin d'ouvrir le Gestionnaire de publicités."),
                                              ('chart', 'green', 'Il lit vos résultats', "Demandez « Comment va ma campagne ? » : le chat répond avec vos chiffres et vous dit quoi faire ensuite.")])), cls='tint'),
                        tail(['acteurs-ugc', 'formats', 'publication-meta'], [
                            ("Faut-il savoir rédiger un brief ?", "Non. Écrivez comme vous parleriez à un collègue : ce que vous vendez, à qui, et ce que vous voulez obtenir. Le chat pose les bonnes questions s'il lui manque quelque chose."),
                            ("Puis-je garder la main sur chaque étape ?", "Oui. Rien n'est publié sans votre validation. Vous pouvez changer l'angle, l'acteur, le texte ou le visuel à tout moment."),
                            ("Le chat se souvient-il de ma marque ?", "Oui. Votre marque, vos produits et vos créations passées restent dans votre espace, le chat s'en sert pour rester cohérent d'une campagne à l'autre.")])))

    actors = [('lena-serum', 'Léna', 'f demo'), ('real-14', 'Inès', 'f face'), ('ugc-homme', 'Marc', 'h face pro'), ('real-42', 'Camille', 'f demo'),
              ('ugc-scierie', 'Sofia', 'f terrain'), ('actor-thomas', 'Thomas', 'h pro'), ('ugc-femme', 'Léa', 'f face'), ('real-40', 'Emma', 'f demo'),
              ('real-12', 'Hugo', 'h terrain'), ('ugc-pac-awa', 'Awa', 'f terrain face'), ('actor-claire', 'Claire', 'f pro'), ('real-05', 'Clara', 'f demo'),
              ('ugc-solaire', 'Sarah', 'f face'), ('actor-zoe', 'Zoé', 'f face'), ('real-19', 'Julie', 'f demo'), ('real-06', 'Chloé', 'f face'),
              ('real-04', 'Nina', 'f demo'), ('ugc-homme', 'Marc', 'h pro')]
    style_name = {'face': 'Face caméra', 'demo': 'Démo produit', 'pro': 'Corporate', 'terrain': 'Sur le terrain'}
    gal = ('<div class="afil" id="afil">' + ''.join('<button type="button" data-k="%s"%s>%s</button>' % (k, ' class="on"' if k == 'all' else '', l) for k, l in
           [('all', 'Tous'), ('f', 'Femmes'), ('h', 'Hommes'), ('face', 'Face caméra'), ('demo', 'Démo produit'), ('pro', 'Corporate'), ('terrain', 'Sur le terrain')]) + '</div>'
           '<div class="agal" id="agal">' + ''.join(
               '<div class="atile" data-k="%s"><video data-src="media/%s.mp4" poster="media/%s.poster.webp" muted loop playsinline preload="none"></video><span>%s<small>%s</small></span></div>'
               % (k, m, m, n, style_name[[x for x in k.split() if x in style_name][0]]) for m, n, k in actors[:17]) + '</div>')
    P['acteurs-ugc'] = ("500+ acteurs UGC IA · Growthity",
                        "Plus de 500 acteurs UGC IA réalistes pour vos pubs Meta, filtrables par style. Ou créez votre propre acteur à partir d'une simple photo.",
                        stack(
                            b.hero_center('acteurs-ugc', ('Produit', '500+ acteurs'), 'Des acteurs qui font', 'vrais clients.',
                                          "Plus de 500 acteurs UGC IA, face caméra, en démonstration, en tenue pro ou sur le terrain. Ils tiennent votre produit, parlent naturellement et ne se fatiguent jamais.",
                                          demo='<div class="rv">%s</div>' % gal),
                            sec(feat(copy('Votre acteur', 'Votre visage,', 'depuis une simple photo.',
                                          "Importez une photo de vous, de votre commercial ou de votre égérie. Growthity en fait un acteur réutilisable dans toutes vos vidéos, avec la même voix et le même ton.",
                                          ['Une seule photo suffit', 'Réutilisable dans toutes vos campagnes', 'Idéal pour les fondateurs et les marques incarnées']),
                                     stage(minis('m-clone', cols='1fr')), flip=True), cls='tint'),
                            sec(stack(head('Pourquoi ça marche', 'Le format UGC,', 'sans le casting.'),
                                      b.features([('eye', 'pink', 'Crédibles', "Lumière naturelle, décor du quotidien, regard caméra : des vidéos qui ressemblent à celles de vos clients, pas à une pub télé."),
                                                  ('bag', 'orange', 'Avec votre produit en main', "L'acteur tient, montre et utilise votre produit dans la scène. Le flacon, la boîte, l'écran : tout est intégré."),
                                                  ('mic', 'indigo', 'Voix naturelles en français', "Intonations, pauses, accents du quotidien. Le texte sonne parlé, pas lu."),
                                                  ('users', 'blue', 'Tous les profils', "Âges, styles, univers : choisissez la personne qui ressemble à votre client idéal."),
                                                  ('refresh', 'green', 'Toujours disponibles', "Une nouvelle accroche, une nouvelle version, un nouveau format : l'acteur rejoue la scène en quelques minutes."),
                                                  ('text', 'slate', 'Sous-titres inclus', "Sous-titres animés générés automatiquement, pour les 85 % de vidéos regardées sans le son.")]))),
                            tail(['chat-ia', 'formats', 'editeur-video'], [
                                ("Les acteurs sont-ils de vraies personnes ?", "Ce sont des acteurs générés par IA, conçus pour être réalistes. Vous pouvez aussi créer un acteur à partir de votre propre photo."),
                                ("Puis-je utiliser le même acteur sur plusieurs pubs ?", "Oui. Un acteur peut porter toutes vos campagnes, pour une image de marque cohérente."),
                                ("Peuvent-ils parler d'autre chose que d'un produit physique ?", "Oui : service, application, formation, offre locale. L'acteur témoigne, explique ou démontre, selon l'angle choisi.")])))

    P['formats'] = ("Vidéos, visuels & carrousels · Growthity",
                    "Un brief, et Growthity génère la vidéo UGC, le visuel et le carrousel, aux bons ratios pour Reels, Stories et le fil Facebook et Instagram.",
                    stack(
                        b.hero_split('formats', ('Produit', 'Tous les formats'), 'Un brief.', 'Toutes vos créas Meta.',
                                     "Vidéo UGC, visuel produit, carrousel : Growthity produit tout à partir d'une seule description, aux bons ratios pour chaque placement Facebook et Instagram.",
                                     ['Vidéo, visuel et carrousel en une fois', '9:16, 1:1 et 4:5 automatiquement', 'Plusieurs variantes à tester'], blk('fmt-stage')),
                        sec(stack(head('Les formats', 'Chaque placement,', 'son format.'),
                                  b.features([('play', 'pink', 'Vidéo UGC 9:16', "Le format roi des Reels et des Stories. Acteur, voix, sous-titres et plan produit inclus."),
                                              ('image', 'blue', 'Visuel 4:5 et 1:1', "Votre produit mis en scène, avec accroche et prix si vous le souhaitez. Parfait pour le fil."),
                                              ('copy', 'orange', 'Carrousel', "Trois à dix cartes qui racontent une histoire : bénéfice, preuve, offre. Généré d'un coup."),
                                              ('layers', 'indigo', 'Variantes à tester', "Plusieurs accroches et visuels pour la même idée, pour laisser Meta trouver la meilleure."),
                                              ('text', 'green', 'Textes de pub', "Texte principal, titre et bouton d'action, écrits pour Meta et adaptés à chaque créa."),
                                              ('wand', 'slate', 'Retouches en langage naturel', "« Fond plus clair », « produit plus grand » : décrivez, l'IA corrige.")])), cls='tint'),
                        sec(stack(head('Comment ça marche', 'De l\'idée au lot', 'prêt à publier.'),
                                  b.steps([('Décrivez', "Votre produit, votre cible et le ton voulu. Ou partez d'une pub repérée dans l'Espion Meta Ads."),
                                           ('Générez', "Plusieurs moteurs d'IA travaillent en parallèle : la vidéo, le visuel et le carrousel sortent ensemble."),
                                           ('Publiez', "Choisissez vos favorites et envoyez-les sur Meta, chacune sur le bon placement.")]))),
                        tail(['editeur-video', 'templates', 'studio-en-lot'], [
                            ("Quels ratios sont disponibles ?", "9:16 pour les Reels et Stories, 1:1 et 4:5 pour le fil. Chaque créa peut être déclinée dans les trois en un clic."),
                            ("Puis-je utiliser mes propres photos ?", "Oui. Importez vos photos produit ou laissez Growthity les récupérer sur votre site, elles servent de base aux visuels et aux vidéos.")])))

    P['editeur-video'] = ("Éditeur vidéo · Growthity",
                          "Coupez, insérez un plan produit, changez les sous-titres : l'éditeur vidéo de Growthity retouche vos pubs sans logiciel de montage.",
                          stack(
                              b.hero_split('editeur-video', ('Produit', 'Éditeur vidéo'), 'Montez vos pubs', 'sans logiciel.',
                                           "Insérez un plan produit, coupez une phrase, changez une accroche : l'éditeur garde tout le travail déjà fait et ne refait que ce qui change.",
                                           ['Timeline simple, pensée pour la vidéo courte', 'Plans produit insérés en un glisser', 'Sous-titres animés modifiables'], blk('ed-stage')),
                              sec(stack(head('Dans l\'éditeur', 'Tout ce qu\'il faut,', 'rien de plus.'),
                                        b.features([('image', 'pink', 'Insérer un plan produit', "Glissez une photo ou un visuel entre deux plans : il est animé et calé sur la voix."),
                                                    ('film', 'orange', 'Couper et réordonner', "Raccourcissez l'intro, déplacez la preuve avant l'offre, supprimez un temps mort."),
                                                    ('text', 'indigo', 'Sous-titres animés', "Mot à mot, mots-clés en couleur, position et style réglables."),
                                                    ('mic', 'blue', 'Nouvelle accroche', "Changez la première phrase : seule cette partie est rejouée par l'acteur."),
                                                    ('layers', 'green', 'Tous les ratios', "Recadrez en 9:16, 1:1 ou 4:5 sans perdre le visage ni le produit."),
                                                    ('chat', 'slate', 'Ou demandez au chat', "« Rends-la plus courte » : pas besoin de toucher à la timeline.")])), cls='tint'),
                              tail(['formats', 'acteurs-ugc', 'templates'], [
                                  ("Faut-il savoir monter ?", "Non. L'éditeur est conçu pour des retouches rapides, et le chat peut faire les modifications à votre place."),
                                  ("Puis-je importer mes propres vidéos ?", "Vous pouvez importer vos images et vos visuels pour les insérer dans les vidéos générées.")])))

    P['studio-en-lot'] = ("Studio en lot · Growthity",
                          "Collez l'adresse de votre site : Growthity analyse votre marque, propose les angles et produit une campagne entière de créas en une fois.",
                          stack(
                              b.hero_split('studio-en-lot', ('Produit', 'Studio en lot'), 'Collez votre site.', 'Recevez une campagne entière.',
                                           "Growthity lit votre site, comprend votre marque et vos produits, propose les bons angles et produit des dizaines de créas cohérentes, prêtes à tester.",
                                           ['Analyse automatique de la marque', 'Un plan d\'angles avant de produire', 'Des dizaines de créas en une fois'], blk('studio-stage')),
                              sec(stack(head('Comment ça marche', 'Comprendre, planifier,', 'produire.'),
                                        b.steps([('Analyse du site', "Pages produits, prix, avis, ton de marque : tout est lu et résumé pour vous."),
                                                 ('Plan de créas', "Growthity propose des angles différents (prix, preuve, cadeau, savoir-faire) que vous validez ou ajustez."),
                                                 ('Production du lot', "Vidéos, visuels et carrousels sont produits pour chaque angle, rangés et prêts à publier.")])), cls='tint'),
                              sec(stack(head('Pourquoi en lot', 'Testez plus,', 'trouvez plus vite.'),
                                        b.features([('trend', 'green', 'Plus de tests, moins de hasard', "Sur Meta, la créa fait la performance. Plus vous testez d'angles, plus vite vous trouvez celui qui vend."),
                                                    ('shield', 'indigo', 'Toujours dans votre marque', "Couleurs, ton et produits viennent de votre site : le lot reste cohérent d'une créa à l'autre."),
                                                    ('folder', 'orange', 'Rangé par angle', "Chaque lot est classé par angle et par format, pour publier et comparer facilement.")]))),
                              tail(['formats', 'espion-meta-ads', 'publication-meta'], [
                                  ("Combien de créas par lot ?", "Vous choisissez le nombre d'angles et de formats. Un lot typique contient plusieurs dizaines de créas, consommées en crédits."),
                                  ("Mon site doit-il être sur Shopify ?", "Non. N'importe quel site public fonctionne : boutique, site vitrine, page de réservation.")])))

    P['espion-meta-ads'] = ("Espion Meta Ads · Growthity",
                            "Growthity fouille la Meta Ads Library pour vous et repère les pubs de votre secteur qui tournent depuis des semaines. Inspirez-vous-en en un clic.",
                            stack(
                                b.hero_center('espion-meta-ads', ('Nouveau', 'Espion Meta Ads'), 'Growthity trouve', 'les pubs qui marchent.',
                                              "Donnez un mot-clé ou le nom d'un concurrent. Growthity parcourt pour vous la Meta Ads Library, repère les pubs qui tournent depuis des semaines, le signe qu'elles rapportent, et vous les montre comme vos clients les voient."),
                                sec(blk('spy-demo'), cls='night night-band'),
                                sec(stack(head('Comment ça marche', 'Vous cherchez une idée,', 'Growthity cherche les preuves.'),
                                          b.steps([('Un mot-clé ou un concurrent', "« sérum vitamine C », « cuisine sur mesure », le nom d'une marque : c'est tout ce qu'il faut."),
                                                   ('Growthity analyse', "Des milliers de pubs actives sont passées au crible. Celles qui tournent depuis des semaines sont marquées « Gagnant probable »."),
                                                   ('Vous vous en inspirez', "Voyez la pub en fil Instagram, en Story ou sur Facebook, puis envoyez-la au chat : il crée la vôtre sur le même principe.")]))),
                                sec(stack(head('Ce que vous voyez', 'Toute la concurrence,', 'en clair.'),
                                          b.features([('clock', 'indigo', 'Depuis combien de temps', "Une pub qui tourne depuis 40 jours rapporte, sinon elle aurait été coupée. C'est le meilleur signal public."),
                                                      ('phone', 'pink', 'Comme vos clients la voient', "Aperçu fil Instagram, Story et fil Facebook, avec le vrai texte et le vrai bouton."),
                                                      ('globe', 'blue', 'Facebook et Instagram', "Les placements de chaque pub, et les pubs actives d'un concurrent en un coup d'œil."),
                                                      ('bulb', 'orange', 'Angles et accroches', "Repérez les hooks, les formats et les offres qui reviennent dans votre secteur."),
                                                      ('wand', 'green', 'Inspirer, pas copier', "Le chat reprend le principe qui marche et l'applique à votre produit, avec vos acteurs et votre marque."),
                                                      ('folder', 'slate', 'Sauvegardez vos trouvailles', "Rangez les pubs repérées dans vos dossiers d'inspiration.")])), cls='tint'),
                                tail(['inspiration', 'chat-ia', 'studio-en-lot'], [
                                    ("D'où viennent les pubs ?", "De la Meta Ads Library, la bibliothèque publique de toutes les pubs actives sur Facebook et Instagram. Growthity la parcourt et l'analyse pour vous."),
                                    ("Comment savez-vous qu'une pub marche ?", "Meta ne publie pas les résultats des pubs. Le meilleur indice public est la durée : une pub qui tourne depuis des semaines est presque toujours rentable."),
                                    ("Est-ce légal ?", "Oui. La Meta Ads Library est publique. Growthity vous aide à vous inspirer des principes qui marchent, pas à copier les créas des autres.")])))

    P['publication-meta'] = ("Publication Meta Ads · Growthity",
                             "Publiez vos pubs sur Facebook et Instagram sans quitter Growthity : objectif, zones, audience et budget en quelques clics, 0 % de commission.",
                             stack(
                                 b.hero_split('publication-meta', ('Produit', 'Publication Meta'), 'En ligne sur Meta,', 'sans quitter l\'app.',
                                              "Objectif, villes, rayon, audience et budget : tout se règle dans Growthity. La campagne part sur votre compte publicitaire Meta, et vous ne payez aucune commission sur vos dépenses.",
                                              ['Ventes, leads ou trafic', 'Zones par ville, département ou rayon', '0 % de commission sur le budget'], blk('pub-stage')),
                                 b.facts([('1 clic', 'pour publier'), ('Facebook + Instagram', 'tous les placements'), ('Votre compte', 'publicitaire Meta'), ('0 %', 'de commission')]),
                                 sec(stack(head('Les réglages', 'Le Gestionnaire de publicités,', 'en simple.'),
                                           b.features([('target', 'indigo', 'Objectif', "Ventes, leads avec formulaire Meta, trafic vers votre site : choisissez ce que vous voulez obtenir."),
                                                       ('pin', 'orange', 'Zones', "Pays, régions, départements, villes ou rayon autour d'une adresse. La portée estimée se met à jour en direct."),
                                                       ('users', 'pink', 'Audience', "Âge, genre et centres d'intérêt, proposés par le chat selon votre produit."),
                                                       ('euro', 'green', 'Budget', "Un budget par jour, modifiable à tout moment. Il est facturé par Meta, directement sur votre compte."),
                                                       ('layers', 'blue', 'Placements', "Fil, Stories et Reels sur Facebook et Instagram, chaque créa au bon format."),
                                                       ('lock', 'slate', 'Votre compte, vos données', "Vous connectez votre compte Meta Business une fois. Les campagnes et l'historique restent à vous.")])), cls='tint'),
                                 tail(['pilotage-ia', 'leads-ventes', 'espion-meta-ads'], [
                                     ("Growthity prend-il une commission ?", "Non, 0 %. Votre budget est facturé par Meta sur votre propre compte publicitaire. Growthity ne touche jamais à vos dépenses pub."),
                                     ("Faut-il un compte Meta Business ?", "Oui, un compte publicitaire Meta. Vous le connectez une fois à Growthity, en quelques clics."),
                                     ("Puis-je modifier une campagne après publication ?", "Oui : budget, pause, nouvelle créa. Le chat peut le faire pour vous sur simple demande.")])))

    P['pilotage-ia'] = ("Pilotage IA · Growthity",
                        "Plus besoin de media buyer : Growthity lit vos résultats Meta, vous dit quelles pubs booster, couper ou tester, et repère les créas qui s'essoufflent.",
                        stack(
                            b.hero_center('pilotage-ia', ('Produit', 'Pilotage IA'), 'Plus besoin de media buyer.', 'Growthity vous dit quoi faire.',
                                          "Chaque jour, Growthity lit les chiffres de vos campagnes, repère ce qui marche et ce qui s'essouffle, et vous propose des actions concrètes à appliquer en un clic.",
                                          demo=blk('mb-demo')),
                            sec(stack(head('Les recommandations', 'Booster, couper,', 'tester.'),
                                      b.features([('trend', 'green', 'À booster', "Les pubs qui ramènent vos clients moins cher que la moyenne, avec la hausse de budget conseillée."),
                                                  ('pause', 'pink', 'À couper', "Les créas qui coûtent sans rapporter, ou que les mêmes personnes ont trop vues."),
                                                  ('bulb', 'orange', 'À tester', "De nouveaux angles et accroches à lancer, inspirés de ce qui marche déjà chez vous."),
                                                  ('refresh', 'indigo', 'Fatigue créative', "Un CTR qui baisse et une fréquence qui monte : Growthity vous prévient avant que vos coûts n'explosent."),
                                                  ('chart', 'blue', 'Vos chiffres en clair', "Dépenses, coût par lead ou par vente, ROAS : l'essentiel, sans tableau à 40 colonnes."),
                                                  ('chat', 'slate', 'Posez vos questions', "« Pourquoi mes coûts montent ? » Le chat répond avec vos données, en français.")])), cls='tint'),
                            sec(feat(copy('Dans le chat', 'Posez la question.', 'Le chat lit vos résultats.',
                                          "Demandez comment va votre campagne : le chat répond avec vos chiffres, vous montre les derniers leads et vous dit quoi faire.",
                                          ['Résumé de la semaine en une phrase', 'Leads et ventes reliés à chaque pub', 'Actions appliquées sur Meta en un clic'], more=('Voir Leads & ventes', 'leads-ventes.html')),
                                     blk('perf-stage'), flip=True)),
                            tail(['leads-ventes', 'publication-meta', 'espion-meta-ads'], [
                                ("Les actions sont-elles appliquées automatiquement ?", "Non, vous gardez la main. Growthity propose, vous validez en un clic, et le changement est appliqué sur Meta."),
                                ("Sur quelles données se basent les recommandations ?", "Sur les résultats de vos campagnes Meta : dépenses, clics, leads, ventes, fréquence et évolution dans le temps.")])))

    P['leads-ventes'] = ("Leads & ventes · Growthity",
                         "Les leads Meta arrivent en direct dans Growthity, et chaque vente de votre boutique est attribuée à la pub qui l'a apportée.",
                         stack(
                             b.hero_split('leads-ventes', ('Produit', 'Leads & ventes'), 'Chaque client,', 'relié à sa pub.',
                                          "Les leads de vos formulaires Meta arrivent en direct dans Growthity, et chaque vente de votre boutique est attribuée à la bonne créa. Vous savez enfin quelle pub vous rapporte.",
                                          ['Leads Meta en temps réel', 'Ventes attribuées à chaque créa', 'Coût par lead et ROAS par pub'], blk('perf-stage')),
                             sec(feat(copy('En direct', 'Vos leads et vos ventes,', 'au même endroit.',
                                           "Fini les exports CSV et les allers-retours entre Meta et votre boutique : tout remonte dans Growthity, pub par pub.",
                                           ['Nom, e-mail et téléphone du lead', 'Notification à chaque nouveau contact', 'La créa d\'origine de chaque vente']),
                                      stage(minis('m-leads', cols='1fr'))), cls='tint'),
                             sec(stack(head('Pourquoi c\'est important', 'Arrêtez de payer', 'les pubs qui ne rapportent pas.'),
                                       b.features([('target', 'green', 'Le vrai coût par client', "Pas seulement le coût par clic : ce que chaque lead et chaque vente vous coûte, créa par créa."),
                                                   ('trend', 'indigo', 'Doublez ce qui marche', "Repérez la pub qui ramène la moitié de vos leads, et donnez-lui plus de budget."),
                                                   ('bolt', 'orange', 'Rappelez plus vite', "Un lead rappelé dans l'heure convertit bien mieux. Vous êtes prévenu dès qu'il arrive.")]))),
                             tail(['pilotage-ia', 'b2b-leads', 'publication-meta'], [
                                 ("Quels formulaires sont pris en charge ?", "Les formulaires instantanés Meta (Lead Ads) créés avec vos campagnes Growthity."),
                                 ("Comment les ventes sont-elles attribuées ?", "Les ventes de votre boutique sont reliées à la pub qui a amené le client, pour connaître le retour de chaque créa.")])))

    # ================================================================= SOLUTIONS
    P['ecommerce'] = ("Growthity pour l'e-commerce",
                      "Des pubs UGC qui font vendre vos produits : import depuis votre boutique, acteurs qui tiennent votre produit, campagnes Meta et ventes attribuées.",
                      stack(
                          b.hero_center('ecommerce', ('Solutions', 'E-commerce'), 'Des pubs qui font', 'vendre vos produits.',
                                        "Importez un produit depuis votre boutique, Growthity crée la vidéo UGC avec un acteur qui le tient en main, le visuel et le carrousel, puis lance la campagne de ventes sur Meta.",
                                        demo=chat(0), second=('Voir l\'Espion Meta Ads', 'espion-meta-ads.html')),
                          sec(stack(head('Pour tous les produits', 'Beauté, mode, maison,', 'tech, food…'),
                                    b.uses([('Beauté & skincare', None), ('Mode & accessoires', None), ('Maison & déco', None), ('Tech & gadgets', None), ('Food & boissons', None),
                                            ('Sport & bien-être', None), ('Bébé & enfants', None), ('Animaux', None), ('Bijoux', None), ('Cadeaux', None)]))),
                          sec(feat(copy('Studio en lot', 'Toute votre boutique,', 'en créas.',
                                        "Collez l'adresse de votre boutique : Growthity comprend votre marque, propose des angles (prix, preuve, cadeau, savoir-faire) et produit un lot complet.",
                                        ['Photos et prix importés', 'Angles adaptés à chaque produit', 'Lot rangé et prêt à publier'], more=('Découvrir le Studio en lot', 'studio-en-lot.html')),
                                   blk('studio-stage'), flip=True), cls='tint'),
                          sec(stack(head('Ce qui change', 'Plus de créas,', 'plus de ventes.'),
                                    b.features([('store', 'pink', 'Import depuis la boutique', "Un lien produit suffit : photos, prix, avis et arguments sont récupérés."),
                                                ('user', 'indigo', 'Le produit en main', "Des acteurs UGC qui montrent et utilisent votre produit, comme une vraie cliente."),
                                                ('euro', 'green', 'Ventes attribuées', "Chaque vente est reliée à la créa qui l'a apportée, pour savoir où mettre votre budget.")]))),
                          tail(['studio-en-lot', 'templates', 'espion-meta-ads'], [
                              ("Ma boutique doit-elle être sur Shopify ?", "Non. Shopify, WooCommerce, PrestaShop ou un site sur mesure : il suffit que vos pages produits soient publiques."),
                              ("Puis-je faire une pub pour plusieurs produits ?", "Oui : carrousel multi-produits, lot par collection, ou une vidéo par produit phare.")])))

    P['b2b-leads'] = ("Growthity pour le B2B et les services",
                      "Générez des leads qualifiés sur Facebook et Instagram : vidéos UGC au ton pro, formulaires Meta, leads en direct et pilotage par l'IA.",
                      stack(
                          b.hero_center('b2b-leads', ('Solutions', 'B2B & services'), 'Des leads qualifiés,', 'chaque semaine.',
                                        "Cabinet, agence, SaaS, formation, conseil : Growthity crée des vidéos au ton pro, publie des campagnes de leads avec formulaire Meta, et vous montre quels contacts viennent de quelle pub.",
                                        demo=chat(1), second=('Voir Leads & ventes', 'leads-ventes.html')),
                          sec(feat(copy('Leads', 'Posez la question.', 'Voyez vos leads.',
                                        "Le chat résume vos résultats, vous montre les derniers leads et la pub qui les a apportés. Vous rappelez les bons contacts au bon moment.",
                                        ['Formulaires instantanés Meta', 'Leads en direct dans Growthity', 'Coût par lead par créa'], more=('Découvrir Leads & ventes', 'leads-ventes.html')),
                                   blk('perf-stage')), cls='tint'),
                          sec(stack(head('Pour qui', 'Les services', 'qui vendent sur rendez-vous.'),
                                    b.uses([('Recrutement & RH', None), ('Agences & conseil', None), ('Logiciels & SaaS', None), ('Formation', None), ('Immobilier', None),
                                            ('Assurance & finance', None), ('Énergie & rénovation', None), ('Santé & bien-être', None), ('Coaching', None)]))),
                          sec(stack(head('Ce qui change', 'Une machine à leads,', 'sans agence.'),
                                    b.features([('briefcase', 'blue', 'Ton pro, format UGC', "Des acteurs en tenue pro qui parlent du problème de votre client, pas de votre entreprise."),
                                                ('target', 'green', 'Leads qualifiés', "Questions de qualification dans le formulaire Meta, pour ne rappeler que les bons contacts."),
                                                ('chart', 'indigo', 'Pilotage par l\'IA', "Growthity vous dit quelles pubs ramènent les leads les moins chers et lesquelles couper.")])), cls='tint'),
                          tail(['leads-ventes', 'pilotage-ia', 'acteurs-ugc'], [
                              ("Meta marche-t-il pour le B2B ?", "Oui, surtout pour les PME et les indépendants : dirigeants, DRH et décideurs sont sur Facebook et Instagram comme tout le monde."),
                              ("Puis-je mettre mon propre visage dans les vidéos ?", "Oui. Créez votre acteur depuis une photo : vos pubs sont incarnées par vous, sans tournage.")])))

    P['commerce-local'] = ("Growthity pour le commerce local et les artisans",
                           "Restaurants, artisans, salons, agences immobilières : des pubs Meta ciblées autour de chez vous, créées et publiées en quelques minutes.",
                           stack(
                               b.hero_center('commerce-local', ('Solutions', 'Commerce local'), 'Des clients', 'autour de chez vous.',
                                             "Restaurant, artisan, salon, garage, agence : Growthity crée une pub qui montre votre savoir-faire et la diffuse uniquement aux personnes de votre zone, avec le budget que vous choisissez.",
                                             demo=chat(2), second=('Voir la publication Meta', 'publication-meta.html')),
                               sec(feat(copy('Ciblage local', 'Votre ville,', 'votre rayon.',
                                             "Choisissez des villes, des départements ou un rayon autour de votre adresse. La portée estimée s'affiche en direct, le budget reste sous contrôle.",
                                             ['Ville, département ou rayon', 'Budget dès quelques euros par jour', 'Appels, devis ou réservations'], more=('Découvrir la publication Meta', 'publication-meta.html')),
                                        blk('pub-stage')), cls='tint'),
                               sec(stack(head('Pour qui', 'Tous les métiers', 'de proximité.'),
                                         b.uses([('Restaurants', None), ('Artisans du bâtiment', None), ('Menuisiers & cuisinistes', None), ('Salons de coiffure & beauté', None), ('Garages', None),
                                                 ('Agences immobilières', None), ('Salles de sport', None), ('Boutiques', None), ('Cliniques & cabinets', None), ('Photographes', None)]))),
                               sec(stack(head('Ce qui change', 'Une vraie pub,', 'sans tournage.'),
                                         b.features([('film', 'orange', 'Votre savoir-faire en vidéo', "Une vidéo UGC tournée « à l'atelier » ou « en salle », qui donne envie de venir."),
                                                     ('pin', 'blue', 'Seulement votre zone', "Vous ne payez que pour les personnes qui peuvent réellement venir chez vous."),
                                                     ('calendar', 'green', 'Des demandes concrètes', "Demandes de devis, appels, réservations : l'objectif est celui de votre métier.")])), cls='tint'),
                               tail(['publication-meta', 'acteurs-ugc', 'leads-ventes'], [
                                   ("Quel budget prévoir ?", "Dès quelques euros par jour. Pour une zone locale, 10 à 30 € par jour suffisent souvent pour obtenir des demandes régulières."),
                                   ("Je n'ai pas de site, est-ce un problème ?", "Non. Les pubs peuvent renvoyer vers un formulaire Meta, un appel ou votre page Google.")])))

    P['agences'] = ("Growthity pour les agences",
                    "Gérez toutes vos marques clientes dans une seule app : workspaces séparés, équipe et rôles, production en lot, publication et pilotage Meta.",
                    stack(
                        b.hero_center('agences', ('Solutions', 'Agences'), 'Toutes vos marques,', 'une seule app.',
                                      "Un workspace par client, votre équipe avec les bons rôles, des lots de créas produits en minutes et des campagnes pilotées par l'IA. Livrez plus, sans recruter.",
                                      second=('Voir le Studio en lot', 'studio-en-lot.html')),
                        sec(stack(minis('m-team', 'm-fold', 'm-clone'))),
                        sec(feat(copy('Production', 'Un nouveau client ?', 'Un lot de créas le jour même.',
                                      "Collez son site : Growthity analyse la marque, propose les angles et produit le lot. Votre équipe valide, ajuste et publie.",
                                      ['Analyse de marque automatique', 'Lots rangés par client et par angle', 'Publication sur le compte Meta du client'], more=('Découvrir le Studio en lot', 'studio-en-lot.html')),
                                 blk('studio-stage'), flip=True), cls='tint'),
                        sec(stack(head('Pensé pour les agences', 'Plus de clients,', 'la même équipe.'),
                                  b.features([('folder', 'orange', 'Workspaces séparés', "Chaque client a sa marque, ses créations, sa mémoire et son compte Meta."),
                                              ('users', 'indigo', 'Équipe et rôles', "Invitez vos créatifs et vos media buyers avec des droits admin ou éditeur."),
                                              ('chart', 'green', 'Pilotage multi-comptes', "Les recommandations de l'IA pour chaque client, pour ne rien laisser filer.")]))),
                        tail(['studio-en-lot', 'pilotage-ia', 'templates'], [
                            ("Mes clients peuvent-ils accéder à leur espace ?", "Vous pouvez inviter un client dans son workspace, avec le rôle qui convient."),
                            ("Les données des clients sont-elles séparées ?", "Oui. Marques, créations, comptes Meta et historique sont cloisonnés par workspace.")])))

    # ================================================================= RESSOURCES
    insp = [('img-serum', 'beaute', 'Beauté', 'Visuel 4:5', 0), ('real-42', 'beaute', 'Beauté', 'UGC 9:16', 1), ('img-sneakers', 'mode', 'Mode', 'Visuel 1:1', 0),
            ('real-19', 'maison', 'Maison', 'UGC 9:16', 1), ('img-macbook', 'tech', 'Tech', 'Visuel 1:1', 0), ('real-04-hd', 'local', 'Restaurant', 'UGC 9:16', 1),
            ('img-bougie', 'maison', 'Maison', 'Visuel 1:1', 0), ('ugc-homme', 'services', 'Services', 'UGC 9:16', 1), ('real-05', 'maison', 'Maison', 'UGC 9:16', 1),
            ('ugc-scierie', 'local', 'Artisan', 'UGC 9:16', 1), ('real-40', 'tech', 'Tech', 'UGC 9:16', 1), ('ugc-solaire', 'beaute', 'Beauté', 'UGC 9:16', 1),
            ('real-12', 'services', 'Énergie', 'UGC 9:16', 1), ('lena-serum', 'beaute', 'Beauté', 'UGC 9:16', 1), ('real-14', 'services', 'Coaching', 'UGC 9:16', 1),
            ('bougie-916', 'maison', 'Maison', 'Vidéo produit', 1), ('ugc-pac-awa', 'services', 'Énergie', 'UGC 9:16', 1), ('real-06', 'mode', 'Mode', 'UGC 9:16', 1)]
    igal = ('<div class="afil" id="afil">' + ''.join('<button type="button" data-k="%s"%s>%s</button>' % (k, ' class="on"' if k == 'all' else '', l) for k, l in
            [('all', 'Tout'), ('beaute', 'Beauté'), ('mode', 'Mode'), ('maison', 'Maison'), ('tech', 'Tech'), ('services', 'Services'), ('local', 'Local')]) + '</div>'
            '<div class="agal" id="agal">' + ''.join(
                ('<div class="atile" data-k="%s"><video data-src="media/%s.mp4" poster="media/%s.poster.webp" muted loop playsinline preload="none"></video><span>%s<small>%s</small></span></div>' % (k, m, m, sct, fm)
                 if v else '<div class="atile" data-k="%s"><img src="media/%s.webp" alt="" loading="lazy" style="object-fit:cover"><span>%s<small>%s</small></span></div>' % (k, m, sct, fm))
                for m, k, sct, fm, v in insp) + '</div>')
    P['inspiration'] = ("Galerie d'inspiration · Growthity",
                        "Des pubs qui performent, triées par secteur et par format. Sauvegardez-les et envoyez-les au chat de Growthity comme modèle.",
                        stack(
                            b.hero_center('inspiration', ('Ressources', 'Galerie'), 'L\'inspiration,', 'triée pour vous.',
                                          "Des pubs qui performent, rangées par secteur et par format. Trouvez une idée, sauvegardez-la, et envoyez-la au chat : il l'adapte à votre produit.",
                                          demo='<div class="rv">%s</div>' % igal, second=('Voir l\'Espion Meta Ads', 'espion-meta-ads.html')),
                            sec(feat(copy('Dans l\'app', 'Une idée vous plaît ?', 'Le chat s\'en inspire.',
                                          "Sauvegardez une pub dans vos favoris ou vos dossiers, puis envoyez-la au chat comme référence : il reprend le principe avec votre produit et vos acteurs.",
                                          ['Filtres par secteur et par format', 'Favoris et dossiers', 'Envoi au chat en un clic'], more=('Chercher chez vos concurrents', 'espion-meta-ads.html')),
                                     stage(minis('m-insp', cols='1fr'))), cls='tint'),
                            tail(['espion-meta-ads', 'templates', 'guide-pub-ugc'], [])))

    P['templates'] = ("Templates vidéo produit · Growthity",
                      "Choisissez un style, glissez votre photo produit : Growthity la met en scène et l'anime en vidéo, prête pour les Reels et les Stories.",
                      stack(
                          b.hero_split('templates', ('Ressources', 'Templates'), 'Votre photo produit,', 'mise en scène.',
                                       "Choisissez un style, glissez une simple photo de votre produit : Growthity la place dans un décor, l'anime et en fait une vidéo prête pour Meta.",
                                       ['Une photo suffit', 'Des styles pour chaque univers', 'Vidéo 9:16 prête à publier'], stage(minis('m-tpl', cols='1fr'))),
                          sec(stack(head('Les styles', 'Un décor pour', 'chaque produit.'),
                                    b.features([('image', 'pink', 'Studio', "Fond uni, lumière douce, le produit au centre. Idéal pour la beauté et les accessoires."),
                                                ('store', 'orange', 'Lifestyle', "Le produit dans la vraie vie : sur une table, dans une salle de bain, dans la rue."),
                                                ('spark', 'indigo', 'Packshot animé', "Rotation, zoom et reflets : le produit sous tous les angles."),
                                                ('bag', 'blue', 'Unboxing', "Ouverture du colis et découverte du produit, comme une cliente."),
                                                ('refresh', 'green', 'Avant / après', "Le résultat de votre produit, montré en deux temps."),
                                                ('calendar', 'slate', 'Saisonnier', "Noël, fête des mères, soldes : le même produit, l'ambiance du moment.")])), cls='tint'),
                          tail(['formats', 'studio-en-lot', 'inspiration'], [
                              ("Quelle photo faut-il ?", "Une photo nette du produit, idéalement détouré ou sur fond simple. Celles de votre site conviennent très bien."),
                              ("Puis-je ajouter un acteur ?", "Oui : partez du template, puis demandez au chat d'ajouter un acteur UGC qui présente le produit.")])))

    toc = [('hook', 'Les 3 premières secondes décident de tout'), ('script', 'La structure d\'un script qui vend'), ('acteur', 'Choisir le bon acteur'),
           ('formats', 'Formats et placements'), ('tests', 'Tester sans se ruiner'), ('fatigue', 'Repérer la fatigue créative')]
    article = '''<div class="toc rv"><b>Au sommaire</b><ol>%s</ol></div>
<article class="prose">
<h2 id="hook">1. Les 3 premières secondes décident de tout</h2>
<p>Sur Instagram et Facebook, on fait défiler. Votre pub a environ trois secondes pour arrêter le pouce. Ce moment s'appelle le <b>hook</b>, ou accroche. Une bonne vidéo avec un hook faible ne sera jamais vue.</p>
<p>Les accroches qui fonctionnent le mieux sont concrètes et personnelles :</p>
<ul>
<li><b>Le résultat :</b> « 3 semaines, zéro fond de teint. »</li>
<li><b>La surprise :</b> « Je pensais qu'un carport solaire coûtait trop cher… »</li>
<li><b>Le problème :</b> « Vous passez vos soirées à trier des CV ? »</li>
<li><b>La démonstration :</b> le produit en action dès la première image.</li>
</ul>
<div class="tip"><b>Astuce</b>Testez toujours plusieurs hooks pour la même vidéo. C'est la variable qui fait le plus varier vos coûts, bien avant la musique ou le montage.</div>

<h2 id="script">2. La structure d'un script qui vend</h2>
<p>Une pub UGC efficace dure entre 15 et 30 secondes et suit presque toujours la même trame :</p>
<ol>
<li><b>Hook</b> (0–3 s) : on arrête le défilement.</li>
<li><b>Problème</b> (3–8 s) : la situation que vit votre client.</li>
<li><b>Solution</b> (8–18 s) : votre produit, montré en action.</li>
<li><b>Preuve</b> (18–24 s) : résultat, avis, chiffre, avant / après.</li>
<li><b>Appel à l'action</b> (24–30 s) : quoi faire, maintenant.</li>
</ol>
<p>Le ton doit sonner parlé. Une phrase qu'on n'oserait pas dire à une amie n'a rien à faire dans un UGC. Évitez le jargon et les superlatifs : « franchement, je ne m'attendais pas à ça » vend mieux que « une formule révolutionnaire ».</p>

<h2 id="acteur">3. Choisir le bon acteur</h2>
<p>La règle est simple : <b>votre acteur doit ressembler à votre client</b>. Un sérum pour peaux mixtes se vend mieux avec une jeune femme qui a l'air d'en avoir besoin ; une offre de recrutement, avec un dirigeant crédible en chemise.</p>
<p>Regardez aussi le décor. Une salle de bain, une cuisine, un atelier, un bureau : le contexte dit « c'est quelqu'un comme vous » avant même la première phrase.</p>
<div class="tip"><b>Avec Growthity</b>Le chat propose trois profils parmi plus de 500 acteurs selon votre cible, et vous pouvez créer votre propre acteur à partir d'une photo.</div>

<h2 id="formats">4. Formats et placements</h2>
<p>Chaque placement a son format idéal :</p>
<ul>
<li><b>9:16</b> pour les Reels et les Stories : plein écran, le format de la vidéo UGC.</li>
<li><b>4:5</b> pour le fil Instagram et Facebook : il prend plus de place qu'un carré.</li>
<li><b>1:1</b> pour le fil et la colonne de droite sur ordinateur.</li>
</ul>
<p>Pensez aussi aux sous-titres : la majorité des vidéos sont regardées sans le son. Un sous-titre lisible, avec les mots-clés en couleur, fait souvent la différence.</p>

<h2 id="tests">5. Tester sans se ruiner</h2>
<p>Sur Meta, on ne devine pas la bonne pub, on la trouve en testant. La méthode la plus simple :</p>
<ol>
<li>Lancez <b>3 à 5 créas différentes</b> par l'angle (prix, preuve, problème, cadeau), pas seulement par la couleur.</li>
<li>Laissez tourner <b>3 à 5 jours</b> avec le même budget.</li>
<li>Coupez celles dont le coût par résultat est nettement au-dessus de la moyenne.</li>
<li>Déclinez la gagnante : nouveaux hooks, nouveaux acteurs, nouveaux formats.</li>
</ol>
<p>Pour trouver des angles qui marchent déjà, regardez ce que fait votre secteur : une pub qui tourne depuis des semaines chez un concurrent est presque toujours rentable.</p>

<h2 id="fatigue">6. Repérer la fatigue créative</h2>
<p>Une bonne pub finit toujours par s'user : les mêmes personnes la voient trop souvent. Les signes sont clairs :</p>
<ul>
<li>la <b>fréquence</b> dépasse 3 à 4 vues par personne ;</li>
<li>le <b>taux de clic</b> baisse semaine après semaine ;</li>
<li>le <b>coût par résultat</b> monte sans changement de budget.</li>
</ul>
<p>À ce moment-là, pas besoin de tout refaire : gardez l'angle qui marche et changez le hook, l'acteur ou le format.</p>
<div class="tip"><b>Avec Growthity</b>Le pilotage IA surveille vos créas et vous prévient dès qu'une pub s'essouffle, avec des idées de nouvelles versions à tester.</div>
</article>''' % ''.join('<li><a href="#%s">%s</a></li>' % t for t in toc)
    P['guide-pub-ugc'] = ("Guide : la pub UGC qui convertit · Growthity",
                          "Hooks, scripts, choix de l'acteur, formats, tests et fatigue créative : la méthode pour créer des pubs UGC qui vendent sur Facebook et Instagram.",
                          stack(
                              b.hero_center('guide-pub-ugc', ('Guide', '8 min de lecture'), 'La pub UGC', 'qui convertit.',
                                            "Hooks, scripts, acteurs, formats, tests : tout ce qu'il faut savoir pour créer des vidéos UGC qui vendent sur Facebook et Instagram, sans agence.",
                                            second=('Voir la démo', b.HOME + '#demo'), meta=False),
                              sec(b.fr(article), style='padding-top:0'),
                              tail(['chat-ia', 'espion-meta-ads', 'pilotage-ia'], [])))

    rows = [('Délai pour une première pub', 'Plusieurs semaines (brief, casting, tournage, montage)', 'Quelques minutes'),
            ('Coût de production', 'Plusieurs centaines à milliers d\'euros par vidéo', 'Quelques crédits par créa'),
            ('Commission sur le budget pub', 'Souvent 10 à 20 %', '0 %'),
            ('Nombre de créas testées', 'Quelques-unes par mois', 'Autant que vous voulez'),
            ('Nouvelle version d\'une pub', 'Nouveau devis, nouveau délai', 'Une phrase dans le chat'),
            ('Suivi des résultats', 'Rapport mensuel', 'En direct, avec des recommandations'),
            ('Votre compte Meta', 'Parfois géré par l\'agence', 'Toujours le vôtre')]
    table = ('<table class="ctable rv"><thead><tr><th></th><th>Agence ou freelance</th><th class="us">Growthity</th></tr></thead><tbody>%s</tbody></table>'
             % ''.join('<tr><td>%s</td><td>%s</td><td class="us">%s</td></tr>' % r for r in rows))
    P['growthity-vs-agence'] = ("Growthity ou une agence ? Le comparatif",
                                "Délais, coûts, commission, nombre de tests, contrôle : comparez Growthity à une agence ou un freelance pour vos pubs Facebook et Instagram.",
                                stack(
                                    b.hero_center('growthity-vs-agence', ('Comparatif', 'Agence vs Growthity'), 'Growthity ou une agence ?', 'Le vrai comparatif.',
                                                  "Une agence apporte du conseil et du temps humain. Growthity apporte la vitesse, le volume de tests et le contrôle total, sans commission sur votre budget. Voici les différences, honnêtement.",
                                                  meta=False),
                                    sec(table, style='padding-top:0'),
                                    blk('vs'),
                                    sec(stack(head('Le bon choix', 'Growthity est fait pour vous', 'si…'),
                                              b.features([('bolt', 'orange', 'Vous voulez aller vite', "Lancer une pub cette semaine, pas le mois prochain."),
                                                          ('refresh', 'indigo', 'Vous voulez tester beaucoup', "Trouver la créa gagnante demande du volume, que le tournage classique ne permet pas."),
                                                          ('lock', 'green', 'Vous voulez garder la main', "Votre compte, votre budget, vos données, et des décisions que vous comprenez.")]))),
                                    tail(['chat-ia', 'pilotage-ia', 'agences'], [
                                        ("Puis-je utiliser Growthity avec mon agence ?", "Oui. Beaucoup d'agences utilisent Growthity pour produire plus de créas et piloter plus de comptes avec la même équipe."),
                                        ("Et si j'ai besoin de conseils ?", "Le chat et le pilotage IA vous guident à chaque étape, avec des recommandations basées sur vos propres résultats.")])))

    import re
    home_faq = re.findall(r'<summary>(.*?)<i></i></summary><p>(.*?)</p>', blk('faq'))
    groups = [('Démarrer', home_faq[:5] + [("Combien de temps pour créer une pub ?", "Quelques minutes : décrivez votre produit, choisissez l'angle et l'acteur, la vidéo et les visuels sont générés.")]),
              ('Meta & budget', [home_faq[5], ("Faut-il un compte Meta Business ?", "Oui, un compte publicitaire Meta. Vous le connectez une fois à Growthity, en quelques clics."),
                                 ("Puis-je arrêter une campagne à tout moment ?", "Oui. Pause, budget, nouvelle créa : tout se modifie depuis Growthity ou en le demandant au chat.")]),
              ('Secteurs & équipes', home_faq[6:8]),
              ('Données & sécurité', home_faq[8:])]
    faqs = ''.join('<div class="head rv" style="margin-bottom:12px;margin-top:%s"><h2 style="font-size:clamp(24px,3vw,32px)">%s</h2></div>%s' % ('0' if i == 0 else '56px', g, b.faq(items))
                   for i, (g, items) in enumerate(groups))
    P['faq'] = ("Questions fréquentes · Growthity",
                "Crédits, publication Meta, commission, acteurs, données, équipes : toutes les réponses sur Growthity.",
                stack(
                    b.hero_center('faq', ('Aide', 'FAQ'), 'Questions', 'fréquentes.',
                                  "Tout ce qu'il faut savoir sur Growthity : création, publication sur Meta, budget, équipe et données.", meta=False),
                    sec(faqs, style='padding-top:0'),
                    sec(stack(head('À découvrir aussi', 'Allez plus loin', 'avec Growthity.'), b.related(['chat-ia', 'espion-meta-ads', 'guide-pub-ugc'])), cls='tint', style='padding-top:60px'),
                    b.final()))
    return P
