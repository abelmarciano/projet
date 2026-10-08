"""Faithful mock-ups of real Growthity screens, built from the app's own labels (see scratchpad facts).

Each function returns static HTML; site.js animates the ones that carry an id.
"""

SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.6-4.6"/></svg>'
SYNC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/></svg>'
DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/></svg>'
TAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8Z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>'
FB = '<svg viewBox="0 0 24 24" fill="#0866FF"><path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 12 2Z"/></svg>'
IG = '<svg viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'
MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'

# Lead statuses exactly as in the app (default ones + automatic "Non qualifié")
ST = {'Nouveau': '#3b82f6', 'Contacté': '#f59e0b', 'Qualifié': '#8b5cf6', 'Converti': '#22c55e', 'Perdu': '#ef4444', 'Non qualifié': '#ef4444'}


def st(name, extra=''):
    return '<span class="st%s" style="--c:%s">%s</span>' % (extra, ST[name], name)


def crm():
    """Leads page (Résultats > Leads): header actions, filters, status counters, grouped list."""
    rows = [
        ('Aujourd\'hui', [
            ('JM', 'Julie Martin', 'julie.martin@… · 06 12 •• •• 41', 'real-12', 'Carport solaire · Gironde', 'UGC Hugo · Simulation gratuite', FB, 'Nouveau', '10:42'),
            ('TR', 'Thomas Roux', 'thomas.roux@… · 07 81 •• •• 09', 'ugc-pac-awa', 'Pompe à chaleur · Bordeaux', 'UGC Awa · Devis PAC', IG, 'Contacté', '09:15'),
        ]),
        ('Hier', [
            ('NB', 'Nadia Bensaïd', 'nadia.b@… · 06 44 •• •• 73', 'real-12', 'Carport solaire · Gironde', 'UGC Hugo · Simulation gratuite', IG, 'Qualifié', '18:20'),
            ('LP', 'Lucas Petit', 'lucas.petit@… · 06 22 •• •• 67', 'real-06', 'Carport solaire · Gironde', 'Témoignage Chloé · Simulation gratuite', FB, 'Converti', '14:05'),
            ('SG', 'Sophie Garnier', 'sophie.g@… · 07 55 •• •• 18', 'ugc-pac-awa', 'Pompe à chaleur · Bordeaux', 'UGC Awa · Devis PAC', FB, 'Non qualifié', '11:30'),
        ]),
    ]
    counts = [('Nouveau', 12), ('Contacté', 8), ('Qualifié', 5), ('Converti', 3), ('Perdu', 2), ('Non qualifié', 4)]

    def row(r, cls=''):
        ini, name, coord, th, camp, ad, plat, status, when = r
        return ('<div class="cr-row%s"><div class="cr-c"><span class="av">%s</span><div><b>%s</b><small>%s</small></div></div>'
                '<div class="cr-camp"><span class="th"><img src="media/%s.poster.webp" alt=""></span><div><b>%s <em class="gb">Growthity</em></b><small>%s</small></div></div>'
                '<div class="cr-pl">%s</div><div class="cr-st">%s</div><div class="cr-t">%s</div>'
                '<div class="cr-q"><i title="Appeler">%s</i><i title="Envoyer un email">%s</i></div></div>') % (cls, ini, name, coord, th, camp, ad, plat, st(status), when, PHONE, MAIL)

    groups = ''.join('<div class="cr-g">%s</div>%s' % (g, ''.join(row(r) for r in rs)) for g, rs in rows)
    return '''<div class="win am rv" id="crmdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Résultats</span></div>
  <div class="am-in">
    <div class="am-top"><div><div class="am-tabs"><span class="on">Leads</span><span>Ventes</span></div><small>Contacts générés par tous tes comptes publicitaires Meta actifs.</small></div>
      <div class="am-acts"><span class="am-btn" id="crmsync">%s Synchroniser</span><span class="am-btn">%s Statuts</span><span class="am-btn pri" id="crmexp">%s Exporter CSV</span></div></div>
    <div class="am-fil"><span class="am-in-s">%s Rechercher (nom, email, réponse…)</span><span class="am-sel">Tous les statuts</span><span class="am-sel">Tous les formulaires</span><span class="am-sel hide-s">Depuis le</span><span class="am-sel hide-s">Plus de filtres</span></div>
    <div class="cr-sum"><b><span id="crmn">34</span> leads</b><span>· <span id="crmt">6</span> aujourd'hui · cette semaine : 23</span><div class="cr-cnt">%s</div></div>
    <div class="cr-head"><span>Contact</span><span>Campagne Meta &amp; publicité</span><span></span><span>Statut</span><span>Reçu le</span><span></span></div>
    <div class="cr-list" id="crmlist">%s</div>
    <div class="cr-more">Afficher 50 leads de plus</div>
  </div>
  <div class="am-drop" id="crmdrop">%s</div>
  <div class="toast" id="crmtoast"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span>leads-growthity-2026-10-08.csv</span></div>
  <template id="crmnew">%s</template>
</div>''' % (SYNC, TAG, DL, SEARCH, ''.join('<span class="cr-pill" style="--c:%s"><i></i>%s <b>%d</b></span>' % (ST[n], n, c) for n, c in counts),
             groups, ''.join('<div>%s</div>' % st(n) for n in ['Nouveau', 'Contacté', 'Qualifié', 'Converti', 'Perdu']),
             row(('KB', 'Karim Benali', 'karim.b@… · 06 58 •• •• 30', 'real-12', 'Carport solaire · Gironde', 'UGC Hugo · Simulation gratuite', IG, 'Nouveau', 'à l\'instant'), ' fresh'))


