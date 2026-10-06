"""Voix off française synthétisée hors ligne avec Piper (voix fr-siwis-medium).

Une prise par scène, construite phrase par phrase (rythme propre à chaque phrase),
puis traitée façon « pub radio » (passe-haut, présence, compression douce).
Graphies phonétiques : « Classicol » = Classicall, « lides » = leads, « Tchatte Gé Pé Té » = ChatGPT.

Écrit public/vo/NN.wav et src/data/timing.json (durées des scènes en images, calées sur la voix).
Usage : PIPER_MODEL=/chemin/fr-siwis-medium.onnx python3 scripts/voiceover.py
"""
import json
import os
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MODEL = os.environ.get('PIPER_MODEL', 'fr-siwis-medium.onnx')
FPS = 30
OVERLAP = 15  # fondu croisé entre scènes (images)
LEAD = 0.30  # la voix démarre 0,3 s après le début du fondu d'entrée de la scène
TAIL = 0.55  # respiration après la voix avant la transition suivante
GAP = 0.14  # silence entre deux phrases d'une même prise
FAST, MID, SLOW = 0.86, 0.92, 1.0  # length-scale Piper (plus petit = plus rapide)

# (id de scène, durée minimale en images, phrases)
TAKES = [
    ('01-ouverture', 120, [('Tu ouvres ta régie ?', MID)]),
    ('02-probleme', 150, [('Trop de lides,', FAST), ('et zéro organisation ?', MID)]),
    ('03-solution', 135, [('Classicol.', MID), ('Le meilleur CRM pour ta régie.', FAST)]),
    ('04-statistiques', 165, [('Suis tes rendez-vous, tes lides, et tes poses.', FAST)]),
    ('05-tableau-leads', 195, [('Tous tes lides,', FAST), ("en un coup d'œil.", MID)]),
    ('06-filtres', 150, [('Filtre par statut, par département,', FAST), ('ou par campagne.', MID)]),
    ('07-doublons', 150, [('Les doublons ?', FAST), ('Détectés automatiquement.', MID)]),
    ('08-fiche-lead', 195, [('Chaque fiche est complète,', FAST), ("et tout l'historique est conservé.", FAST)]),
    ('09-planning', 210, [('Ton planning commercial est prêt,', FAST), ("pour toute l'équipe.", MID)]),
    ('10-optimiseur', 195, [("L'optimiseur calcule tes tournées :", FAST), ('jamais plus de deux heures de route.', MID)]),
    ('11-comptabilite', 165, [('Comptabilité, commissions, rentabilité :', FAST), ('tout est suivi.', MID)]),
    ('12-api-ia', 165, [('Tes lides arrivent en instantané,', FAST), ('avec les connecteurs Claude et Tchatte Gé Pé Té.', FAST)]),
    ('13-prix', 180, [('Deux cent cinquante euros par mois.', MID), ('Sans engagement,', FAST), ('sans frais de mise en service.', FAST)]),
    ('14-cloture', 165, [('Classicol.', MID), ('Appelle le zéro sept, quatre-vingt-deux, dix-sept, zéro sept, quatre-vingt-un.', SLOW)]),
]


def say(text, ls):
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        subprocess.run(
            ['python3', '-m', 'piper', '-m', MODEL, '-f', t.name, '--length-scale', str(ls),
             '--noise-scale', '0.6', '--noise-w-scale', '0.8', '--sentence-silence', '0'],
            input=text.encode(), check=True, capture_output=True,
        )
        sr, x = wavfile.read(t.name)
    x = x.astype(float) / 32768
    idx = np.where(np.abs(x) > 0.015)[0]
    if len(idx):
        x = x[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
    return sr, x


def process(x, sr):
    x = sosfilt(butter(2, 90, 'high', fs=sr, output='sos'), x)
    # présence : léger relèvement 2,5–6 kHz
    pres = sosfilt(butter(2, [2500, 6000], 'band', fs=sr, output='sos'), x)
    x = x + 0.35 * pres
    # compression douce (enveloppe RMS 20 ms, ratio ~3:1 au-dessus de -20 dBFS)
    win = int(0.02 * sr)
    env = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, mode='same') + 1e-9)
    thr = 10 ** (-20 / 20)
    gain = np.where(env > thr, (thr / env) ** (1 - 1 / 3), 1.0)
    x = x * gain
    return x / (np.max(np.abs(x)) + 1e-9) * 0.9


os.makedirs(os.path.join(ROOT, 'public', 'vo'), exist_ok=True)
timing = []
for i, (sid, min_f, lines) in enumerate(TAKES):
    parts, sr = [], 22050
    for text, ls in lines:
        sr, x = say(text, ls)
        parts += [x, np.zeros(int(GAP * sr))]
    take = process(np.concatenate(parts[:-1]), sr)
    fade = int(0.01 * sr)
    take[:fade] *= np.linspace(0, 1, fade)
    take[-fade:] *= np.linspace(1, 0, fade)
    wavfile.write(os.path.join(ROOT, 'public', 'vo', f'{i + 1:02d}.wav'), sr, (take * 32767).astype(np.int16))
    secs = len(take) / sr
    need = int(np.ceil((LEAD + secs + TAIL) * FPS)) + (OVERLAP if i < len(TAKES) - 1 else 0)
    if i == len(TAKES) - 1:
        need += 45  # on laisse le logo et le numéro à l'écran après la voix
    dur = max(min_f, need)
    timing.append({'id': sid, 'dur': dur, 'vo': round(secs, 3)})
    print(f'{sid:18s} voix {secs:5.2f} s  scène {dur / FPS:5.2f} s')

start = 0
for t in timing:
    t['start'] = start
    start += t['dur'] - OVERLAP
total = timing[-1]['start'] + timing[-1]['dur']
json.dump({'fps': FPS, 'overlap': OVERLAP, 'lead': LEAD, 'total': total, 'scenes': timing},
          open(os.path.join(ROOT, 'src', 'data', 'timing.json'), 'w'), indent=1, ensure_ascii=False)
print(f'Total : {total} images = {total / FPS:.1f} s')
