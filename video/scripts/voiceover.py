"""Punchy ad-style voice-over, synthesised offline with Piper.

Voice: fr-siwis-medium (https://github.com/rhasspy/piper/releases/tag/v0.0.2).
Each take is built sentence by sentence so every line gets its own pace,
then glued with tight gaps and a "radio ad" chain (presence + compression).
Phonetic spellings: "Gro-siti" = Growthity, "pubes" = pubs, "u gé cé" = UGC.

Run: PIPER_MODEL=/path/fr-siwis-medium.onnx python3 scripts/voiceover.py
Writes public/vo/NN.wav
"""
import os
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

MODEL = os.environ.get('PIPER_MODEL', 'fr-siwis-medium.onnx')
FAST, MID, SLOW = 0.74, 0.8, 0.88  # Piper length-scale (lower = faster)
GAP = 0.12  # seconds between sentences

TAKES = {
    '01': [("Une agence ?", FAST), ("Deux semaines ?", FAST), ("Trois mille euros ?", FAST), ("Et si une seule phrase suffisait !", MID)],
    '02': [("Avec Gro-siti, vos pubes Méta sont créées, et publiées !", FAST), ("En deux minutes chrono.", MID)],
    '03': [
        ("Vous décrivez votre produit.", FAST),
        ("Une phrase, c'est tout !", FAST),
        ("Gro-siti écrit le script, choisit l'actrice, et tourne la vidéo !", FAST),
        ("Le résultat ?", FAST),
        ("Une vraie vidéo u gé cé, sous-titrée, prête à publier !", MID),
    ],
    '04': [("Plus de cinq cents acteurs i a !", FAST), ("Des voix françaises, ultra naturelles.", FAST), ("Le vôtre est forcément là !", MID)],
    '05': [("Vidéo !", MID), ("Image !", MID), ("Carrousel !", MID), ("Tous les formats Méta, depuis un seul brief.", FAST)],
    '06': [("En manque d'inspiration ?", FAST), ("Gro-siti repère les pubes qui cartonnent dans votre marché, et s'en inspire pour vous !", FAST)],
    '07': [("Un clic !", MID), ("Et votre campagne est en ligne, sur Facebook et Instagram !", FAST)],
    '08': [("Votre prochaine campagne Méta ?", FAST), ("Elle est à une phrase.", MID), ("Gro-siti !", SLOW), ("Lancez-vous, c'est gratuit !", MID)],
}


def say(text, ls, sr_out=None):
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        subprocess.run(
            ['python3', '-m', 'piper', '-m', MODEL, '-f', t.name, '--length-scale', str(ls),
             '--noise-scale', '0.85', '--noise-w-scale', '1.0', '--sentence-silence', '0'],
            input=text.encode(), check=True, capture_output=True,
        )
        sr, x = wavfile.read(t.name)
    x = x.astype(float) / 32768
    # trim leading/trailing silence
    idx = np.where(np.abs(x) > 0.02)[0]
    if len(idx):
        x = x[max(0, idx[0] - int(0.02 * sr)) : idx[-1] + int(0.06 * sr)]
    return sr, x


def punch(x, sr):
    x = sosfilt(butter(2, 100, 'high', fs=sr, output='sos'), x)
    x = x + 0.5 * sosfilt(butter(2, 2500, 'high', fs=sr, output='sos'), x)  # presence
    x = np.tanh(x * 3.0) / np.tanh(3.0)  # radio-style compression
    return x * 0.9 / np.abs(x).max()


os.makedirs('public/vo', exist_ok=True)
for n, lines in TAKES.items():
    parts = []
    for text, ls in lines:
        sr, x = say(text, ls)
        parts += [x, np.zeros(int(GAP * sr))]
    take = punch(np.concatenate(parts[:-1]), sr)
    wavfile.write(f'public/vo/{n}.wav', sr, (take * 32767).astype(np.int16))
    print(n, round(len(take) / sr, 2), 's')
