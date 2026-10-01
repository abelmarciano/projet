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
import parselmouth
from parselmouth.praat import call
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
    '08': [("Votre prochaine campagne Méta ?", FAST), ("Elle est à une phrase.", MID), ("Gro-siti !", SLOW), ("Commencez !", MID)],
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


RANGE = 1.9  # pitch-range expansion (1 = untouched)
LIFT = 2.0  # semitones up overall, brighter "ad" voice


def animate(x, sr, kind):
    """Exaggerate the melody: wider pitch range, brighter, and an ad-style
    contour per sentence (rise-fall on '!', strong rise on '?')."""
    snd = parselmouth.Sound(x, sampling_frequency=sr)
    man = call(snd, 'To Manipulation', 0.01, 90, 450)
    tier = call(man, 'Extract pitch tier')
    n = call(tier, 'Get number of points')
    if n < 3:
        return x
    pts = [(call(tier, 'Get time from index', i), call(tier, 'Get value at index', i)) for i in range(1, n + 1)]
    mean = float(np.exp(np.mean([np.log(f) for _, f in pts])))
    dur = snd.duration
    call(tier, 'Remove points between', 0, dur)
    for t, f in pts:
        u = t / dur
        st = LIFT + RANGE * 12 * np.log2(f / mean) - 12 * np.log2(f / mean)  # widen around the mean
        if kind == '!':
            st += 3.0 * np.exp(-((u - 0.7) / 0.18) ** 2) - 2.0 * max(0, u - 0.88) / 0.12
        elif kind == '?':
            st += 5.0 * max(0, u - 0.65) / 0.35
        else:
            st += 1.5 * np.exp(-((u - 0.25) / 0.2) ** 2)
        call(tier, 'Add point', t, f * 2 ** (st / 12))
    call([tier, man], 'Replace pitch tier')
    out = call(man, 'Get resynthesis (overlap-add)')
    return out.values[0]


def punch(x, sr):
    """Clean broadcast chain: no saturation, just EQ + gentle compression."""
    x = sosfilt(butter(2, 110, 'high', fs=sr, output='sos'), x)
    # tame the boomy / "too close to the mic" low-mids (~250 Hz)
    low_mid = sosfilt(butter(2, [180, 350], 'bandpass', fs=sr, output='sos'), x)
    x = x - 0.35 * low_mid
    # light air, then soften harsh highs
    x = x + 0.15 * sosfilt(butter(2, 4000, 'high', fs=sr, output='sos'), x)
    x = sosfilt(butter(2, 9000, 'low', fs=sr, output='sos'), x)
    # soft-knee compressor, 2.5:1 above -20 dBFS, 8 ms attack / 120 ms release
    x = x / (np.abs(x).max() + 1e-9)
    env = np.abs(x)
    a, r = np.exp(-1 / (0.008 * sr)), np.exp(-1 / (0.12 * sr))
    e = np.zeros_like(env)
    for i in range(1, len(env)):
        c = a if env[i] > e[i - 1] else r
        e[i] = c * e[i - 1] + (1 - c) * env[i]
    thr = 10 ** (-20 / 20)
    gain = np.where(e > thr, (thr * (e / thr) ** (1 / 2.5)) / np.maximum(e, 1e-9), 1.0)
    x = x * gain
    return x * (10 ** (-3 / 20)) / np.abs(x).max()  # peak at -3 dBFS, never clipped


os.makedirs('public/vo', exist_ok=True)
for n, lines in TAKES.items():
    parts = []
    for text, ls in lines:
        sr, x = say(text, ls)
        kind = text.strip()[-1] if text.strip()[-1] in '!?' else '.'
        x = animate(x, sr, kind)
        parts += [x, np.zeros(int(GAP * sr))]
    take = punch(np.concatenate(parts[:-1]), sr)
    wavfile.write(f'public/vo/{n}.wav', sr, (take * 32767).astype(np.int16))
    print(n, round(len(take) / sr, 2), 's')
