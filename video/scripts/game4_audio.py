"""Musique « jeu en monde ouvert » (beat west-coast original, synthétisé) + bruitages pour src/game4/GameAd2.tsx → public/game4/bed.wav."""
import os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
F = 30; T = {'aerial': 60, 's1': 135, 's2': 285, 's3': 435, 's4': 585, 'end': 795, 'total': 900}
s = lambda k: T[k] / F; total = s('total')
n = int(total * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if 0 <= i < len(buf): x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def env(d, a=0.005, r=6.0):
    t = np.arange(int(d * SR)) / SR; return np.minimum(1, t / a) * np.exp(-t * r)
def saw(m, d, r=3.0):
    t = np.arange(int(d * SR)) / SR; f = note(m)
    return (2 * ((t * f) % 1) - 1) * env(d, 0.01, r)
def snare():
    d = 0.22; t = np.arange(int(d * SR)) / SR
    return (hp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 18) * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5)
def hat(d=0.05): t = np.arange(int(d * SR)) / SR; return hp(rng.standard_normal(len(t)), 8000) * np.exp(-t * 90)
def sub808(m, d):
    t = np.arange(int(d * SR)) / SR; f = note(m)
    return np.tanh(np.sin(2 * np.pi * f * t) * 2.2) * np.exp(-t * 1.6) * np.minimum(1, t / 0.01)
bpm = 94; bt = 60 / bpm; bar = 4 * bt
prog = [38, 38, 41, 36]  # D, D, F, C (graves)
stab = [[62, 65, 69], [62, 65, 69], [65, 69, 72], [60, 64, 67]]
start = s('aerial') - 0.1
b = 0
while start + b * bar < s('end') + 0.2:
    at = start + b * bar; c = b % 4
    for k in [0, 2.5]: add(mus, kick(), at + k * bt, 0.55)
    for k in [1, 3]: add(mus, snare(), at + k * bt, 0.4)
    for k in range(8): add(mus, hat(), at + k * bt / 2, 0.12 if k % 2 else 0.07)
    add(mus, sub808(prog[c], bar * 0.9), at, 0.42)
    for k in [0, 1.5]:
        for m in stab[c]: add(mus, lp(saw(m, 0.35, 5), 2600), at + k * bt, 0.05)
    lead = [74, 72, 69, 67] if c < 3 else [72, 74, 76, 74]
    for k, m in enumerate(lead): add(mus, lp(saw(m, 0.28, 7), 3500), at + (2 + k * 0.5) * bt, 0.035)
    b += 1
# intro : nappe + montée
t = np.arange(int(s('aerial') * SR)) / SR
pad = sum(np.sin(2 * np.pi * note(m) * t) for m in [50, 57, 62, 65]) / 4 * np.minimum(1, t / 1.0)
add(mus, lp(pad, 1800), 0, 0.18)
# fin : accord tenu
t = np.arange(int((total - s('end')) * SR)) / SR
add(mus, sum(np.sin(2 * np.pi * note(m) * t) for m in [50, 57, 62, 66, 69]) / 5 * np.exp(-t * 0.6), s('end'), 0.25)
e = np.ones(n) * 0.55; tl = int((total - 0.8) * SR); te = int(total * SR); e[tl:te] = np.linspace(0.55, 0, te - tl); e[te:] = 0; mus *= e
# bruitages
for i in range(9): add(sfx, click(1.3), (14 + i * 3) / F, 0.35)  # lettres tapées
add(sfx, boom(), 44 / F, 0.45); add(sfx, whoosh(0.5), s('aerial') - 0.2, 0.35)
def cash(up=True):
    d = 0.5; t = np.arange(int(d * SR)) / SR
    bell = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 8) for f in ([2093, 2637, 3136] if up else [523, 415]))
    return bell * 0.3 + hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 40) * 0.4
for k, c in [('s1', 203), ('s2', 341), ('s3', 485)]:
    add(sfx, whoosh(0.45), s(k) - 0.15, 0.3)
    add(sfx, pop_sfx(), s(k) + 8 / F, 0.25)
    add(sfx, cash(False), c / F, 0.5)
add(sfx, boom(), 534 / F, 0.5)
add(sfx, chime(88), s('s4') + 2 / F, 0.3); add(sfx, chime(95), s('s4') + 7 / F, 0.25)
add(sfx, whoosh(0.5), s('s4') - 0.2, 0.35)
for tt in [30, 44, 56, 68, 80, 92, 104, 116, 128, 140]: add(sfx, cash(True), s('s4') + tt / F, 0.35)
for i, m in enumerate([72, 76, 79, 84]): add(sfx, chime(m), s('s4') + (150 + i * 4) / F, 0.3)
add(sfx, boom(), s('end'), 0.4)
mix = (mus + sfx * 0.5)[: int(total * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.5
d = int(0.012 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/game4', exist_ok=True); wavfile.write('public/game4/bed.wav', SR, (st * 32767).astype(np.int16)); print('ok', round(total, 2))
