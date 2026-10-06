"""Bande-son originale de la vidéo Classicall, synthétisée (aucune licence nécessaire),
calée sur src/data/timing.json, puis mixée avec la voix off (public/vo/NN.wav).

- Musique : pop corporate lumineuse, 110 BPM ; intro feutrée, version sombre et filtrée pendant
  la scène « problème », puis groove complet à partir de la solution.
- Niveau : musique à -18 dB sous la voix pendant qu'elle parle, remonte à -11 dB dans les pauses,
  fondu d'entrée 1 s et fondu de sortie 2,5 s.
Écrit public/bande-son.wav (48 kHz stéréo). Usage : python3 scripts/soundtrack.py
"""
import json
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000
TL = json.load(open(os.path.join(ROOT, 'src', 'data', 'timing.json')))
FPS, OV = TL['fps'], TL['overlap']
SC = {s['id']: s for s in TL['scenes']}
DUR = TL['total'] / FPS
N = int(DUR * SR) + SR
rng = np.random.default_rng(11)


def t_of(sid, frame=0):
    return (SC[sid]['start'] + frame) / FPS


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


L, R = np.zeros(N), np.zeros(N)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


BPM = 110
BEAT = 60 / BPM
BAR = 4 * BEAT
# Progression lumineuse : Dmaj9 – Bm7 – Gmaj7 – A6sus
PROG = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 62], [43, 47, 50, 54, 59], [45, 50, 52, 54, 57]]
ROOTS = [38, 35, 31, 33]
# Version sombre pour le problème : Bm – G – Em – F#sus
DARK = [[47, 50, 54, 59], [43, 47, 50, 55], [40, 43, 47, 52], [42, 47, 49, 54]]

prob0, prob1 = t_of('02-probleme'), t_of('03-solution')
groove0 = t_of('03-solution')
end_groove = t_of('14-cloture', 40)

# ---------- nappe (toute la durée) ----------
for b in range(int(DUR / BAR) + 2):
    t0 = b * BAR
    dark = prob0 - 0.3 <= t0 < prob1 - 0.5
    chord = DARK[b % 4] if dark else PROG[b % 4]
    n = int((BAR + 0.8) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in chord:
        for det in (-0.07, 0.0, 0.06):
            sig += 2 * ((tt * note(m + det) + rng.random()) % 1) - 1
    cutoff = 700 if dark else 1500 + 500 * np.sin(b * 0.6)
    sig = lp(sig, cutoff) / 15 * env(n, 0.6, 0.8)
    add(sig, t0, 0.30, pan=-0.2 if b % 2 else 0.2)

beats = np.arange(0, DUR + BEAT, BEAT)


def kick():
    n = int(0.42 * SR)
    tt = np.arange(n) / SR
    f = 48 + 90 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 8)


K = kick()
for i, bt in enumerate(beats):
    if groove0 <= bt < end_groove:
        add(K, bt, 0.50)
    elif prob0 + 0.5 <= bt < prob1 and i % 2 == 0:  # pulsation sourde pendant le problème
        add(lp(K, 300), bt, 0.45)

# basse en croches
for b in range(int(DUR / BAR) + 1):
    for k in range(8):
        at = b * BAR + k * BEAT / 2
        if not (groove0 <= at < end_groove):
            continue
        n = int(BEAT / 2 * SR)
        tt = np.arange(n) / SR
        f = note(ROOTS[b % 4])
        s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)
        add(s * env(n, 0.01, 0.06) * (0.5 if k % 2 == 0 else 1.0), at, 0.20)

# charleston sur les contretemps + clap sur 2 et 4 (à partir des statistiques)
hats0 = t_of('04-statistiques')
for i, bt in enumerate(beats):
    if hats0 <= bt + BEAT / 2 < end_groove:
        n = int(0.05 * SR)
        add(hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR * 80), bt + BEAT / 2, 0.06, pan=0.3)
    if t_of('05-tableau-leads') <= bt < end_groove and i % 2 == 1:
        n = int(0.16 * SR)
        add(lp(hp(rng.standard_normal(n), 1200), 5000) * np.exp(-np.arange(n) / SR * 24), bt, 0.08, pan=-0.1)

# arpège pluck en doubles croches (à partir du tableau des leads), avec écho stéréo
pl0 = t_of('05-tableau-leads')
for b in range(int(DUR / BAR) + 1):
    chord = PROG[b % 4]
    pat = [0, 2, 4, 2, 1, 3, 4, 3]
    for k in range(16):
        at = b * BAR + k * BEAT / 4
        if not (pl0 <= at < end_groove):
            continue
        m = chord[pat[k % 8]] + 12
        n = int(0.3 * SR)
        tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 15)
        add(s, at, 0.055, pan=-0.35)
        add(s, at + BEAT * 0.75, 0.028, pan=0.45)