def lead_card():
    """Lead detail window: contact, provenance, form answers, status + internal notes."""
    answers = [('Êtes-vous propriétaire de votre logement ?', 'Oui'), ('Type de logement', 'Maison'),
               ('Votre facture d\'électricité par mois', 'Entre 150 € et 250 €'), ('Code postal', '33700')]
    prov = [('Campagne Meta', 'Carport solaire · Gironde'), ('Publicité Meta', 'UGC Hugo · objection prix'), ('Formulaire', 'Simulation gratuite'),
            ('Plateforme', 'Instagram'), ('Reçu le', 'Aujourd\'hui, 10:42'), ('Campagne Growthity', 'Oui')]
    return '''<div class="win am lcard rv" id="leadcard">
  <div class="win-bar"><i></i><i></i><i></i><span>Fiche lead</span><span class="lc-nav">‹ Lead précédent · Lead suivant ›</span></div>
  <div class="lc-in">
    <div class="lc-who"><span class="av big">JM</span><div><b>Julie Martin</b><small>julie.martin@gmail.com · 06 12 34 56 41</small></div><span class="am-btn">Copier la fiche</span></div>
    <div class="lc-cols">
      <div><h5>Provenance</h5><dl>%s</dl><div class="lc-ad"><img src="media/real-12.poster.webp" alt="Publicité d'origine du lead"><div><b>Je pensais que c'était trop cher…</b><small>Demander un devis</small></div></div></div>
      <div><h5>Réponses au formulaire (4)</h5><dl class="qa">%s</dl>
        <h5>Statut</h5><div class="lc-st" id="lcst">%s<span class="caret">▾</span></div>
        <h5>Notes internes</h5><div class="lc-note"><span id="lcnote"></span><i class="caret-t"></i></div>
        <div class="lc-btns"><span class="am-btn">Fermer</span><span class="am-btn pri" id="lcsave">Enregistrer</span></div></div>
    </div>
  </div>
  <div class="toast" id="lctoast"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Note enregistrée.</div>
</div>''' % (''.join('<dt>%s</dt><dd>%s</dd>' % p for p in prov), ''.join('<dt>%s</dt><dd>%s</dd>' % a for a in answers), st('Nouveau'))


def statuses():
    items = [('Nouveau', 'Par défaut'), ('Contacté', 'Par défaut'), ('Qualifié', 'Par défaut'), ('Converti', 'Par défaut'), ('Perdu', 'Par défaut')]
    return '''<div class="win am stwin rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Statuts des leads</span></div>
  <div class="sw-in">%s
    <div class="sw-row auto">%s<small>Automatique : réponse disqualifiante au formulaire</small></div>
    <div class="sw-row custom"><span class="st" style="--c:#0ea5e9">RDV pris</span><small>Statut personnalisé</small></div>
    <div class="sw-add"><span class="am-in-s">Nouveau statut</span><span class="sw-col"><i style="background:#0ea5e9"></i><i style="background:#14b8a6"></i><i style="background:#f97316"></i><i style="background:#64748b"></i></span><span class="am-btn pri">Ajouter</span></div>
  </div>
</div>''' % (''.join('<div class="sw-row">%s<small>%s</small></div>' % (st(n), b) for n, b in items), st('Non qualifié'))


def lead_form():
    qs = [('Êtes-vous propriétaire de votre logement ?', 'Oui / Non', 'Non = disqualifiante'),
          ('Type de logement', 'Choix unique : Maison · Appartement', ''),
          ('Votre facture d\'électricité par mois', 'Choix unique : 4 tranches', ''),
          ('Nom complet · Email · Téléphone · Code postal', 'Questions standard', '')]
    return '''<div class="win am fwin rv" id="formdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>Formulaire instantané Meta · Simulation gratuite</span></div>
  <div class="fw-in">
    <div class="fw-type"><span class="on">Plus de volume</span><span>Intention plus forte</span></div>
    <div class="fw-qs">%s</div>
    <div class="fw-lead" id="fwlead"><span class="av">SG</span><div><b>Sophie Garnier</b><small>« Êtes-vous propriétaire ? » → Non</small></div>%s</div>
    <div class="fw-note" id="fwnote">Disqualifié automatiquement — Êtes-vous propriétaire de votre logement ? : réponse disqualifiante « Non »</div>
  </div>
</div>''' % (''.join('<div class="fw-q"><b>%s</b><small>%s</small>%s</div>' % (q, t, '<em>%s</em>' % d if d else '') for q, t, d in qs), st('Non qualifié'))


def sales():
    rows = [('Sérum Vitamine C · Ventes', 'Active', '1 240 €', '86', '4 902 €', '3,95 €', '2,8 %'),
            ('Gloss Repulpant · Lancement', 'Active', '690 €', '41', '1 517 €', '2,20 €', '2,1 %'),
            ('Coffret Noël · Retargeting', 'En pause', '310 €', '19', '1 102 €', '3,55 €', '3,4 %')]
    return '''<div class="win am rv">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Résultats</span></div>
  <div class="am-in">
    <div class="am-top"><div><div class="am-tabs"><span>Leads</span><span class="on">Ventes</span></div><small>Commandes et revenus générés par tes campagnes Meta à objectif « ventes / conversions ».</small></div>
      <div class="am-acts"><span class="am-btn">%s Actualiser</span><span class="am-btn pri">%s Exporter CSV</span></div></div>
    <div class="kp4"><div><small>Ventes</small><b>146</b></div><div><small>Revenu généré</small><b>7 521 €</b></div><div><small>Retour sur pub</small><b>3,35 €</b><em>Pour 1 € dépensé</em></div><div><small>Taux de conversion</small><b>2,7 %%</b><em>Sur 100 clics</em></div></div>
    <div class="sl-t"><div class="sl-h"><span>Campagne</span><span>Statut</span><span>Dépense</span><span>Ventes</span><span>Revenu</span><span>Retour sur pub</span><span>Conv.</span></div>%s</div>
  </div>
</div>''' % (SYNC, DL, ''.join('<div class="sl-r"><b>%s</b><span class="chip%s">%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span></div>'
                              % (r[0], ' ok' if r[1] == 'Active' else '', r[1], r[2], r[3], r[4], r[5], r[6]) for r in rows))


def csv_cols():
    cols = ['Date', 'Nom', 'Email', 'Téléphone', 'Statut', 'Campagne Meta', 'Publicité Meta', 'Formulaire', 'Compte publicitaire', 'Créée avec Growthity', 'Plateforme', '+ une colonne par question']
    return '<div class="csvc rv"><div class="csvh">%s leads-growthity-2026-10-08.csv<small>UTF-8 · compatible Excel</small></div><div class="csvg">%s</div></div>' % (
        DL, ''.join('<span>%s</span>' % c for c in cols))


def first_lead_mail():
    return '''<div class="mail rv"><div class="from"><span class="av">G</span><div><b>Growthity</b><br>à vous · 10:42</div></div>
<h4>🎉 Votre premier lead vient d'arriver</h4>
<dl><dt>Contact</dt><dd>Julie Martin</dd><dt>Email</dt><dd>julie.martin@gmail.com</dd><dt>Téléphone</dt><dd>06 12 34 56 41</dd><dt>Campagne</dt><dd>Carport solaire · Gironde</dd></dl>
<p>Rappelez-le rapidement : un contact traité dans l'heure a bien plus de chances de se convertir.</p><span class="am-btn grad">Voir mes leads</span></div>'''


