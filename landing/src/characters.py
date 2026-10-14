"""Personnages illustrés (bustes vectoriels, style légèrement cartoon) du bloc « Toute une équipe pub ».
Chaque personnage = teint, coiffure, couleur de cheveux, tenue, accessoire et un objet de métier en badge."""

INK = '#1E1B2E'


def _hair_back(style, c):
    return {
        'bob': f'<path d="M33 58c-3-22 9-35 27-35s30 13 27 35l1 18c-6 3-12 2-15-2H48c-3 4-9 5-15 2z" fill="{c}"/>',
        'long': f'<path d="M32 56c-2-21 10-34 28-34s30 13 28 34l4 40c-9 6-20 5-25-1H53c-5 6-16 7-25 1z" fill="{c}"/>',
        'bun': f'<circle cx="60" cy="22" r="11" fill="{c}"/><path d="M36 58c-2-20 8-31 24-31s26 11 24 31z" fill="{c}"/>',
        'afro': f'<circle cx="60" cy="44" r="31" fill="{c}"/><circle cx="36" cy="54" r="12" fill="{c}"/><circle cx="84" cy="54" r="12" fill="{c}"/>',
        'curly': f'<path d="M37 54c-4-18 8-29 23-29s27 11 23 29z" fill="{c}"/>',
        'short': '', 'buzz': '', 'beanie': '',
    }[style]


def _hair_front(style, c):
    return {
        'bob': f'<path d="M37 52c2-14 11-21 23-21 9 0 17 4 21 12-8 1-17-1-24-6-4 7-11 12-20 15z" fill="{c}"/>',
        'long': f'<path d="M38 54c1-15 10-23 22-23 13 0 22 8 22 22-9-1-17-6-21-13-5 8-13 13-23 14z" fill="{c}"/>',
        'bun': f'<path d="M38 50c3-12 11-18 22-18s19 6 22 18c-8-4-14-8-22-8s-14 4-22 8z" fill="{c}"/>',
        'afro': f'<path d="M38 46c4-10 12-14 22-14s18 4 22 14c-7-3-14-4-22-4s-15 1-22 4z" fill="{c}"/>',
        'curly': (f'<g fill="{c}"><circle cx="42" cy="42" r="7"/><circle cx="50" cy="35" r="8"/><circle cx="60" cy="32" r="8"/>'
                  f'<circle cx="70" cy="35" r="8"/><circle cx="78" cy="42" r="7"/><circle cx="39" cy="50" r="5"/><circle cx="81" cy="50" r="5"/></g>'),
        'short': f'<path d="M37 52c-1-15 9-24 23-24s25 9 23 24c-4-6-9-10-15-11-7 4-18 6-31 11z" fill="{c}"/>',
        'buzz': f'<path d="M38 50c0-13 9-20 22-20s22 7 22 20c-6-6-14-9-22-9s-16 3-22 9z" fill="{c}" opacity=".92"/>',
        'beanie': f'<path d="M36 50c0-15 10-24 24-24s24 9 24 24z" fill="{c}"/><rect x="34" y="44" width="52" height="10" rx="5" fill="{c}" style="filter:brightness(.88)"/><circle cx="60" cy="24" r="5" fill="{c}"/>',
    }[style]


def _acc(kind):
    return {
        'glasses': f'<g fill="none" stroke="{INK}" stroke-width="2"><circle cx="51" cy="56" r="6.5"/><circle cx="69" cy="56" r="6.5"/><path d="M57.5 56h5M44.5 55l-6-2M75.5 55l6-2"/></g>',
        'headset': f'<path d="M35 58c0-17 11-28 25-28s25 11 25 28" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round"/><rect x="30" y="52" width="9" height="15" rx="4" fill="{INK}"/><rect x="81" y="52" width="9" height="15" rx="4" fill="{INK}"/><path d="M84 67c0 8-6 11-13 11" fill="none" stroke="{INK}" stroke-width="2"/><circle cx="70" cy="78" r="2.5" fill="{INK}"/>',
        'pencil': '<g transform="rotate(-35 84 40)"><rect x="80" y="26" width="6" height="26" rx="1.5" fill="#F6B73C"/><path d="M80 52h6l-3 6z" fill="#F4D9B5"/><rect x="80" y="26" width="6" height="5" fill="#E8667A"/></g>',
        'beard': '',
        'earrings': '<circle cx="38" cy="64" r="2.6" fill="#F6B73C"/><circle cx="82" cy="64" r="2.6" fill="#F6B73C"/>',
        '': '',
    }[kind]