# ---------- habillage sonore ----------
def whoosh(dur=0.7):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for i in range(0, n, 512):
        p = i / n
        out[i:i + 512] = lp(noise[i:i + 512], min(300 + 5500 * p ** 1.5, 18000), 1)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


def boom():
    n = int(1.5 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(34 + 60 * np.exp(-tt * 10)) / SR) * np.exp(-tt * 2.8)


def chime(base=74):
    n = int(1.3 * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for i, m in enumerate([base, base + 4, base + 7, base + 12]):
        d = int(i * 0.07 * SR)
        s[d:] += np.sin(2 * np.pi * note(m) * tt[:n - d]) * np.exp(-tt[:n - d] * 4)
    return s


def tick():
    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 90)


ids = [s['id'] for s in TL['scenes']]
for i, sid in enumerate(ids[1:]):
    add(whoosh(0.75), t_of(sid, OV / 2) - 0.38, 0.22, pan=0.4 if i % 2 else -0.4)
add(boom(), 0.15, 0.45)  # ouverture
add(chime(74), t_of('01-ouverture', 6), 0.10)  # logo
add(boom(), groove0, 0.55)  # la solution arrive
for k in range(4):  # cartes métriques
    add(tick(), t_of('03-solution', 22 + k * 12), 0.10, pan=(k - 1.5) * 0.3)
for k in range(5):  # filtres cochés en cascade
    add(tick(), t_of('06-filtres', 10 + k * 15), 0.09, pan=0.3)
add(chime(81), t_of('07-doublons', 70), 0.08)  # infobulle doublon
add(chime(79), t_of('10-optimiseur', 160), 0.09)  # total de l'itinéraire
add(chime(86), t_of('12-api-ia', 96), 0.07)  # notification de lead
add(boom(), t_of('13-prix', 4), 0.5)  # prix
add(chime(74), t_of('13-prix', 50), 0.12)
add(boom(), t_of('14-cloture', 2), 0.6)
n = int(4 * SR)
tt = np.arange(n) / SR
final = sum(np.sin(2 * np.pi * note(m) * tt) for m in [50, 57, 61, 64, 69]) * np.exp(-tt * 1.0) / 5
add(final, t_of('14-cloture', 20), 0.22)

# réverbération légère
mix = np.stack([L, R])
irn = int(1.6 * SR)
it = np.arange(irn) / SR
for c in range(2):
    ir = lp(rng.standard_normal(irn) * np.exp(-it * 3.4), 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    mix[c] = mix[c] + 0.25 * fftconvolve(mix[c], ir)[:mix.shape[1]]
mix = hp(mix, 30)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)

# ---------- voix ----------
voice = np.zeros(mix.shape[1])
spans = []
for i, s in enumerate(TL['scenes']):
    p = os.path.join(ROOT, 'public', 'vo', f'{i + 1:02d}.wav')
    vsr, v = wavfile.read(p)
    v = resample_poly(v.astype(float) / 32768, SR, vsr)
    at = int((s['start'] / FPS + TL['lead']) * SR)
    v = v[:max(0, len(voice) - at)]
    voice[at:at + len(v)] += v
    spans.append((at / SR, (at + len(v)) / SR))

rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
talk = np.zeros(mix.shape[1], bool)
for a, b in spans:
    talk[int(a * SR):int(b * SR)] = True
v_rms = rms(voice[talk])
m_rms = rms(mix.mean(axis=0))
# gain musique : -18 dB sous la voix quand elle parle, -11 dB dans les pauses (rampes de 0,3 s)
g_talk = v_rms / m_rms * 10 ** (-18 / 20)
g_gap = v_rms / m_rms * 10 ** (-11 / 20)
tt = np.arange(mix.shape[1]) / SR
duck = np.zeros_like(tt)
for a, b in spans:
    ramp = np.clip(np.minimum((tt - (a - 0.3)) / 0.3, ((b + 0.35) - tt) / 0.35), 0, 1)
    duck = np.maximum(duck, ramp)
gain = g_gap + (g_talk - g_gap) * duck
mix = mix * gain

total = int(DUR * SR)
mix = mix[:, :total]
fi, fo = int(1.0 * SR), int(2.5 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
out = mix + np.stack([voice, voice])[:, :total]
out /= np.max(np.abs(out)) / 0.89
wavfile.write(os.path.join(ROOT, 'public', 'bande-son.wav'), SR, (out.T * 32767).astype(np.int16))
print(f'{DUR:.2f} s écrits ; musique -18 dB sous la voix (gain {20 * np.log10(g_talk):.1f} dB)')