# ------------------------------------------------------------------ chat
def chat_home():
    cards = [('Créer une pub', 'Décris ton idée, je trouve le format et l\'angle'), ('Depuis une URL', 'Colle un lien produit, je génère tout le créatif'),
             ('Analyser mes pubs', 'Voir ce qui performe et ce qui mérite d\'être testé'), ('Retargeting visiteurs', 'Relancer ceux qui ont visité sans acheter')]
    menu = ['Importer une image ou une vidéo', 'Importer depuis mes créations', 'Mes produits', 'Acteurs UGC', 'Prolonger une de mes vidéos', 'Mes campagnes Meta']
    return '''<div class="win am chhome rv">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Chat</span></div>
  <div class="ch-in"><h4>Que veux-tu créer aujourd'hui ?</h4>
    <div class="ch-cards">%s</div>
    <div class="ch-comp"><span class="plus">+</span><span class="ph">Décris ta pub, colle un lien, dépose une vidéo…</span><span class="mic">🎙</span><span class="send">↑</span>
      <div class="ch-menu"><small>Ajouter du contenu</small>%s</div></div>
    <div class="ch-hint">JPG, PNG, WebP · vidéos MP4/MOV/WebM · audio · dictée vocale</div>
  </div></div>''' % (''.join('<div class="ch-card"><b>%s</b><small>%s</small></div>' % c for c in cards), ''.join('<span>%s</span>' % m for m in menu))


def strategy_card():
    rows = [('Objectif', 'Ventes en ligne'), ('Cible', 'Femmes 25-40 ans, peau mixte, routine simple'), ('Douleur', 'Teint terne, imperfections, trop de produits'),
            ('Angle', 'Avant / après vécu, sans discours commercial'), ('Preuve', 'Résultat visible en 3 semaines'),
            ('Objection à lever', '« Encore un sérum qui ne fait rien »'), ('Promesse', 'Une peau nette, une seule étape'), ('Appel à l\'action', 'Acheter')]
    hooks = ['3 semaines, zéro fond de teint.', 'J\'ai arrêté 4 produits pour celui-là.', 'Ma peau avant / après, sans filtre.']
    return '''<div class="win am strat rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Stratégie créative</span><span class="chip pri" style="margin-left:auto">Proposition</span></div>
  <div class="sc-in"><dl>%s</dl><h5>Accroches</h5><ol>%s</ol>
  <div class="sc-btns"><span class="am-btn grad">Valider la stratégie</span><span class="am-btn">Autre angle</span><span class="am-btn">Autres accroches</span></div></div></div>''' % (
        ''.join('<dt>%s</dt><dd>%s</dd>' % r for r in rows), ''.join('<li>%s</li>' % h for h in hooks))


def prompt_card():
    return '''<div class="win am pcard rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Aperçu du prompt · Vidéo</span></div>
  <div class="pc-in">
    <div class="pc-row"><small>Style</small><div class="pc-pills"><span class="on">UGC face caméra</span><span>Cinématique</span><span>Motion design</span><span>Animation d'image</span></div></div>
    <div class="pc-row"><small>Format</small><div class="pc-pills"><span class="on">9:16</span><span>1:1</span><span>4:5</span><span>16:9</span></div><small style="margin-left:14px">Durée</small><div class="pc-pills"><span class="on">8 s</span><span>16 s</span><span>24 s</span></div></div>
    <div class="pc-prompt">Selfie vertical, salle de bain lumineuse. Léna, 28 ans, tient le flacon de sérum vitamine C près du visage, regarde la caméra : « 3 semaines, zéro fond de teint… »</div>
    <div class="pc-eng"><div class="on"><b>Standard</b><small>⚡300</small></div><div><b>Cinématique premium</b><small>⚡1334</small></div></div>
    <div class="sc-btns"><span class="am-btn grad">Générer tel quel · ⚡300</span><span class="am-btn">Reformuler avec l'IA · ⚡1</span></div>
  </div></div>'''


def after_card():
    nxt = ['Générer une variation', 'Décliner en 1:1', 'Créer une image']
    acts = ['Modifier', 'Continuer la vidéo', 'Ouvrir dans l\'éditeur', 'Sous-titres', 'Rogner / Couper', 'Scinder', 'Recadrer']
    vers = [('Originale', '8 s · 9:16'), ('Sous-titrée', 'style Percutant'), ('+8 s', 'même acteur, même décor'), ('Recadrée', '1:1')]
    return '''<div class="win am after rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Création prête</span></div>
  <div class="af-in">
    <div class="af-v"><video data-src="media/lena-serum.mp4" poster="media/lena-serum.poster.webp" muted loop playsinline preload="none" aria-label="Vidéo UGC générée"></video></div>
    <div class="af-r"><h5>Et ensuite ?</h5><div class="af-chips">%s</div>
      <h5>Actions</h5><div class="af-chips sm">%s</div>
      <h5>Versions</h5><div class="af-vers">%s</div></div>
  </div></div>''' % (''.join('<span class="am-btn">%s</span>' % n for n in nxt), ''.join('<span>%s</span>' % a for a in acts),
                    ''.join('<div><b>%s</b><small>%s</small></div>' % v for v in vers))


# ------------------------------------------------------------------ actors
def actor_create():
    return '''<div class="win am acr rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Créer un acteur</span></div>
  <div class="acr-in">
    <div class="am-tabs"><span>Décrire</span><span class="on">Importer une image</span></div>
    <div class="acr-up"><img src="media/actor-zoe-photo.webp" alt="Photo de référence importée"><div><b>photo-zoe.jpg</b><small>JPG/PNG · max 8 Mo</small></div></div>
    <div class="acr-f"><small>Nom</small><span>Zoé</span></div>
    <h5>Fiche du personnage</h5>
    <dl><dt>Visage</dt><dd>Ovale, yeux noisette, sourire naturel</dd><dt>Cheveux</dt><dd>Bruns, mi-longs, raie au milieu</dd><dt>Corps</dt><dd>Silhouette fine, 1,65 m</dd><dt>Tenue</dt><dd>Débardeur crème, collier fin</dd></dl>
    <div class="sc-btns"><span class="am-btn grad">Générer l'acteur · ⚡100</span><small>≈ 20 s · jusqu'à 10 acteurs perso</small></div>
  </div></div>'''


VOICES = [('Charlotte', 'Féminine · chaleureuse'), ('Alice', 'Féminine · posée'), ('Jessica', 'Féminine · dynamique'), ('Antoni', 'Masculine · naturelle'),
          ('Daniel', 'Masculine · grave'), ('Adam', 'Masculine · énergique')]


