"""Prépare des variantes 'vides' des vraies captures pour les animer dans Remotion.
- dashboard-graph-vide.png : graphique sans barres (les barres réelles sont révélées par le bas)
- planning-vide.png        : planning sans cartes RDV (révélées jour par jour)
Coordonnées en px CSS (captures en deviceScaleFactor 2)."""
from PIL import Image
import colorsys, os
S = 2
SRC = os.path.join(os.path.dirname(__file__), '..', '..', 'screenshots')
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'derived')
os.makedirs(OUT, exist_ok=True)

def colored(p):
    mx, mn = max(p[:3]), min(p[:3])
    return mx > 0 and (mx - mn) / mx > 0.06

# --- graphique : on efface les pixels colorés de la zone de tracé
im = Image.open(f'{SRC}/dashboard.png').convert('RGB')
px = im.load()
x0, x1, y0, y1 = 100 * S, 880 * S, 425 * S, 594 * S
for y in range(y0, y1):
    last = px[x0, y]
    for x in range(x0, x1):
        if colored(px[x, y]): px[x, y] = last
        else: last = px[x, y]
im.save(f'{OUT}/dashboard-vide.png')

# --- planning : chaque colonne jour remplacée par une colonne de fond étirée
im = Image.open(f'{SRC}/planning-semaine.png').convert('RGB')
px = im.load()
W, H = im.size
cols = [113, 500, 887, 1275, 1663, 1887]
for a, b in zip(cols, cols[1:]):
    sx = (a + 5) * S
    for y in range(215 * S, 1068 * S):
        p = px[sx, y]
        for x in range((a + 2) * S, (b - 2) * S):
            px[x, y] = p
im.save(f'{OUT}/planning-vide.png')
print('ok')

# Résultat d'itinéraire réellement calculé par l'app pendant la capture
import shutil
shutil.copy(f'{SRC}/planning-optimizer.json', os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'itineraire.json'))