def bust(skin, shade, hair, hair_c, shirt, bg, acc='', beard=False, beard_c=None, collar='round', blush=True, lips=False, uid='a'):
    """Buste 120×120 dans un rond, prêt à être inséré tel quel."""
    neck = f'<path d="M51 70h18v14c0 5-18 5-18 0z" fill="{shade}"/>'
    if collar == 'shirt':
        top = (f'<path d="M14 124c2-24 20-36 46-36s44 12 46 36z" fill="{shirt}"/>'
               f'<path d="M50 87l10 12 10-12-4-3-6 6-6-6z" fill="#FFFFFF"/><path d="M60 99v25" stroke="{INK}" stroke-opacity=".15" stroke-width="2"/>')
    elif collar == 'blazer':
        top = (f'<path d="M14 124c2-24 20-36 46-36s44 12 46 36z" fill="{shirt}"/>'
               f'<path d="M51 87h18l-9 20z" fill="#FFFFFF"/><path d="M60 107l-3-7h6z" fill="#E8667A"/>'
               f'<path d="M48 87l12 24 12-24" fill="none" stroke="{INK}" stroke-opacity=".25" stroke-width="2"/>')
    elif collar == 'hoodie':
        top = (f'<path d="M14 124c2-24 20-36 46-36s44 12 46 36z" fill="{shirt}"/>'
               f'<path d="M44 89c4 9 28 9 32 0" fill="none" stroke="{INK}" stroke-opacity=".18" stroke-width="3"/>'
               f'<path d="M54 96v10M66 96v10" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>')
    else:
        top = (f'<path d="M14 124c2-24 20-36 46-36s44 12 46 36z" fill="{shirt}"/>'
               f'<path d="M50 88c3 6 17 6 20 0" fill="{shade}"/>')
    beard_svg = f'<path d="M39 60c1 17 10 25 21 25s20-8 21-25c-4 6-8 9-13 9-3-3-13-3-16 0-5 0-9-3-13-9z" fill="{beard_c or hair_c}"/>' if beard else ''
    mouth = ('<path d="M54 67.5q6 5.5 12 0z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/>' if beard else
             f'<path d="M54 68q6 5 12 0" fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>' if not lips else
             '<path d="M53.5 67.5q6.5 6 13 0q-6.5 2.5-13 0z" fill="#C2456A"/>')
    face = (
        f'<circle cx="38" cy="58" r="5.5" fill="{skin}"/><circle cx="82" cy="58" r="5.5" fill="{skin}"/>'
        f'<ellipse cx="60" cy="56" rx="22" ry="25" fill="{skin}"/>'
        f'<path d="M38 60c2 14 10 21 22 21-15-2-20-12-22-21z" fill="{shade}" opacity=".55"/>'
        + (f'<ellipse cx="46" cy="65" rx="4.5" ry="2.8" fill="#FF7A8A" opacity=".28"/><ellipse cx="74" cy="65" rx="4.5" ry="2.8" fill="#FF7A8A" opacity=".28"/>' if blush else '')
        + f'<ellipse cx="51" cy="57" rx="2.6" ry="3.3" fill="{INK}"/><ellipse cx="69" cy="57" rx="2.6" ry="3.3" fill="{INK}"/>'
        f'<circle cx="52" cy="55.8" r="1" fill="#FFFFFF"/><circle cx="70" cy="55.8" r="1" fill="#FFFFFF"/>'
        f'<path d="M47 50.5q4-2.5 8 0M65 50.5q4-2.5 8 0" fill="none" stroke="{INK}" stroke-width="1.8" stroke-linecap="round" opacity=".8"/>'
        f'<path d="M60 59q-1.6 4 .8 4.6" fill="none" stroke="{shade}" stroke-width="1.8" stroke-linecap="round"/>'
        + beard_svg + mouth)
    return (f'<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="cc{uid}"><circle cx="60" cy="60" r="60"/></clipPath></defs>'
            f'<g clip-path="url(#cc{uid})"><rect width="120" height="120" fill="{bg}"/><g transform="translate(60 74) scale(1.24) translate(-60 -66)">'
            f'{_hair_back(hair, hair_c)}{neck}{top}{face}{_hair_front(hair, hair_c)}{_acc(acc)}</g></g></svg>')