def voices():
    return '''<div class="win am vox rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Changer la voix · 21 voix françaises</span></div>
  <div class="vx-in">%s<div class="vx-more">+ 15 autres voix · 10 féminines et 11 masculines</div></div></div>''' % ''.join(
        '<div class="vx%s"><span class="play">▶</span><div><b>%s</b><small>%s</small></div><i class="wave"><b></b><b></b><b></b><b></b><b></b><b></b><b></b></i></div>' % (' on' if i == 0 else '', n, d)
        for i, (n, d) in enumerate(VOICES))


# ------------------------------------------------------------------ editor
def editor_ui():
    tabs = ['Médias', 'Mes assets', 'Texte', 'Stock', 'Transitions', 'Sous-titres', 'Audio IA']
    titles = ['Percutant', 'Surligné', 'Machine à écrire', 'Accroche', 'Néon', 'Premium', 'Promo', 'Urgence']
    return '''<div class="win am edx rv" id="edxdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>Éditeur vidéo · Pub sérum v2</span><span class="edx-save">Enregistré automatiquement à 10:42</span></div>
  <div class="edx-in">
    <div class="edx-l"><div class="edx-tabs">%s</div><small>Titres animés</small><div class="edx-tt">%s</div></div>
    <div class="edx-c"><div class="edx-fmt"><span class="on">9:16</span><span>16:9</span><span>1:1</span></div>
      <div class="edx-pv"><video data-src="media/lena-serum.mp4" poster="media/lena-serum.poster.webp" muted loop playsinline preload="none" aria-label="Aperçu du montage"></video><div class="edx-cap"><span>3 semaines,</span> <em>zéro</em> fond de teint</div></div></div>
    <div class="edx-r"><div class="edx-tabs2"><span class="on">Texte</span><span>Style</span><span>Position</span><span>Animation</span></div>
      <div class="edx-f"><small>Police</small><b>Inter</b></div><div class="edx-f"><small>Taille</small><b>96</b></div><div class="edx-f"><small>Épaisseur</small><b>800</b></div>
      <div class="edx-f"><small>Accent</small><b><i style="background:#F29A2E"></i>#F29A2E</b></div><div class="edx-f"><small>Contour</small><b>6 px</b></div><div class="edx-f"><small>Entrée</small><b>Pop</b></div></div>
  </div>
  <div class="edx-tl" id="edxtl">
    <div class="edx-tools"><span>▶</span><span>↶ ↷</span><span>✂ Découper</span><span>Dupliquer</span><span>+ Calque média</span><span>+ Calque texte</span><span>+ Calque audio</span><span class="t" id="edxt">00:03 / 00:16</span></div>
    <div class="edx-tr"><small>Vidéo</small><div><span class="c v" style="flex:8">Léna · segment 1</span><span class="c tr">⇋</span><span class="c v" style="flex:8">Léna · segment 2</span></div></div>
    <div class="edx-tr"><small>Texte</small><div><span class="c t" style="flex:4">3 semaines,</span><span class="c t" style="flex:3">zéro fond…</span><span class="c gap" style="flex:9"></span></div></div>
    <div class="edx-tr"><small>Sous-titres</small><div><span class="c s" style="flex:16">Généré avec l'IA · style Karaoké</span></div></div>
    <div class="edx-tr"><small>Audio</small><div><span class="c a" style="flex:16">Voix off IA · Charlotte</span></div></div>
    <i class="edx-ph" id="edxph"></i>
  </div></div>''' % (''.join('<span%s>%s</span>' % (' class="on"' if t == 'Texte' else '', t) for t in tabs), ''.join('<span>%s</span>' % t for t in titles))


def quick_tools():
    tools = [('Rogner / Couper', 'Début et fin à l\'image près, l\'original est conservé'), ('Scinder en 2 clips', 'Point de coupure au 0,1 s'),
             ('Recadrer', '9:16 · 16:9 · 1:1 · 4:5 (feed Instagram)'), ('Assembler 2 vidéos', 'Ordre inversable, 10 à 30 s de traitement'),
             ('Continuer la vidéo', '+8 s : même acteur, même décor, même voix'), ('Ajouter des sous-titres', '6 langues · 3 styles · export .srt')]
    return '<div class="qtools">%s</div>' % ''.join('<div class="qt rv"><b>%s</b><small>%s</small></div>' % t for t in tools)


# ------------------------------------------------------------------ batch studio
def batch_flow():
    angles = [('A', 'Le rituel du soir', 'Accroche : « Le geste qui change tout avant de dormir »'), ('A', 'Fait main à Lyon', 'Accroche : « Coulée à la main, à 20 km de chez vous »'),
              ('A', 'L\'odeur du dimanche', 'Accroche : « Figue, cèdre, et le dimanche dure plus longtemps »'), ('B', 'Le cadeau qui marque', 'Accroche : « Le cadeau qu\'on n\'oublie pas »'),
              ('B', 'Prix juste', 'Accroche : « 32 €, 50 heures de combustion »', 'à prouver'), ('B', 'Avis clients', 'Accroche : « 4,9 ★, et ce n\'est pas un hasard »'),
              ('C', 'Contre la bougie industrielle', 'Accroche : « Ce que votre bougie de supermarché ne dit pas »', 'contrarian'), ('C', 'Zéro paraffine', 'Accroche : « Cire végétale, rien d\'autre »')]
    args = [('Bénéfice', '50 heures de combustion'), ('Preuve', '4,9 ★ sur 128 avis'), ('Offre', 'Livraison offerte dès 49 €'), ('Caractéristique', 'Cire de soja, mèche coton'),
            ('Cible', 'Amateurs de déco slow'), ('Objection', '« Trop cher pour une bougie »')]
    grid = ['img-bougie', 'bougie-916', 'img-bougie', 'img-bougie', 'bougie-916', 'img-bougie', 'img-bougie', 'bougie-916']
    tpls = ['Accroche géante', '3 bénéfices', 'Prix / offre', 'Avis client', 'Question + CTA']
    return '''<div class="win am bx rv" id="bxdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>Batch Studio · atelier-figue.fr · Lot n°3</span></div>
  <div class="bx-steps"><span class="on" data-s="0">1 · Source</span><span data-s="1">2 · Plan</span><span data-s="2">3 · Aperçus</span><span data-s="3">4 · Grille</span></div>
  <div class="bx-body">
    <div class="bx-p on" data-p="0"><div class="bx-und"><b>Ce que j'ai compris</b><p>Atelier de bougies parfumées coulées à la main à Lyon, cire de soja, cadeaux et déco slow.</p>
      <div class="chips"><span>E-commerce</span><span>Ton automatique</span><span>Produit</span></div>
      <div class="bx-mw"><span>Marché : 8 pubs concurrentes analysées · voir</span><span>La marque : 3 pubs Meta actives (11 au total) · voir</span></div></div>
      <b class="bx-h">Arguments</b><div class="bx-args">%s</div><div class="bx-foot"><span>9 images · 14 arguments</span><span class="am-btn grad">Construire le plan</span></div></div>
    <div class="bx-p" data-p="1"><div class="bx-ter"><span>Territoire A · Le rituel</span><span>Territoire B · Le cadeau</span><span>Territoire C · contrarian</span></div><div class="bx-ang">%s</div>
      <div class="bx-foot"><span>8 angles sélectionnés</span><span class="am-btn grad">Générer les aperçus</span></div></div>
    <div class="bx-p" data-p="2"><div class="bx-prev">%s</div><div class="bx-foot"><span>6 aperçus gardés</span><span class="am-btn grad">Décliner en formats</span></div></div>
    <div class="bx-p" data-p="3"><div class="bx-gf"><span class="am-sel">Tous les angles</span><span class="am-sel">v1 · v2 · v3</span><span class="am-sel">4:5 · 1:1 · 9:16</span><span class="am-sel">Gabarit : %s</span></div>
      <div class="bx-grid">%s</div><div class="bx-foot"><span>36 pubs · 6 angles · 3 formats</span><span class="am-btn">Télécharger (zip)</span><span class="am-btn grad">Publier sur Meta</span></div></div>
  </div></div>''' % (
        ''.join('<span class="arg"><i>%s</i>%s</span>' % a for a in args),
        ''.join('<div class="ag"><span class="cb">✓</span><div><b>%s</b><small>%s</small></div><em>%s%s</em></div>' % (a[1], a[2], a[0], (' · ' + a[3]) if len(a) > 3 else '') for a in angles),
        ''.join('<figure><img src="media/%s" alt="Aperçu d\'angle"><figcaption>%s</figcaption><div><span>Garder</span><span>Relancer</span><span>Jeter</span></div></figure>' % (m, t)
                for m, t in [('img-bougie.webp', 'Le rituel du soir'), ('bougie-916.poster.webp', 'Fait main à Lyon'), ('img-bougie.webp', 'Le cadeau qui marque')]),
        ' · '.join(tpls[:2]) + '…',
        ''.join('<span class="%s"><img src="media/%s" alt=""><i>%s</i></span>' % ('r45' if i % 3 == 0 else 'r11' if i % 3 == 1 else 'r916', (m + '.webp') if m.startswith('img') else (m + '.poster.webp'), ['4:5', '1:1', '9:16'][i % 3]) for i, m in enumerate(grid)))


