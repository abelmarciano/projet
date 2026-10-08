"""Product pages rebuilt from the real app: each page shows faithful screens and the exact capabilities.

Source of truth: the inventories written from the app's code (scratchpad/facts/*.md).
"""
import mocks as M


def build_products(b):
    P = {}
    sec, head, stack, copy, split = b.section, b.head, b.stack, b.copy, b.split

    def tail(rel, qa, title='Vos questions.'):
        return stack(sec(b.faq2(qa, title)) if qa else '',
                     sec(stack(head('À découvrir aussi', 'Allez plus loin', 'avec Growthity.'), b.related(rel)), cls='tint', style='padding-top:60px'),
                     b.final())

    # ================================================================ LEADS & VENTES (mini CRM)
    P['leads-ventes'] = ("Leads & ventes · Growthity", "Le mini CRM de vos leads Meta : statuts, notes, filtres, export CSV, formulaires qui qualifient, et les ventes de vos campagnes.", stack(
        b.hero_center('leads-ventes', ('Produit', 'Leads & ventes'), 'Vos leads Meta,', 'dans un vrai mini CRM.',
                      "Tous les contacts de vos formulaires Meta arrivent dans Growthity, même ceux des campagnes créées hors de l'app. Vous les suivez par statut, vous les annotez, vous les rappelez, vous les exportez.",
                      demo=M.crm()),
        b.nums([('60 s', 'synchronisation automatique, plus la réception Meta en temps réel'), ('5 + ∞', 'statuts par défaut, plus les vôtres en couleur'),
                ('1 clic', 'pour exporter les leads filtrés en CSV'), ('Toutes', 'vos Pages et formulaires Meta, Growthity ou non')]),
        sec(split(copy('La fiche lead', 'Tout sur le contact,', 'au même endroit.',
                       "Coordonnées cliquables, provenance complète (campagne, publicité, ensemble, formulaire, plateforme), toutes les réponses au formulaire rendues lisibles, le statut et vos notes internes.",
                       ['Lead précédent / suivant pour enchaîner les rappels', 'Bouton « Copier la fiche » pour votre agenda ou votre CRM', 'Notes internes jusqu\'à 5 000 caractères']),
                  M.lead_card(), flip=True), cls='tint'),
        sec(stack(head('Statuts et qualification', 'Le tri se fait', 'tout seul.',
                       "Les statuts suivent votre process commercial. Et grâce aux formulaires créés par le chat, une mauvaise réponse classe le lead automatiquement."),
                  '<div class="duo">%s%s</div>' % (M.statuses(), M.lead_form()))),
        sec(split(copy('Formulaires instantanés', 'Décrivez le formulaire,', 'le chat le crée sur Meta.',
                       "« Demande s'il est propriétaire, le type de logement et sa facture d'électricité ; les locataires ne m'intéressent pas. » Le chat crée le formulaire Meta et retient la règle de qualification.",
                       ['Questions standard : nom, email, téléphone, adresse, entreprise, poste…', 'Questions perso : réponse libre, choix unique, Oui / Non', '« Plus de volume » ou « Intention plus forte » (écran de vérification)',
                        'Carte d\'intro, politique de confidentialité, page de remerciement']),
                  M.first_lead_mail()), cls='tint'),
        sec(split(copy('Ventes', 'Ce que vos campagnes', 'vous rapportent.',
                       "Pour vos campagnes à objectif ventes, l'onglet Ventes affiche les commandes, le revenu généré, le retour sur pub et le taux de conversion, campagne par campagne, depuis vos données Meta.",
                       ['Ventes, Revenu généré, Retour sur pub, Taux de conversion', 'Filtres par campagne et par statut', 'Export CSV de toutes les colonnes']),
                  M.sales(), flip=True)),
        sec(stack(head('Export CSV', 'Vos leads partent', 'où vous voulez.', "Le fichier reprend les leads filtrés, avec une colonne par question du formulaire. Compatible Excel, Google Sheets et votre CRM."),
                  M.csv_cols()), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que fait', 'le mini CRM.'), b.specs([
            ('search', 'blue', 'Recherche et filtres', ['Recherche dans le nom, l\'email, le téléphone, les notes, la pub et toutes les réponses', 'Statut, formulaire, période (date et heure)',
                                                       'Campagne, publicité, plateforme, Page Meta, compte publicitaire', 'Leads de test masqués par défaut']),
            ('target', 'green', 'Liste', ['Groupée par Aujourd\'hui, Hier, Plus tôt cette semaine, Plus ancien', 'Compteurs du jour et de la semaine, un par statut',
                                         'Miniature de la créa et badge « Growthity »', 'Appeler ou envoyer un email au survol']),
            ('refresh', 'indigo', 'Synchronisation', ['À l\'ouverture puis toutes les 60 secondes', 'Réception Meta en temps réel', 'Statuts et notes jamais écrasés, pas de doublons',
                                                    'Email « Votre premier lead vient d\'arriver »'])]))),
        tail(['pilotage-ia', 'publication-meta', 'b2b-leads'], [
            ("Les leads des campagnes créées hors de Growthity remontent-ils ?", "Oui. Growthity récupère les leads de tous les formulaires instantanés des Pages connectées, que la campagne ait été créée dans Growthity ou directement dans Meta."),
            ("Puis-je créer mes propres statuts ?", "Oui : ajoutez un statut (40 caractères, couleur au choix) à côté de Nouveau, Contacté, Qualifié, Converti et Perdu. Ils sont partagés avec toute l'équipe de l'espace."),
            ("Comment fonctionne le « Non qualifié » automatique ?", "Quand le chat crée votre formulaire, vous indiquez les réponses qui disqualifient. Meta ne bloque pas le prospect, mais Growthity classe le lead en « Non qualifié » dès sa réception, avec une note qui explique pourquoi.")])))

    # ================================================================ PILOTAGE IA
    P['pilotage-ia'] = ("Pilotage IA · Growthity", "Le résumé de vos campagnes Meta en clair, et trois actions concrètes : booster, tester, couper. Budget ajusté sur Meta en un clic.", stack(
        b.hero_center('pilotage-ia', ('Produit', 'Pilotage IA'), 'Plus besoin de media buyer.', 'Growthity vous dit quoi faire.',
                      "Chaque période, Growthity résume vos campagnes en une phrase et vous propose jusqu'à trois actions : booster, tester ou couper. Calculé sur vos vrais chiffres Meta, appliqué après votre confirmation.",
                      demo='<div style="max-width:880px;margin:0 auto">%s</div>' % M.mb_summary()),
        sec(stack(head('Les règles', 'Pas de boîte noire :', 'des règles claires.', "Chaque campagne est classée selon des seuils simples, calculés sur vos chiffres Meta. Vous savez toujours pourquoi."),
                  M.analysis_cards()), cls='tint'),
        sec(stack(head('Performance', 'Tous vos chiffres,', 'sans jargon.',
                       "Sept indicateurs avec leur évolution, la courbe jour par jour, vos campagnes triables et vos groupes de campagnes partagés avec l'équipe. Chaque terme a son explication en survol."),
                  M.perf_page())),
        sec(split(copy('Dans le chat', 'Posez la question.', 'Le chat lit vos résultats.',
                       "Joignez une campagne Meta à la conversation et demandez ce que vous voulez : un récap, les leads, une modification de pub, une mise en pause. Les réponses arrivent avec un tableau adapté à l'objectif.",
                       ['Leads : dépense, nombre de leads, coût par lead', 'Ventes : ventes, coût par vente, CA généré, retour sur pub', 'Cochez des campagnes : Voir les leads, Récap détaillé']),
                  b.block('perf-stage').replace('<div class="stage rv">', '').rsplit('</div>', 1)[0]), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que suit', 'le pilotage.'), b.specs([
            ('chart', 'cyan', '7 indicateurs', ['Dépense, Nombre d\'affichages, Clics', 'Personnes touchées, Taux de clic, Coût par clic', 'Leads ou résultats, et coût par résultat', 'Variation vs période précédente']),
            ('trend', 'green', 'Recommandations', ['À booster, À tester, À couper, À laisser tourner', 'Budget modifié sur Meta après confirmation (min. 1 €)', '« Créer une nouvelle pub » ouvre le chat sur la campagne', 'Bouton « Actualiser l\'analyse »']),
            ('users', 'indigo', 'Plusieurs comptes', ['Filtre par compte publicitaire', 'Actives uniquement ou toutes les campagnes', 'Groupes nommés, partagés dans l\'espace', 'Vue en cartes sur mobile'])]))),
        tail(['leads-ventes', 'publication-meta', 'espion-meta-ads'], [
            ("Les actions sont-elles appliquées automatiquement ?", "Non. Growthity propose, vous confirmez. L'augmentation de budget est alors appliquée directement sur Meta ; couper ou tester vous emmène au bon endroit."),
            ("Sur quoi se basent les recommandations ?", "Sur les chiffres réels de vos campagnes Meta (dépense, résultats, coût par résultat, taux de clic, affichages), avec des règles fixes et transparentes.")])))

    # ================================================================ PUBLICATION META
    P['publication-meta'] = ("Publication Meta Ads · Growthity", "Publiez sur Facebook et Instagram en 5 étapes : objectif, créations, audience par pays et département, textes, publication. Pubs modifiables en ligne.", stack(
        b.hero_center('publication-meta', ('Produit', 'Publication Meta'), 'De la créa à la campagne,', 'en 5 étapes.',
                      "Objectif, créations, audience, textes, publication : l'assistant vous guide écran par écran, rédige les textes, et crée la campagne sur votre compte Meta. 0 % de commission sur votre budget.",
                      demo=M.wizard()),
        b.nums([('3', 'objectifs : Leads, Trafic, Ventes'), ('13 pays', 'et tous les départements français, à inclure ou exclure'), ('10', 'boutons d\'action, de « En savoir plus » à « Demander un devis »'), ('1 €', 'de budget minimum par jour')]),
        sec(split(copy('La publication', 'Une dernière fenêtre,', 'et c\'est en ligne.',
                       "Choisissez la Page Facebook, le formulaire de lead ou le Pixel selon l'objectif, et décidez d'activer tout de suite ou de garder la campagne en pause. Une date de début future programme la diffusion.",
                       ['Email de confirmation, ou motif précis en cas de refus', 'Campagne partielle supprimée sur Meta en cas d\'échec', 'La créa garde la trace : « Publiée sur Meta le … »']),
                  M.publish_dialog(), flip=True), cls='tint'),
        sec(stack(head('Mes publicités', 'Tout votre compte Meta,', 'en clair.',
                       "Brouillons, pubs en ligne et hors ligne, par campagne, ensemble ou publicité. Les campagnes créées directement dans le Gestionnaire de publicités sont là aussi."),
                  M.campaigns_list())),
        sec(split(copy('Modifier en ligne', 'Changez une pub', 'sans tout refaire.',
                       "Pause, activation, renommage, budget des ensembles, et pour chaque pub : titre, texte, bouton, URL, audience et même la créa. Manuellement ou en le demandant au chat.",
                       ['Seuls les champs modifiés sont envoyés à Meta', 'Email récapitulatif à chaque modification', '« Voir sur Meta » ouvre la campagne dans le Gestionnaire']),
                  M.edit_ad()), cls='tint'),
        sec(stack(head('Tout le détail', 'Les réglages', 'disponibles.'), b.specs([
            ('target', 'indigo', 'Objectif et créations', ['Leads (formulaire instantané), Trafic, Ventes (Pixel requis)', 'Image, vidéo ou carrousel de 2 à 10 images', 'Filtre par dossier et par type', 'Textes rédigés par l\'IA, « Régénérer texte IA »']),
            ('pin', 'orange', 'Audience', ['13 pays : France, Belgique, Suisse, Canada, Luxembourg, Maroc…', 'Départements à inclure ou à exclure', 'Tranche d\'âge et genre', 'Audiences enregistrées de votre compte Meta, depuis le chat']),
            ('euro', 'green', 'Budget et diffusion', ['Budget quotidien ou total, dès 1 € par jour', 'Date de début, date de fin facultative', 'Fuseau de l\'audience (DOM compris)', 'Placements automatiques ou manuels'])]))),
        tail(['pilotage-ia', 'leads-ventes', 'espion-meta-ads'], [
            ("Growthity prend-il une commission ?", "Non, 0 %. Votre budget est facturé par Meta sur votre propre compte publicitaire."),
            ("Puis-je gérer plusieurs comptes publicitaires ?", "Oui. Vous cochez les comptes actifs à la connexion et choisissez celui par défaut pour publier depuis le chat. Growthity vous prévient 14 jours avant l'expiration de la connexion Meta."),
            ("Le formulaire de leads doit-il exister avant ?", "Vous pouvez en choisir un existant sur votre Page, ou demander au chat d'en créer un avec vos questions de qualification.")])))

    # ================================================================ ESPION META ADS
    P['espion-meta-ads'] = ("Espion Meta Ads · Growthity", "Demandez au chat une marque, un produit ou un marché : Growthity parcourt la Meta Ads Library, classe les pubs par signal et s'en inspire pour vous.", stack(
        b.hero_center('espion-meta-ads', ('Nouveau', 'Espion Meta Ads'), 'Growthity fouille', 'la Meta Ads Library.',
                      "Demandez au chat ce que fait la concurrence. Il parcourt la bibliothèque publicitaire Meta, garde jusqu'à 30 pubs variées, les classe par signal, puis vous propose une stratégie à partir des gagnantes.",
                      demo=M.spy_card()),
        sec(stack(head('Le signal', 'Fort, prometteur,', 'à surveiller.', "Meta ne publie ni dépenses ni ventes. Growthity s'appuie sur la durée de diffusion et la portée européenne, et vous dit toujours pourquoi."),
                  M.signal_rules()), cls='night'),
        sec(stack(head('Comment ça marche', 'De la veille', 'à votre pub.'),
                  b.steps([('Demandez au chat', "« Que font les marques de sérum vitamine C ? » Jusqu'à 5 recherches, 21 pays européens, environ 2 minutes."),
                           ('Choisissez vos références', "Filtrez par statut, plateforme, type de média ou annonceur. Triez par durée, nouveauté ou portée UE. Ajoutez vos références."),
                           ('Recevez la stratégie', "« Me proposer une stratégie » s'appuie sur 3 gagnants probables au maximum, un par annonceur. Ou demandez de vous différencier.")]))),
        sec(split(copy('Batch Studio', 'La veille marché,', 'intégrée à vos lots.',
                       "Chaque lot du Batch Studio analyse aussi le marché : pubs concurrentes, pubs actives de la marque, et tendances (accroches, offres, CTA, codes visuels, formats) qui nourrissent le plan.",
                       ['« Marché : N pubs concurrentes analysées »', '« La marque : N pubs Meta actives »', '« Ce qui marche chez tes concurrents » dans le plan'], more=('Découvrir le Batch Studio', 'studio-en-lot.html')),
                  M.inspi_detail(), flip=True), cls='tint'),
        sec(stack(head('Tout le détail', 'Chaque pub,', 'analysée.'), b.specs([
            ('eye', 'slate', 'Sur chaque carte', ['Signal, statut actif ou inactif, date de début', 'Visuel image ou vidéo, agrandissable', '« Active depuis N j » ou « Diffusée N j · arrêtée »', 'Lien vers la bibliothèque officielle']),
            ('search', 'blue', 'L\'analyse', ['Diffusion, période, portée UE', 'Plateformes : Facebook, Instagram, Messenger, Audience Network', 'Accroche, titre, description, destination', '« Pourquoi ce signal »']),
            ('chat', 'indigo', 'Les statistiques', ['Pubs retenues, annonceurs, encore actives', 'Durée médiane de diffusion', '2 pubs maximum par annonceur', 'Références gardées dans toute la conversation'])]))),
        tail(['galerie-inspiration', 'chat-ia', 'studio-en-lot'], [
            ("D'où viennent les pubs ?", "De la Meta Ads Library, la bibliothèque publique des pubs diffusées sur Facebook, Instagram, Messenger et Audience Network en Europe."),
            ("Un signal « fort » veut-il dire que la pub est rentable ?", "Non, c'est le meilleur indice public : une pub qui tourne depuis longtemps, ou qui touche beaucoup de monde, a de bonnes chances de fonctionner. Growthity l'indique clairement."),
            ("Est-ce que ça copie les pubs des concurrents ?", "Non. Les pubs servent de références : le chat en retient le principe et crée une pub originale pour votre produit, ou au contraire une approche pour vous différencier.")])))

    # ================================================================ ÉDITEUR VIDÉO
    P['editeur-video'] = ("Éditeur vidéo · Growthity", "Un vrai éditeur multipiste dans le navigateur : 21 titres animés, 14 styles de sous-titres, 28 transitions, voix off IA, export 1080p sans crédits.", stack(
        b.hero_center('editeur-video', ('Produit', 'Éditeur vidéo'), 'Un vrai éditeur,', 'pensé pour la pub.',
                      "Timeline multipiste, titres animés, sous-titres IA, transitions, effets, voix off : montez et retouchez vos vidéos dans le navigateur, puis exportez en 1080p sans consommer de crédits.",
                      demo=M.editor_ui()),
        b.nums([('21', 'titres animés, mot par mot'), ('14', 'styles de sous-titres'), ('28', 'transitions'), ('30', 'effets cumulables'),
                ('28', 'filtres colorimétriques'), ('30', 'animations d\'entrée, de sortie, en boucle'), ('28', 'voix off IA'), ('0', 'crédit pour exporter')]),
        sec(stack(head('Outils rapides', 'Pas le temps d\'ouvrir l\'éditeur ?', 'Tout se fait sur la créa.',
                       "Depuis le chat ou Mes créations, ces outils travaillent directement sur la vidéo et conservent l'originale."), M.quick_tools()), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que contient', 'l\'éditeur.'), b.specs([
            ('film', 'orange', 'Montage', ['Pistes Vidéo, Texte, Audio et calques illimités', 'Découper à la tête de lecture, dupliquer, supprimer sans trou', 'Annuler / rétablir sur 80 étapes, 13 raccourcis', 'Projets jusqu\'à 4 minutes, enregistrés automatiquement']),
            ('text', 'indigo', 'Texte et sous-titres', ['9 polices, taille, épaisseur, contour, ombre, accent', '« Générer avec l\'IA » : sous-titres horodatés au mot', 'Import SRT ou saisie manuelle', 'Appliquer un style à tous les textes d\'un coup']),
            ('image', 'pink', 'Médias', ['Vos vidéos, images et audios, réutilisables', 'Mes assets : créations, produits, avatars, exports', 'Banque Pexels (images, vidéos) et GIPHY (GIFs, stickers)', 'Fond vert, recadrage, zoom de 10 à 600 %']),
            ('mic', 'blue', 'Audio', ['Voix off IA : 28 voix, ton naturel ou expressif', 'Enregistrez votre voix, bruit et écho réduits', 'Volume, fondus d\'entrée et de sortie', 'Vitesse de 0,5× à 2×, audio détachable']),
            ('play', 'green', 'Export', ['1080×1920, 1920×1080 ou 1080×1080', '30 images/s, MP4 ou WebM', 'Télécharger ou exporter dans Mes créations', 'Une nouvelle version, l\'originale reste intacte']),
            ('users', 'slate', 'En équipe', ['Projets d\'un collègue en lecture seule', '« Dupliquer dans mes projets »', 'Corbeille : projets conservés 30 jours', 'Fonctionne sur ordinateur'])]))),
        tail(['formats', 'acteurs-ugc', 'chat-ia'], [
            ("Faut-il savoir monter ?", "Non. Les titres animés et les styles de sous-titres sont prêts à l'emploi, et les outils rapides (rogner, recadrer, sous-titrer, continuer) se lancent en un clic depuis la créa."),
            ("L'export consomme-t-il des crédits ?", "Non. L'export se fait dans votre navigateur, en 1080p à 30 images par seconde. Seules les fonctions IA (voix off, sous-titres IA) utilisent des crédits."),
            ("Les sous-titres sont-ils disponibles en plusieurs langues ?", "Dans l'éditeur, la transcription IA est en français. L'outil rapide « Ajouter des sous-titres » transcrit en français, anglais, espagnol, italien, allemand et portugais.")])))

    # ================================================================ STUDIO EN LOT
    P['studio-en-lot'] = ("Batch Studio · Growthity", "Collez un lien : Growthity lit votre site, rédige le brief, propose 8 angles et produit jusqu'à 40 pubs testables en 4:5, 1:1 et 9:16.", stack(
        b.hero_center('studio-en-lot', ('Produit', 'Batch Studio'), 'Colle un lien.', 'Reçois jusqu\'à 40 pubs testables.',
                      "Growthity lit votre site, analyse le marché, rédige un brief de marque, propose 8 angles répartis sur 3 territoires créatifs, puis produit et met en page tout le lot, prêt à publier par angle.",
                      demo=M.batch_flow()),
        b.nums([('3', 'sources : un lien, un produit du catalogue ou une description'), ('8', 'angles sur 3 territoires créatifs'), ('40', 'pubs maximum par lot'), ('5', 'gabarits de mise en page')]),
        sec(stack(head('Comment ça marche', 'Quatre étapes,', 'toutes modifiables.'),
                  b.steps([('Source', "Lecture du site, extraction des arguments, détection de l'activité, veille marché, brief en 7 sections et jusqu'à 12 images produit retenues."),
                           ('Plan', "8 angles avec accroche, sous-titre, bouton et 3 scènes visuelles. Cochez, modifiez, régénérez."),
                           ('Aperçus puis Grille', "Une image par angle à garder, relancer ou jeter, puis la déclinaison en formats et la mise en page du lot.")]))),
        sec(split(copy('Décliner en formats', 'Un angle,', 'tous les formats.',
                       "Choisissez les formats et le nombre de variantes : Growthity calcule les images à réutiliser, celles à créer et le nombre de pubs, avant de lancer.",
                       ['Formats 4:5, 1:1 et 9:16', 'Variantes v1 à v3 par angle', 'Gabarits : Accroche géante, 3 bénéfices, Prix / offre, Avis client, Question + CTA']),
                  M.decline_dialog(), flip=True), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que fait', 'le Batch Studio.'), b.specs([
            ('book', 'indigo', 'Le brief', ['ADN de marque, identité visuelle, ton de voix', 'Les produits vus, le client, le marché', '3 territoires créatifs, dont un « contrarian »', 'Lisible, modifiable, régénérable']),
            ('text', 'orange', 'Les arguments', ['8 à 20 arguments tirés du site', 'Bénéfice, Preuve, Offre, Objection, Caractéristique, Cible', 'Origine affichée : Site, Vous ou Idée', 'Idées créatives : accroche, métaphore, jeu de mots…']),
            ('folder', 'green', 'La mémoire', ['Un dossier par marque', '« Déjà couvert » : produits, angles et scènes déjà utilisés', 'Chaque nouveau lot part sur du neuf', 'Télécharger en zip ou publier sur Meta par angle'])]))),
        tail(['formats', 'espion-meta-ads', 'publication-meta'], [
            ("Mon site doit-il être une boutique ?", "Non. Le Batch Studio fonctionne avec un lien (boutique, site vitrine, page de service), un produit de votre catalogue ou une simple description."),
            ("Puis-je modifier ce que l'IA a compris ?", "Oui, à chaque étape : catégorie, ton, brief, arguments, images retenues, angles, accroches, scènes et textes des pubs."),
            ("Combien de temps faut-il ?", "L'analyse prend environ 45 secondes, le brief 1 à 3 minutes, et chaque aperçu 30 secondes à 1 minute.")])))

    # ================================================================ CHAT IA
    P['chat-ia'] = ("Chat créatif IA · Growthity", "Décrivez votre idée ou collez un lien : le chat propose une stratégie, des accroches, l'acteur, génère vidéos, images et carrousels, puis publie sur Meta.", stack(
        b.hero_center('chat-ia', ('Produit', 'Chat créatif IA'), 'Votre agence créative,', 'dans un chat.',
                      "Décrivez votre idée, collez un lien produit ou déposez une vidéo. Le chat propose une stratégie, écrit les accroches, choisit l'acteur, génère la vidéo, l'image ou le carrousel, puis lance la campagne sur Meta.",
                      demo=b.block('chat-demo')),
        b.MODELS,
        sec(split(copy('Pour commencer', 'Quatre façons', 'de démarrer.',
                       "Créer une pub, partir d'une URL, analyser vos pubs ou relancer les visiteurs de votre site. Ajoutez une image, une vidéo, un produit, un acteur ou une campagne Meta à la conversation.",
                       ['Images JPG, PNG, WebP jusqu\'à 12 Mo, vidéos MP4, MOV, WebM', 'Le chat regarde vos vidéos et écoute vos audios', 'Dictée vocale']),
                  M.chat_home()), cls='tint'),
        sec(stack(head('Avant de générer', 'D\'abord la stratégie,', 'ensuite le prompt.', "Vous validez l'angle et les accroches, puis vous relisez le prompt avant de dépenser le moindre crédit."),
                  '<div class="duo">%s%s</div>' % (M.strategy_card(), M.prompt_card()))),
        sec(split(copy('Après la génération', 'Une créa,', 'et tout ce qui suit.',
                       "Variation, déclinaison en 1:1, image ou carrousel, sous-titres, recadrage, suite de 8 secondes : chaque action crée une nouvelle version, l'originale reste.",
                       ['Vidéos de 3 à 15 s, jusqu\'à 32 s en segments enchaînés', 'Même acteur, même décor, même voix d\'un segment à l\'autre', '« Changer la voix » parmi 21 voix françaises']),
                  M.after_card(), flip=True), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que le chat', 'sait faire.'), b.specs([
            ('play', 'pink', 'Ce qu\'il produit', ['Vidéo : UGC face caméra, produit avec voix off, motion design, cinématique, animation d\'image', 'Image : retouche en une phrase, Upscale HD', 'Carrousel', '9:16 par défaut, 1:1, 4:5 ou 16:9 sur demande']),
            ('chat', 'indigo', 'La conversation', ['Historique, recherche, favoris et dossiers', 'Modifier un message et reprendre à cet endroit', 'Résumé automatique des longues conversations', 'Mémoire des angles et accroches validés par marque']),
            ('chart', 'green', 'Au-delà de la créa', ['Ce que fait la concurrence (Meta Ads Library)', 'Analyse de vos campagnes, leads et ventes', 'Formulaires de leads créés sur Meta', 'Publication et modification de pubs Meta'])]))),
        tail(['acteurs-ugc', 'formats', 'publication-meta'], [
            ("Faut-il savoir rédiger un brief ?", "Non. Écrivez comme à un collègue. Le chat pose une question à la fois (la durée, puis l'acteur) et vous propose une stratégie à valider."),
            ("Puis-je choisir le modèle d'IA ?", "Le choix est automatique, selon ce que vous demandez. Chaque création indique l'IA utilisée dans « Détails & voix »."),
            ("Combien coûte une génération ?", "Le coût en crédits est affiché avant de lancer : par exemple ⚡300 pour une vidéo standard de 8 secondes, ⚡15 pour une image.")])))

    # ================================================================ ACTEURS UGC
    actors = [('lena-serum', 'Léna', 'f selfie'), ('real-14', 'Inès', 'f selfie'), ('ugc-homme', 'Marc', 'h maison'), ('real-42', 'Camille', 'f selfie'),
              ('ugc-scierie', 'Sofia', 'f exterieur'), ('actor-thomas', 'Thomas', 'h studio'), ('ugc-femme', 'Léa', 'f maison'), ('real-40', 'Emma', 'f maison'),
              ('real-12', 'Hugo', 'h exterieur'), ('ugc-pac-awa', 'Awa', 'f exterieur'), ('actor-claire', 'Claire', 'f studio'), ('real-05', 'Clara', 'f maison'),
              ('ugc-solaire', 'Sarah', 'f selfie'), ('actor-zoe', 'Zoé', 'f selfie'), ('real-19', 'Julie', 'f maison'), ('real-06', 'Chloé', 'f exterieur'), ('real-04', 'Nina', 'f maison')]
    pv = {'selfie': 'Selfie / main levée', 'studio': 'Studio / bureau', 'maison': 'À la maison', 'exterieur': 'Extérieur'}
    gal = ('<div class="win am rv"><div class="win-bar"><i></i><i></i><i></i><span>Galerie d\'acteurs · acteurs Growthity + les tiens</span></div><div class="am-in">'
           '<div class="am-top"><div class="am-tabs"><span class="on">Tous</span><span>Growthity</span><span>Les miens</span></div><div class="am-acts"><span class="am-sel">Âge</span><span class="am-sel">Couleur de peau</span><span class="am-sel">Univers</span><span class="am-btn">★ Mes favoris</span></div></div>'
           '<div class="afil" id="afil" style="margin:12px 0">' + ''.join('<button type="button" data-k="%s"%s>%s</button>' % (k, ' class="on"' if k == 'all' else '', l) for k, l in
           [('all', 'Tous'), ('f', 'Femme'), ('h', 'Homme'), ('selfie', 'Selfie / main levée'), ('studio', 'Studio / bureau'), ('maison', 'À la maison'), ('exterieur', 'Extérieur')]) + '</div>'
           '<div class="agal" id="agal">' + ''.join(
               '<div class="atile" data-k="%s"><video data-src="media/%s.mp4" poster="media/%s.poster.webp" muted loop playsinline preload="none" aria-label="Acteur UGC IA %s"></video><span>%s<small>%s</small></span></div>'
               % (k, m, m, n, n, pv[k.split()[1]]) for m, n, k in actors) + '</div></div></div>')
    P['acteurs-ugc'] = ("500+ acteurs UGC IA · Growthity", "Des centaines d'acteurs UGC IA filtrables par genre, âge, couleur de peau, univers et prise de vue. Ou créez le vôtre depuis une photo.", stack(
        b.hero_center('acteurs-ugc', ('Produit', 'Galerie d\'acteurs'), 'Des acteurs qui font', 'vrais clients.',
                      "Plus de 500 acteurs UGC IA, filtrables par genre, âge, couleur de peau, univers et prise de vue. Choisissez-en un, il ouvre un nouveau chat avec lui. Ou créez le vôtre depuis une photo.",
                      demo=gal),
        b.nums([('15', 'univers : Beauté, Mode, Fitness, Tech & SaaS, Business B2B…'), ('4', 'prises de vue : selfie, studio, maison, extérieur'), ('21', 'voix françaises à écouter et changer'), ('10', 'acteurs personnels par compte')]),
        sec(split(copy('Votre acteur', 'Votre visage,', 'depuis une photo.',
                       "Importez une photo ou décrivez la personne. L'IA rédige une fiche du personnage (visage, cheveux, corps, tenue) que vous ajustez, puis génère l'acteur en une vingtaine de secondes.",
                       ['Photo JPG ou PNG jusqu\'à 8 Mo, ou une description', 'Fiche du personnage modifiable avant génération', 'Réutilisable dans toutes vos vidéos']),
                  M.actor_create(), flip=True), cls='tint'),
        sec(split(copy('La voix', 'La bonne voix,', 'à l\'écoute.',
                       "Sur n'importe quelle vidéo, « Changer la voix » propose 21 voix françaises, chacune avec sa description et un extrait à écouter. La vidéo est régénérée avec la nouvelle voix.",
                       ['10 voix féminines, 11 masculines', 'Écoute avant de choisir', 'Aussi depuis Mes créations']),
                  M.voices())),
        sec(stack(head('Tout le détail', 'Trouvez le bon visage', 'en quelques clics.'), b.specs([
            ('users', 'pink', 'Filtres', ['Genre : Femme, Homme, Autre', 'Âge : 18-24, 25-34, 35-44, 45 ans et +', 'Couleur de peau : Claire, Moyenne, Mate, Foncée', 'Origine : Growthity ou les miens']),
            ('layers', 'indigo', '15 univers', ['Beauté, Mode, Fitness, Bien-être', 'Tech & SaaS, Business B2B, E-commerce', 'Food & Cuisine, Maison & Déco, Famille', 'Gaming, Automobile, Voyage & Outdoor, Gen Z, Créatif & Artisan']),
            ('play', 'green', 'Dans le chat', ['Aperçu vidéo au survol, favoris', '« Utiliser cet acteur » ouvre un nouveau chat', '« Nouvelle pub avec … » et « Variation même acteur »', 'Le chat propose 3 profils adaptés à votre cible'])])), cls='tint'),
        tail(['chat-ia', 'formats', 'editeur-video'], [
            ("Les acteurs sont-ils de vraies personnes ?", "Ce sont des acteurs générés par IA, conçus pour être réalistes. Vous pouvez aussi créer un acteur à partir de votre propre photo."),
            ("Combien coûte un acteur personnel ?", "100 crédits par acteur, généré en une vingtaine de secondes. Vous pouvez en avoir jusqu'à 10."),
            ("Puis-je garder le même acteur sur plusieurs vidéos ?", "Oui. « Variation même acteur » et « Nouvelle pub avec … » réutilisent le même visage, et les vidéos longues gardent le même acteur, le même décor et la même voix.")])))

    # ================================================================ FORMATS
    P['formats'] = ("Vidéos, visuels & carrousels · Growthity", "Vidéos UGC, images et carrousels générés par l'IA, en 9:16, 1:1, 4:5 ou 16:9, déclinables en un clic et retouchables en une phrase.", stack(
        b.hero_split('formats', ('Produit', 'Tous les formats'), 'Vidéo, image, carrousel.', 'Et chaque déclinaison.',
                     "Le chat produit des vidéos dans cinq styles, des images et des carrousels. Chaque créa se décline ensuite en un clic : autre format, image, carrousel ou variation.",
                     ['9:16 par défaut, 1:1, 4:5 ou 16:9 sur demande', 'Vidéos de 3 à 15 s, jusqu\'à 32 s enchaînées', 'Retouche d\'image en une phrase, Upscale HD'], b.block('fmt-stage')),
        b.nums([('5', 'styles de vidéo'), ('4', 'formats : 9:16, 1:1, 4:5, 16:9'), ('2 à 10', 'images par carrousel'), ('32 s', 'en 4 segments de 8 s enchaînés')]),
        sec(split(copy('Les déclinaisons', 'Une créa,', 'dix usages.',
                       "Sous chaque création : « Et ensuite ? » propose la suite logique, et le menu de la créa donne accès à toutes les déclinaisons.",
                       ['Vidéo : Décliner en 1:1, Créer une image', 'Image : Créer une vidéo, Décliner en carrousel (3 slides)', 'Carrousel : Créer une vidéo', 'Générer une variation']),
                  M.after_card(), flip=True), cls='tint'),
        sec(stack(head('Les styles', 'Le bon style', 'pour chaque message.'), b.features([
            ('user', 'pink', 'UGC face caméra', "Un acteur parle à la caméra et tient votre produit, comme une vraie cliente."),
            ('mic', 'blue', 'Produit avec voix off', "Votre produit à l'image, une voix qui explique."),
            ('spark', 'indigo', 'Motion design', "Texte animé et formes pour une offre, un chiffre, un lancement."),
            ('film', 'orange', 'Cinématique', "Plans soignés et lumière travaillée, en Standard ⚡300 ou Cinématique premium ⚡1334."),
            ('image', 'green', 'Animation d\'image', "Une photo produit qui prend vie en quelques secondes."),
            ('copy', 'slate', 'Carrousel', "De 2 à 10 images, assemblées depuis vos créations ou générées d'un coup.")], md=['lena-serum', 'real-05']))),
        tail(['editeur-video', 'creations-catalogue', 'studio-en-lot'], [
            ("Quels ratios sont disponibles ?", "9:16 par défaut, et 1:1, 4:5 ou 16:9 dès que vous le demandez (« carré », « feed », « paysage »). Une vidéo existante se recadre aussi en 9:16, 16:9, 1:1 ou 4:5."),
            ("Puis-je utiliser mes propres images ?", "Oui : importez-les dans le chat ou dans Mes créations, ou rangez-les dans votre catalogue produit pour les réutiliser.")])))

    # ================================================================ MES CRÉATIONS & CATALOGUE
    P['creations-catalogue'] = ("Mes créations & catalogue · Growthity", "Toutes vos pubs au même endroit : dossiers, versions, sélection multiple, carrousels, publication en lot. Et vos produits en catalogue ou depuis Shopify.", stack(
        b.hero_center('creations-catalogue', ('Produit', 'Mes créations'), 'Toutes vos pubs,', 'rangées et prêtes.',
                      "Retrouvez, organisez et publiez vos créations : filtres par type et par source, dossiers, versions, sélection multiple. Vos produits sont rangés dans un catalogue, ou viennent directement de Shopify.",
                      demo=M.creations_page()),
        sec(split(copy('Catalogue produit', 'Vos produits,', 'prêts pour le chat.',
                       "Un produit, c'est un dossier d'images réutilisables dans vos pubs. Connectez Shopify pour retrouver vos produits dans le chat, sans rien importer.",
                       ['Nom, description et URL produit', 'Jusqu\'à 10 images ajoutées à la fois', 'Shopify : connexion en un clic, devise affichée']),
                  M.catalog(), flip=True), cls='tint'),
        sec(stack(head('Tout le détail', 'Ce que vous pouvez faire', 'avec vos créas.'), b.specs([
            ('search', 'blue', 'Retrouver', ['Recherche par nom ou description', 'Images, Vidéos, Carrousels', 'Générées ou importées', 'Tri récent, ancien ou par statut']),
            ('folder', 'orange', 'Organiser', ['Dossiers, « Sans dossier »', 'Lots du Batch Studio regroupés par marque', 'Renommer, dupliquer, déplacer', 'Versions : Sous-titrée, Recadrée, Rognée, +8 s…']),
            ('send', 'meta', 'Utiliser', ['Créer un carrousel de 2 à 10 images', 'Assembler 2 vidéos', 'Publier en lot sur Meta', 'Ouvrir l\'éditeur, changer la voix, télécharger'])]))),
        tail(['formats', 'editeur-video', 'publication-meta'], [
            ("Puis-je importer des pubs faites ailleurs ?", "Oui : le bouton « Importer » accepte vos images et vos vidéos, qui peuvent ensuite être retouchées, déclinées et publiées."),
            ("Que se passe-t-il si une génération échoue ?", "La carte l'indique, affiche le prompt utilisé et propose « Modifier dans le chat » ou « Réessayer ».")])))

    # ================================================================ INSPIRATION (Ressources)
    P['galerie-inspiration'] = ("Galerie d'inspiration · Growthity", "Des pubs qui performent, triées par concept, secteur, style, objectif et format. Choisissez-en une : Growthity la recrée pour votre produit.", stack(
        b.hero_center('galerie-inspiration', ('Ressources', 'Galerie d\'galerie-inspiration'), 'Choisissez une pub.', 'On la recrée pour votre produit.',
                      "Des pubs qui performent, repérées chaque jour et validées par l'équipe. Filtrez par concept, secteur, style, objectif et format, puis « Recréer pour mon produit ».",
                      demo=M.inspi_gallery()),
        b.nums([('20', 'secteurs, e-commerce et services locaux'), ('21', 'concepts tendance, images et vidéos'), ('30 j', 'de diffusion minimum pour entrer dans la galerie'), ('1 clic', 'pour la recréer avec votre produit')]),
        sec(split(copy('Le détail', 'Pourquoi elle marche,', 'en clair.',
                       "Chaque pub montre sa période de diffusion, ses copies actives, sa portée européenne, la répartition par âge et par genre, et un encadré « Pourquoi ça marche ».",
                       ['Badge « Gagnante » et « Diffusée depuis N jours »', 'Sauvegarder dans vos favoris', 'Lien vers la Meta Ads Library']),
                  M.inspi_detail(), flip=True), cls='tint'),
        tail(['espion-meta-ads', 'chat-ia', 'guide-pub-ugc'], [])))
    return P
