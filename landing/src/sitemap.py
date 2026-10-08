# Site map shared by the mega menu, the mobile menu, the footer and the "related pages" cards.
# Each entry: slug -> (group, title, short description, icon key, tone, thumbnail)

PAGES = {
  # Produit · Créer
  'chat-ia':            ('produit', 'Chat créatif IA', 'Du brief à la pub, en une conversation', 'chat', 'indigo', 'lena-serum.poster.webp'),
  'acteurs-ugc':        ('produit', '500+ acteurs UGC IA', 'Ou le vôtre, depuis une simple photo', 'user', 'pink', 'real-14.poster.webp'),
  'formats':            ('produit', 'Vidéos, visuels & carrousels', 'Tous les formats Meta en un brief', 'layers', 'blue', 'lessive-bottle.webp'),
  'editeur-video':      ('produit', 'Éditeur vidéo', 'Coupez, insérez, sous-titrez', 'film', 'orange', 'gloss-lips.webp'),
  'studio-en-lot':      ('produit', 'Studio en lot', 'Une campagne entière depuis votre site', 'grid', 'green', 'img-bougie.webp'),
  # Produit · Diffuser & piloter
  'espion-meta-ads':    ('produit', 'Espion Meta Ads', 'Growthity trouve les pubs qui marchent', 'search', 'slate', 'real-12.poster.webp'),
  'publication-meta':   ('produit', 'Publication Meta Ads', 'Audience, budget, en ligne en un clic', 'send', 'meta', 'real-04-hd.poster.webp'),
  'pilotage-ia':        ('produit', 'Pilotage IA', 'Le media buyer qui vous dit quoi faire', 'chart', 'cyan', 'real-40.poster.webp'),
  'leads-ventes':       ('produit', 'Leads & ventes', 'Chaque lead relié à la pub qui l\'a apporté', 'target', 'green', 'ugc-homme.poster.webp'),
  # Solutions
  'ecommerce':          ('solutions', 'E-commerce', 'Des pubs qui font vendre vos produits', 'bag', 'pink', 'img-serum.webp'),
  'b2b-leads':          ('solutions', 'B2B & services', 'Des leads qualifiés, chaque semaine', 'briefcase', 'blue', 'actor-claire.poster.webp'),
  'commerce-local':     ('solutions', 'Commerce local & artisans', 'Des clients autour de chez vous', 'pin', 'orange', 'ugc-scierie.poster.webp'),
  'agences':            ('solutions', 'Agences', 'Toutes vos marques, une seule app', 'users', 'indigo', 'real-06.poster.webp'),
  # Ressources
  'inspiration':        ('ressources', 'Galerie d\'inspiration', 'Les pubs qui performent, par secteur', 'bulb', 'orange', 'real-19.poster.webp'),
  'templates':          ('ressources', 'Templates vidéo produit', 'Votre photo produit, mise en scène', 'spark', 'pink', 'img-sneakers.webp'),
  'guide-pub-ugc':      ('ressources', 'Guide : la pub UGC qui convertit', 'Hooks, scripts, formats : la méthode', 'book', 'blue', 'real-42.poster.webp'),
  'growthity-vs-agence':('ressources', 'Growthity ou une agence ?', 'Délais, coûts, contrôle : le comparatif', 'scale', 'slate', 'actor-thomas.poster.webp'),
  'faq':                ('ressources', 'Questions fréquentes', 'Crédits, Meta, données, équipe', 'help', 'cyan', 'real-05.poster.webp'),
}

GROUPS = {
  'produit': ('Produit', [('Créer', ['chat-ia', 'acteurs-ugc', 'formats', 'editeur-video', 'studio-en-lot']),
                          ('Diffuser & piloter', ['espion-meta-ads', 'publication-meta', 'pilotage-ia', 'leads-ventes'])]),
  'solutions': ('Solutions', [('Par activité', ['ecommerce', 'b2b-leads']), ('', ['commerce-local', 'agences'])]),
  'ressources': ('Ressources', [('Apprendre', ['guide-pub-ugc', 'growthity-vs-agence', 'faq']), ('S\'inspirer', ['inspiration', 'templates'])]),
}

NEW = {'espion-meta-ads'}

# Featured card at the right of each mega-menu panel: (media, is_video, chip, title, text, href)
FEATURED = {
  'produit': ('lena-serum', True, 'Démo', 'Du brief à Meta en 2 minutes', 'Regardez le chat créer et publier une pub complète.', 'chat-ia.html'),
  'solutions': ('ugc-scierie', True, 'Tous secteurs', 'Produits, services, local : ça marche pour tout', 'Si ça se vend, Growthity sait en faire une pub.', 'chat-ia.html'),
  'ressources': ('real-42', True, 'Guide', 'La pub UGC qui convertit', 'Hooks, scripts et formats qui marchent sur Meta.', 'guide-pub-ugc.html'),
}

TONES = {
  'indigo': ('#5B3FE4', '#EEEBFF'), 'pink': ('#D02F7E', '#FDEAF4'), 'blue': ('#2563EB', '#E8F0FF'),
  'orange': ('#D9690B', '#FFF0E0'), 'green': ('#138A5A', '#E3F8EE'), 'slate': ('#334155', '#EEF0F4'),
  'meta': ('#0866FF', '#E6F0FF'), 'cyan': ('#0E7490', '#E0F5FA'),
}

_P = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
ICONS = {k: _P % v for k, v in {
  'chat': '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  'user': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'layers': '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  'film': '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M8 4v6M16 4v6M10 14l4 2-4 2Z"/>',
  'grid': '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  'search': '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.6-4.6"/>',
  'send': '<path d="M22 3 9.2 10.1M22 3l-7 19-3.8-8.9L2 9.4Z"/>',
  'chart': '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-7"/>',
  'target': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  'bag': '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  'briefcase': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  'pin': '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
  'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  'bulb': '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
  'spark': '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 15v4M17 17h4"/>',
  'book': '<path d="M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2V5ZM20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2V5Z"/>',
  'scale': '<path d="M12 3v18M7 21h10M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0L5 7ZM19 7l-3 7a3 3 0 0 0 6 0l-3-7Z"/>',
  'help': '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
  'bolt': '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>',
  'shield': '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'wand': '<path d="m15 4 5 5L9 20l-5-5Z"/><path d="M13 6l5 5M5 3v3M3.5 4.5h3M19 15v3M17.5 16.5h3"/>',
  'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  'folder': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  'copy': '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  'text': '<path d="M4 6h16M4 12h10M4 18h7"/>',
  'mic': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  'euro': '<path d="M18 6.5A7 7 0 1 0 18 17.5M4 10h9M4 14h9"/>',
  'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  'lock': '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  'check': '<path d="m5 12 5 5L20 7"/>',
  'refresh': '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  'pause': '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  'trend': '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  'store': '<path d="M3 9 5 4h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
  'play': '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
  'phone': '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
}.items()}

CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
ARROW = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12 5 5L20 7" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