def decline_dialog():
    return '''<div class="win am dcl rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Décliner en formats</span></div>
  <div class="dc-in"><small>Formats</small><div class="pc-pills"><span class="on">4:5</span><span class="on">1:1</span><span class="on">9:16</span></div>
    <small>Variantes par angle</small><div class="pc-pills"><span class="on">v1 · réutilise l'aperçu</span><span class="on">v2</span><span>v3</span></div>
    <div class="dc-sum">6 images réutilisées · 6 nouvelles images · 36 pubs à composer</div>
    <div class="dc-max">Maximum 40 pubs par lot.</div><span class="am-btn grad">Décliner</span></div></div>'''


# ------------------------------------------------------------------ competitor watch
def spy_card():
    ads = [('img-serum.webp', 'Éclat Naturel', 'fort', 'Active depuis 58 j', 'FR'), ('real-42.poster.webp', 'Lumi Beauty', 'fort', 'Active depuis 47 j', 'FR'),
           ('ugc-solaire.poster.webp', 'Peau Douce', 'prometteur', 'Active depuis 31 j', 'BE'), ('lena-serum.poster.webp', 'Vita Skin', 'à surveiller', 'Active depuis 9 j', 'FR')]
    cls = {'fort': 'ok', 'prometteur': 'pri', 'à surveiller': ''}
    return '''<div class="win am spx rv" id="spxdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>Chat · Ce que fait la concurrence</span></div>
  <div class="spx-in">
    <div class="spx-top"><span class="chip meta">Meta Ads Library</span><b>« sérum vitamine C »</b><span class="am-sel">Pays : France</span><span class="am-btn" id="spxfil">Filtres</span></div>
    <div class="spx-stats"><div><b id="spx1">20</b><small>Pubs retenues</small></div><div><b>14</b><small>Annonceurs</small></div><div><b>11</b><small>Encore actives</small></div><div><b>27 j</b><small>Durée médiane</small></div></div>
    <small class="spx-note">248 résultats parcourus, puis triés pour varier les annonceurs</small>
    <div class="spx-car">%s</div>
    <div class="spx-an" id="spxan"><b>Voir l'analyse · Éclat Naturel</b><dl><dt>Diffusion</dt><dd>Active depuis 58 j</dd><dt>Portée UE</dt><dd>214 000</dd><dt>Plateformes</dt><dd>Facebook, Instagram</dd><dt>Accroche</dt><dd>« J'ai arrêté le fond de teint en 3 semaines »</dd><dt>Pourquoi ce signal</dt><dd>Active depuis plus de 45 jours</dd></dl></div>
    <div class="sc-btns"><span class="am-btn grad" id="spxgo">Me proposer une stratégie (2 pubs en référence)</span><span class="am-btn">Se différencier</span></div>
  </div></div>''' % ''.join(
        '<div class="spx-ad%s"><span class="chip %s">%s</span><img src="media/%s" alt="Pub concurrente repérée"><b>%s</b><small>%s · %s</small><span class="ref">%s</span></div>'
        % (' sel' if i < 2 else '', cls[s], s, m, n, d, c, 'Référence ajoutée' if i < 2 else 'Ajouter en référence') for i, (m, n, s, d, c) in enumerate(ads))


def signal_rules():
    rules = [('ok', 'fort', 'Active depuis au moins 45 jours, ou 21 jours avec une portée UE d\'au moins 100 000.'),
             ('pri', 'prometteur', 'Pub encore active, ou diffusée au moins 30 jours.'),
             ('', 'à surveiller', 'Moins de 14 jours de diffusion : trop tôt pour conclure.')]
    return '<div class="sig">%s<p class="sig-n">Données publiques Meta (Europe) : ni dépenses, ni ventes, ni ROAS. Un signal fort n\'est pas une preuve de rentabilité, c\'est le meilleur indice public.</p></div>' % ''.join(
        '<div class="sig-r rv"><span class="chip %s">%s</span><p>%s</p></div>' % r for r in rules)