# Teints (clair, mat, foncé) et ombres associées.
SK = {'l': ('#F8D7BF', '#E9B79A'), 'm': ('#E1A97F', '#C98B62'), 'd': ('#9C6644', '#7E4F33'), 'p': ('#F3C9A6', '#DEA987')}

TEAM = [
    # rôle, sous-titre, tâche, personnage
    ('Directeur créatif', 'Angle et accroche', "Trouve l'angle et l'accroche qui parlent à votre cible.",
     dict(skin=SK['l'][0], shade=SK['l'][1], hair='bob', hair_c='#2B2236', shirt='#F6B73C', bg='#FFF3D6', acc='glasses', lips=True)),
    ('Rédacteur', 'Script et textes', 'Écrit le script de la vidéo et les textes de la pub.',
     dict(skin=SK['m'][0], shade=SK['m'][1], hair='curly', hair_c='#4A2F22', shirt='#3FA37A', bg='#DDF5EA', acc='pencil', collar='hoodie')),
    ('Acteur UGC', '500+ profils', 'Plus de 500 acteurs IA réalistes, ou votre propre visage.',
     dict(skin=SK['p'][0], shade=SK['p'][1], hair='long', hair_c='#8A5634', shirt='#F27BA8', bg='#FDE6F0', acc='earrings', lips=True)),
    ('Monteur vidéo', 'Montage et sous-titres', 'Coupe, sous-titre, ajoute la musique et livre chaque format.',
     dict(skin=SK['d'][0], shade=SK['d'][1], hair='buzz', hair_c='#1F1712', shirt='#2D2A3E', bg='#E4E2F7', acc='headset', beard=True, blush=False)),
    ('Graphiste', 'Visuels et carrousels', 'Crée vos visuels et carrousels aux bons ratios pour Meta.',
     dict(skin=SK['l'][0], shade=SK['l'][1], hair='bun', hair_c='#E07A5F', shirt='#7C6CF2', bg='#ECE8FF', lips=True)),
    ('Media buyer', 'Publication et budgets', 'Publie sur Meta et ajuste vos budgets chaque jour.',
     dict(skin=SK['p'][0], shade=SK['p'][1], hair='short', hair_c='#3B2A20', shirt='#2F4B8F', bg='#E1ECFF', collar='blazer')),
    ('Analyste', 'Résultats et leads', 'Lit vos résultats et vos leads, et vous dit quoi faire ensuite.',
     dict(skin=SK['d'][0], shade=SK['d'][1], hair='afro', hair_c='#22170F', shirt='#14A37F', bg='#DBF4EC', acc='glasses', lips=True)),
    ('Veille concurrence', 'Pubs qui marchent', 'Repère les pubs de vos concurrents qui tournent depuis longtemps.',
     dict(skin=SK['m'][0], shade=SK['m'][1], hair='beanie', hair_c='#E2574C', shirt='#F08A3E', bg='#FFE9DB', beard=True, beard_c='#5A3A28', collar='hoodie')),
]

# Objet de métier affiché en petit badge sur le portrait.
PROPS = [
    '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z"/>',
    '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
    '<path d="M4 11h16v9H4zM4 11l2.5-6 13 3-1 3M9 6l1.5 4M14 7l1.5 4"/>',
    '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.4-1.6-1.6-1.6-3 0-1 .8-1.6 1.8-1.6H16a5 5 0 0 0 5-5c0-3.7-4-6.8-9-6.8Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
    '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM16 8a5 5 0 0 1 0 8"/>',
    '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
]


def node(i):
    role, sub, task, ch = TEAM[i]
    return ('<div class="tm-node" data-i="%d" data-task="%s"><span class="tm-av">%s<i class="tm-prop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</svg></i></span>'
            '<span><b>%s</b><small>%s</small></span></div>') % (i, task.replace('"', '&quot;'), bust(uid=str(i), **ch), PROPS[i], role, sub)


def nodes():
    return '\n  '.join(node(i) for i in range(len(TEAM)))
