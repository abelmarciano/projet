"""Musique + bruitages de la pub e-commerce 9:16 (src/ecom/EcomAd.tsx) → public/ecom/bed.wav."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/ecom/words.json'))['ecom-1']; H0 = 108 / 30
def hc(start, d=0):
    for w in W:
        if w['w'].lower().startswith(start): return H0 + w['s']
    return H0 + d
T = {'reveal': H0, 'chat': H0 + 5.48 - 4 / 30, 'meta': H0 + 8.68 - 4 / 30, 'end': H0 + 10.46 - 4 / 30}
total = H0 + W[-1]['e'] + 75 / 30
n = int(total * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if 0 <= i < len(buf): x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.004, r=5.0, h=(1, 0.35, 0.12)):
    t = np.arange(int(d * SR)) / SR
    return sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h)) * np.minimum(1, t / a) * np.exp(-t * r)
bpm = 118; bt = 60 / bpm; bar = bt * 4
chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
b = 0
while b * bar < total:
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.2) * np.exp(-tt * 0.25)
    add(mus, lp(pad, 2800), at, 0.12)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.8, h=(1, 0.5, 0.2)), 320), at, 0.28)
    b += 1
i = 0
while i * bt < total - 0.5:
    at = i * bt
    if at >= T['reveal'] - 0.05 and not (T['end'] - 0.3 < at < T['end'] + 0.8):
        add(mus, kick(), at, 0.38)
    add(mus, hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180), at + bt / 2, 0.05)
    i += 1
env = np.ones(n) * 0.85; env[:int(T['reveal'] * SR)] *= 0.45  # musique discrète sous la voix de Yanis
tl = int((total - 1.2) * SR); te = int(total * SR); env[tl:te] = np.linspace(0.85, 0, te - tl); env[te:] = 0
mus *= env
add(sfx, boom(), T['reveal'], 0.4); add(sfx, whoosh(0.5), T['reveal'] - 0.3, 0.3)
for w in ['photo', 'acteur', 'phrase']: add(sfx, pop_sfx(), hc(w), 0.3)
add(sfx, whoosh(0.45), T['chat'] - 0.15, 0.28)
for j in range(0, 16, 2): add(sfx, click(1.0 + 0.4 * rng.random()), T['chat'] + (4 + j) / 30, 0.08)
for w in ['crée', 'voix', 'sous', 'montage']: add(sfx, pop_sfx(), hc(w), 0.2)
add(sfx, chime(84), hc('montage') + 0.3, 0.25)
add(sfx, whoosh(0.45), T['meta'] - 0.15, 0.28); add(sfx, click(1.6), hc('clic') + 2 / 30, 0.5); add(sfx, chime(88), hc('clic') + 0.3, 0.25)
add(sfx, boom(), T['end'], 0.4); add(sfx, chime(81), T['end'] + 1.0, 0.25); add(sfx, chime(88), T['end'] + 1.1, 0.2)
mix = (mus + sfx * 0.42)[: int(total * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/ecom', exist_ok=True); wavfile.write('public/ecom/bed.wav', SR, (st * 32767).astype(np.int16)); print('ok', round(total, 2))