# ------------------------------------------------------------------ publication
def wizard():
    steps = ['Objectif', 'Créations', 'Audience', 'Textes', 'Publier']
    deps = [('33', 'Gironde'), ('24', 'Dordogne'), ('47', 'Lot-et-Garonne')]
    ctas = ['En savoir plus', 'S\'inscrire', 'Acheter', 'Commander', 'Réserver', 'Télécharger', 'Contacter', 'Découvrir', 'Voir plus', 'Demander un devis']
    return '''<div class="win am wz rv" id="wzdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>Nouvelle campagne · Lance ta publicité en quelques étapes simples</span></div>
  <div class="wz-steps">%s</div>
  <div class="wz-body">
    <div class="wz-p on" data-p="0"><h5>Plateforme &amp; objectif</h5><div class="wz-meta"><span class="chip meta">Meta · Facebook + Instagram</span></div>
      <div class="wz-obj"><div class="on"><b>Leads</b><small>Formulaire instantané (email, téléphone)</small></div><div><b>Trafic</b><small>Visites vers un site</small></div><div><b>Ventes</b><small>Achats sur une boutique</small></div></div></div>
    <div class="wz-p" data-p="1"><h5>Choisis tes créations</h5><div class="wz-cr"><span class="sel"><img src="media/real-12.poster.webp" alt=""><i>Vidéo</i></span><span class="sel"><img src="media/real-06.poster.webp" alt=""><i>Vidéo</i></span><span><img src="media/ugc-pac-awa.poster.webp" alt=""><i>Vidéo</i></span><span><img src="media/img-serum.webp" alt=""><i>Image</i></span></div><small>Image, vidéo ou carrousel (2 à 10 images) · 2 sélectionnées</small></div>
    <div class="wz-p" data-p="2"><h5>Audience &amp; budget</h5>
      <div class="wz-g"><div><small>Pays ciblés</small><div class="chips"><span>France</span></div></div><div><small>Tranche d'âge</small><div class="wz-age"><i></i><b>30 – 65+</b></div></div>
      <div class="wide"><small>Départements français à inclure</small><div class="chips">%s<span class="add">+ Rechercher un département</span></div></div>
      <div><small>Genre</small><div class="pc-pills"><span class="on">Tous</span><span>Femmes</span><span>Hommes</span></div></div><div><small>Type de budget</small><div class="pc-pills"><span class="on">Quotidien</span><span>Total</span></div></div>
      <div><small>Budget</small><b class="wz-bud" id="wzbud">30 € / jour</b></div><div><small>Placements automatiques</small><span class="tg on"></span> <em>Recommandé</em></div></div></div>
    <div class="wz-p" data-p="3"><h5>Vos publicités</h5><div class="wz-txt"><div><small>Titre principal</small><b>Carport solaire : simulation gratuite</b></div><div><small>Description</small><b>Je pensais que c'était trop cher… jusqu'à ce que je fasse le calcul.</b></div>
      <div><small>Bouton d'action</small><div class="chips">%s</div></div><span class="am-btn">Régénérer texte IA</span></div></div>
    <div class="wz-p" data-p="4"><h5>Récapitulatif</h5><dl class="wz-rc"><dt>Objectif</dt><dd>Leads</dd><dt>Compte publicitaire</dt><dd>Volta Solaire · EUR</dd><dt>Zone</dt><dd>France · 3 départements</dd><dt>Âge · Genre</dt><dd>30-65+ · Tous</dd><dt>Budget</dt><dd>30 € / jour, dès le 12 octobre</dd><dt>Formulaire instantané</dt><dd>Simulation gratuite</dd><dt>Pubs</dt><dd>2</dd></dl>
      <div class="sc-btns"><span class="am-btn">Enregistrer en brouillon</span><span class="am-btn grad" id="wzpub">Publier sur Meta</span></div></div>
  </div>
  <div class="toast" id="wztoast"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Campagne publiée sur Meta</div>
</div>''' % (''.join('<span data-s="%d"%s><i>%d</i>%s</span>' % (i, ' class="on"' if i == 0 else '', i + 1, s) for i, s in enumerate(steps)),
             ''.join('<span>%s · %s ×</span>' % d for d in deps), ''.join('<span%s>%s</span>' % (' class="on"' if c == 'Demander un devis' else '', c) for c in ctas))


def publish_dialog():
    return '''<div class="win am pubd rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Publier sur Meta Ads</span></div>
  <div class="pd-in"><div class="pd-f"><small>Page Facebook</small><span class="am-sel">Volta Solaire</span></div>
    <div class="pd-f"><small>Formulaire de Lead (requis)</small><span class="am-sel">Simulation gratuite</span></div>
    <div class="pd-f"><small>Pixel (requis pour conversions)</small><span class="am-sel">Pixel volta-solaire.fr</span></div>
    <div class="pd-f row"><span class="tg"></span><div><b>Activer immédiatement</b><small>Désactivé : la campagne est créée en pause. Date future : elle est programmée.</small></div></div>
    <span class="am-btn grad">Publier sur Meta</span></div></div>'''


def campaigns_list():
    rows = [('Carport solaire · Gironde', 'Growthity', 'En ligne', 'ok', '30 €/j', '2', '18 240', '512', '2,8 %', '0,41 €', '212 €'),
            ('Pompe à chaleur · Bordeaux', 'Growthity', 'En revue', 'pri', '25 €/j', '3', '—', '—', '—', '—', '0 €'),
            ('Retargeting site · 30 j', 'Hors Growthity', 'En pause', '', '15 €/j', '1', '6 980', '141', '2,0 %', '0,52 €', '73 €')]
    return '''<div class="win am cpl rv">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Mes publicités</span></div>
  <div class="am-in"><div class="am-top"><div class="am-tabs"><span>Brouillons</span><span class="on">En ligne sur Meta</span><span>Hors ligne sur Meta</span></div><div class="am-acts"><span class="am-btn">Actualiser</span><span class="am-btn">Nettoyer les vides</span></div></div>
    <div class="am-fil"><span class="am-tabs"><span class="on">Campagnes 3</span><span>Ensembles de pubs 4</span><span>Publicités 6</span></span><span class="am-sel">Statut</span><span class="am-sel">Objectif</span><span class="am-sel hide-s">Compte publicitaire</span></div>
    <div class="cp-t"><div class="cp-h"><span>Campagne</span><span>Statut</span><span>Budget</span><span>Pubs</span><span>Vues</span><span>Clics</span><span>Taux de clic</span><span>Coût par clic</span><span>Dépensé</span></div>%s</div></div></div>''' % ''.join(
        '<div class="cp-r"><b>%s <em class="gb%s">%s</em></b><span class="chip %s">%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span></div>'
        % (r[0], '' if r[1] == 'Growthity' else ' out', r[1], r[3], r[2], r[4], r[5], r[6], r[7], r[8], r[9], r[10]) for r in rows)


