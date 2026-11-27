"""Musique « pub haut de gamme » (house tropicale 125 bpm, pompe sidechain, mélodie pluck) + whooshs/impacts sur les coupes.
Lit src/luxe/cuts.json {total, cuts:[s...], end:s} → public/media/pov-luxe/bed.wav"""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'rng'])
C = json.load(open('src/luxe/cuts.json')); total = C['total']
n = int(total * SR) + SR; drums = np.zeros(n); syn = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, t, gain=1.0):
    i = int(t * SR)
    if 0 <= i < n: x = x[: n - i]; buf[i:i + len(x)] += x * gain
bpm = 125; bt = 60 / bpm; bar = 4 * bt
prog = [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61], [52, 56, 59, 64]]  # A  F#m  D  E
mel = [76, 73, 71, 73, 76, 78, 76, 73, 71, 69, 71, 73, 69, 68, 69, 71]
def pluck(m, d):
    t = np.arange(int(d * SR)) / SR; f = note(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.15 * np.sin(6 * np.pi * f * t)
    return s * np.exp(-t * 9) * np.minimum(1, t / 0.003)
def pad(ms, d):
    t = np.arange(int(d * SR)) / SR
    s = sum(np.sin(2 * np.pi * note(m) * t * (1 + 0.002 * k)) + 0.5 * np.sin(2 * np.pi * note(m) * t * 1.005) for k, m in enumerate(ms)) / len(ms)
    return lp(s, 2400) * np.minimum(1, t / 0.08)
def bassn(m, d):
    t = np.arange(int(d * SR)) / SR; f = note(m)
    return lp(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t), 380) * np.minimum(1, t / 0.01) * np.exp(-t * 2.5)
def clap():
    m = int(0.2 * SR); t = np.arange(m) / SR
    return hp(rng.standard_normal(m), 1500) * (np.exp(-t * 28) + 0.6 * np.exp(-((t - 0.01) * 250) ** 2))
end = C['end']
b = 0
while b * bar < total:
    t0 = b * bar; ch = prog[b % 4]
    add(syn, pad(ch, bar), t0, 0.22)
    b += 1
i = 0
while i * bt < total:
    t = i * bt; ch = prog[int(t // bar) % 4]
    add(drums, kick(), t, 1.0)
    if i % 2 == 1: add(drums, clap(), t, 0.42)
    for k in range(2): add(drums, hp(rng.standard_normal(int(0.025 * SR)), 9000) * np.exp(-np.arange(int(0.025 * SR)) / SR * 140), t + bt * (0.5 if k == 0 else 0.75), 0.15 if k == 0 else 0.07)
    add(syn, bassn(ch[0] - 24, bt * 0.4), t + bt / 2, 0.55)
    for j in range(2):
        add(syn, pluck(mel[(i * 2 + j) % 16], bt * 0.45), t + j * bt / 2, 0.16)
    i += 1
# pompe sidechain sur le synthé
pump = np.ones(n); L = int(bt * SR)
for k in range(0, n, L): seg = min(L, n - k); pump[k:k + seg] = 0.35 + 0.65 * np.minimum(1, np.arange(seg) / (0.42 * L))
syn *= pump
for c in C['cuts'][1:]:
    add(sfx, whoosh(0.22), c - 0.12, 0.10)
add(sfx, boom(), 0.0, 0.35); add(sfx, boom(), end, 0.45); add(sfx, whoosh(0.5), end - 0.35, 0.25)
add(sfx, chime(88), end + 0.35, 0.18); add(sfx, chime(84), end + 0.55, 0.15)
if 'notif' in C: add(sfx, chime(91), C['notif'], 0.25); add(sfx, chime(96), C['notif'] + 0.09, 0.2)
mix = drums * 0.9 + syn + sfx * 0.6
mix = mix[: int(total * SR)]
f = int(0.7 * SR); mix[-f:] *= np.linspace(1, 0, f)
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.8) * 0.62
d = int(0.012 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.82 + mix * 0.18], 1)
wavfile.write('public/media/pov-luxe/bed.wav', SR, (st * 32767).astype(np.int16)); print('ok', round(total, 2))