def edit_ad():
    f = [('Nom de l\'annonce', 'UGC Hugo · objection prix'), ('Titre (200 car. max)', 'Carport solaire : simulation gratuite'),
         ('Texte principal (2 000 car. max)', 'Je pensais qu\'un carport solaire coûtait trop cher… jusqu\'à ce que je fasse le calcul.'),
         ('Bouton', 'Demander un devis'), ('Audience diffusée sur Meta', 'France · 30-65 ans · Tous')]
    return '''<div class="win am eda rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Modifier la publicité sur Meta</span></div>
  <div class="pd-in">%s<div class="pd-f row"><img src="media/real-12.poster.webp" alt="" class="eda-th"><div><b>Changer la créa (vidéo ou image)</b><small>Remplace le média par une création de l'espace</small></div></div>
    <div class="sc-btns"><span class="am-btn">Pause</span><span class="am-btn grad">Enregistrer sur Meta</span></div><small class="pd-n">Seuls les champs modifiés sont envoyés · email récapitulatif à chaque modification</small></div></div>''' % ''.join(
        '<div class="pd-f"><small>%s</small><span class="pd-v">%s</span></div>' % x for x in f)


# ------------------------------------------------------------------ media buyer / performance
def mb_summary():
    recos = [('boost', '↗ À booster', 'Carport solaire · Gironde : vos leads les moins chers du compte.', 'Augmenter le budget', 'mbxb'),
             ('test', '✦ À tester', 'Pompe à chaleur · Bordeaux : coût par lead 1,6× la moyenne.', 'Créer une nouvelle pub', ''),
             ('cut', '⏸ À couper', 'Retargeting site : 46 € dépensés, aucun lead.', 'Mettre en pause', '')]
    return '''<div class="win am mbx rv" id="mbxdemo">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Vue d'ensemble</span></div>
  <div class="am-in"><div class="am-top"><div><b class="mbx-t">Où en sont tes publicités</b><small>Le résumé de la période, en clair.</small></div><span class="am-sel">7 derniers jours</span></div>
    <p class="mbx-s" id="mbxs">Sur la période : <b>412 €</b> dépensés, <b>38 leads</b> à <b>10,84 €</b> pièce. Coût par lead en baisse de 14 %% : c'est bon signe.</p>
    <h5 class="mbx-h">Ce que je ferais maintenant</h5>
    <div class="mbx-r">%s</div></div>
  <div class="mbx-dlg" id="mbxdlg"><b>Modifier le budget</b><small>Ensemble principal · Carport solaire</small><div class="mbx-ba"><span>30,00 €</span>→<b id="mbxnew">36,00 €</b><em>+20 %%</em></div><span class="am-btn grad" id="mbxok">Confirmer</span></div>
  <div class="toast" id="mbxtoast"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>Budget mis à jour : 36,00 € par jour</div>
</div>''' % ''.join('<div class="mbx-c %s"><span class="k">%s</span><p>%s</p><span class="am-btn"%s>%s</span></div>' % (c, k, p, ' id="%s"' % i if i else '', b) for c, k, p, b, i in recos)


def perf_page():
    kpis = [('Dépense', '412 €', '+8 %'), ('Nombre d\'affichages', '48 210', '+12 %'), ('Clics', '1 236', '+15 %'), ('Personnes touchées', '21 870', '+9 %'),
            ('Taux de clic (CTR)', '2,56 %', '+0,3 pt'), ('Coût par clic (CPC)', '0,33 €', '−6 %'), ('Leads', '38 · 10,84 €', '+21 %')]
    rows = [('Carport solaire · Gironde', '2,1,3,4,5,6,8', '212 €', '24 180', '702', '2,9 %', '0,30 €', '24'),
            ('Pompe à chaleur · Bordeaux', '3,4,3,5,4,4,5', '154 €', '17 050', '401', '2,4 %', '0,38 €', '13'),
            ('Retargeting site · 30 j', '4,3,3,2,2,2,1', '46 €', '6 980', '133', '1,9 %', '0,35 €', '0')]
    return '''<div class="win am pf rv">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Performance</span></div>
  <div class="am-in"><div class="am-top"><div class="am-tabs"><span class="on">Évolution</span><span>Meilleures pubs</span><span>Analyse détaillée</span></div><span class="am-sel">7 derniers jours</span></div>
    <div class="pf-k">%s</div>
    <div class="am-fil"><span class="am-btn">Actives uniquement</span><span class="am-sel">Groupe : Solaire Gironde</span><span class="am-sel hide-s">Tous les comptes publicitaires</span></div>
    <div class="pf-t"><div class="pf-h"><span>Nom</span><span>Tendance</span><span>Dépense</span><span>Affichages</span><span>Clics</span><span>Taux de clic</span><span>Coût par clic</span><span>Résultats</span></div>%s</div></div></div>''' % (
        ''.join('<div><small>%s</small><b>%s</b><em>%s</em></div>' % k for k in kpis),
        ''.join('<div class="pf-r"><b>%s</b><svg viewBox="0 0 60 20" data-s="%s"></svg><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span><span>%s</span></div>' % r for r in rows))


def analysis_cards():
    c = [('boost', 'À booster', 'Le coût par résultat le plus bas du compte : ajoutez du budget, prérempli à +20 %.'),
         ('test', 'À tester', 'Coût par résultat d\'au moins 1,4× la moyenne, ou taux de clic sous 0,8 % après 2 000 affichages : lancez une nouvelle pub.'),
         ('cut', 'À couper', 'Au moins 20 € et 5 % de la dépense totale, sans aucun résultat : mettez en pause.'),
         ('keep', 'À laisser tourner', 'Rien d\'anormal : laissez Meta optimiser encore quelques jours.')]
    return '<div class="anc">%s</div>' % ''.join('<div class="an %s rv"><b>%s</b><p>%s</p></div>' % x for x in c)


# ------------------------------------------------------------------ inspiration + creations
def inspi_gallery():
    sectors = ['Beauté & soin', 'Mode', 'Bijoux & accessoires', 'Maison & déco', 'Animaux', 'Sport & outdoor', 'Bébé & enfant', 'Food & boissons', 'Compléments', 'Tech & gadgets',
               'Pompe à chaleur & chauffage', 'Isolation & rénovation', 'Solaire', 'Cuisine & salle de bain', 'Menuiserie & fenêtres', 'Piscine & jardin', 'Nettoyage à domicile', 'Santé & bien-être', 'Auto', 'Immobilier']
    concepts = ['Accroche forte', 'Offre promo', 'Témoignage / avis', 'Avant / après', 'Écran partagé', 'Bénéfices pointés', 'Aide / prime', 'Devis / simulateur']
    cards = [('img-serum.webp', 'Éclat Naturel', 'Beauté & soin', 'Diffusée depuis 58 jours', True), ('img-sneakers.webp', 'Stride', 'Mode', 'Diffusée depuis 41 jours', True),
             ('img-bougie.webp', 'Atelier Figue', 'Maison & déco', 'Diffusée depuis 34 jours', False), ('img-macbook.webp', 'Nova Tech', 'Tech & gadgets', 'Diffusée depuis 47 jours', True),
             ('lessive-bottle.webp', 'Lessiva', 'Maison & déco', 'Diffusée depuis 36 jours', False), ('gloss-lips.webp', 'Lumi Beauty', 'Beauté & soin', 'Diffusée depuis 52 jours', True)]
    return '''<div class="win am ig rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Galerie d'inspiration · Des pubs qui performent. Choisis-en une, on la recrée pour ton produit.</span></div>
  <div class="am-in"><div class="am-top"><div class="am-tabs"><span class="on">Images</span><span>Vidéos</span><span>Flux</span></div><div class="am-acts"><span class="am-sel">Les plus performantes</span><span class="am-btn">★ Mes favoris</span></div></div>
    <div class="ig-f"><small>Concepts tendance</small><div class="chips">%s</div></div>
    <div class="ig-f"><small>Secteurs · 20</small><div class="chips sec">%s</div></div>
    <div class="ig-g">%s</div></div></div>''' % (''.join('<span%s>%s</span>' % (' class="on"' if i == 3 else '', x) for i, x in enumerate(concepts)),
                                                ''.join('<span%s>%s</span>' % (' class="on"' if x == 'Beauté & soin' else '', x) for x in sectors),
                                                ''.join('<div class="ig-c"><img src="media/%s" alt="Pub repérée : %s">%s<div><b>%s</b><small>%s · %s</small></div></div>' % (m, n, '<span class="chip ok">Gagnante</span>' if w else '', n, s, d) for m, n, s, d, w in cards))


def inspi_detail():
    return '''<div class="win am igd rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Détail de la pub</span></div>
  <div class="igd-in"><img src="media/img-serum.webp" alt="Pub inspirante">
    <div><small>Beauté &amp; soin · Avant / après · Achat · 4:5</small><b>« 3 semaines, zéro fond de teint »</b>
      <dl><dt>Diffusée</dt><dd>du 11 août au 8 oct.</dd><dt>Copies actives</dt><dd>4</dd><dt>Portée UE</dt><dd>214 000</dd></dl>
      <div class="igd-bars"><div><span>25-34 ans</span><i style="width:40%"></i><b>40 %</b></div><div><span>35-44 ans</span><i style="width:28%"></i><b>28 %</b></div><div><span>Femmes 72 % · Hommes 28 %</span></div></div>
      <div class="igd-why"><b>Pourquoi ça marche</b>Résultat daté, visage réel, produit à l'écran dès la première seconde.</div>
      <div class="sc-btns"><span class="am-btn">Sauvegarder</span><span class="am-btn grad">Recréer pour mon produit</span></div></div></div></div>'''


def creations_page():
    items = [('lena-serum', 'Vidéo', 'Growthity IA', 'Sérum · Léna avant/après', 'Léna'), ('img-serum.webp', 'Image', 'Growthity IA', 'Packshot oranges 4:5', ''),
             ('real-42', 'Vidéo', 'Growthity IA', 'Gloss · tuto Camille', 'Camille'), ('lessive-bottle.webp', 'Carrousel', 'Growthity IA', 'Lessiva · 3 slides', ''),
             ('bougie-916', 'Vidéo', 'Importée', 'Bougie · vidéo produit', ''), ('img-sneakers.webp', 'Image', 'Growthity IA', 'Stride · lifestyle', '')]
    def th(m):
        return ('media/%s' % m) if '.' in m else ('media/%s.poster.webp' % m)
    return '''<div class="win am crx rv">
  <div class="win-bar"><i></i><i></i><i></i><span>growthity.ai · Mes créations</span></div>
  <div class="am-in"><div class="am-top"><div><b>Mes créations</b><small>Retrouve, organise et publie tes publicités.</small></div><div class="am-acts"><span class="am-btn">Importer</span><span class="am-btn grad">Nouvelle publicité</span></div></div>
    <div class="am-fil"><span class="am-in-s">Rechercher par nom ou description…</span><span class="am-tabs"><span class="on">Tous</span><span>Images</span><span>Vidéos</span><span>Carrousels</span></span><span class="am-sel hide-s">Toutes sources</span></div>
    <div class="crx-b"><div class="crx-fold"><small>Dossiers</small><span class="on">Toutes</span><span>Sans dossier</span><span>Éclat Skin · Lancement</span><span>Lessiva · Été</span><span>Tests UGC</span></div>
      <div class="crx-g">%s</div></div>
    <div class="crx-sel"><b>2 sélectionnées</b><span>Déplacer</span><span>Créer un carrousel</span><span>Assembler</span><span>Publier en lot</span></div></div></div>''' % ''.join(
        '<div class="crx-c%s"><img src="%s" alt="%s"><span class="b1">%s</span><span class="b2">%s</span><b>%s</b>%s</div>' % (
            ' sel' if i in (0, 2) else '', th(m), t, ty, src, t, '<small>Acteur : %s</small>' % a if a else '<small>&nbsp;</small>') for i, (m, ty, src, t, a) in enumerate(items))


def catalog():
    return '''<div class="win am cat rv">
  <div class="win-bar"><i></i><i></i><i></i><span>Catalogue · Produits</span></div>
  <div class="am-in"><small class="cat-s">Organise tes produits en dossiers d'images, réutilisables dans tes pubs.</small>
    <div class="cat-g"><div class="cat-p"><div class="cat-i"><img src="media/img-serum.webp" alt=""><img src="media/img-serum-pack.webp" alt=""></div><b>Sérum Vitamine C · 30 ml</b><small>2 images · eclat-skin.fr</small></div>
      <div class="cat-p"><div class="cat-i"><img src="media/lessive-bottle.webp" alt=""><img src="media/lessive-linge.webp" alt=""></div><b>Parfum de linge</b><small>2 images</small></div>
      <div class="cat-p new"><span>+</span><b>Nouveau produit</b><small>Jusqu'à 10 images à la fois</small></div></div>
    <div class="cat-sh"><span class="sh">S</span><div><b>Boutique Shopify connectée</b><small>Tes produits Shopify apparaissent dans l'onglet « Shopify » du chat.</small></div><span class="chip ok">Connecté</span></div></div></div>'''
