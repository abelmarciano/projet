"""Musique + bruitages du short « Défi » (src/defi/DefiAd.tsx) → public/media/defi/bed.wav (les voix restent dans les clips)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
C = json.load(open('src/defi/defi.json')); at = 0; S = []
for s in C['segs']: d = round((s['to'] - s['from']) * 30); S.append((at, d)); at += d
END = at / 30; total = END + 45 / 30
n = int(total * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, t, gain=1.0):
    i = int(t * SR)
    if 0 <= i < len(buf): x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
bpm = 120; bt = 60 / bpm; bar = bt * 4
chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
b = 0
while b * bar < total:
    tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.15) * np.exp(-tt * 0.3)
    add(mus, lp(pad, 2600), b * bar, 0.10); b += 1
i = 0
while i * bt < total - 0.4:
    t = i * bt
    if t > 0.4: add(mus, kick(), t, 0.30)
    add(mus, hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180), t + bt / 2, 0.05); i += 1
env = np.ones(n); a0 = S[2][0] / 30; a1 = S[5][0] / 30
env[int(a0 * SR):int(a1 * SR)] = 0.55  # plus discret sous la pub de Salomé
tl = int((total - 0.9) * SR); te = int(total * SR); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0; mus *= env
add(sfx, pop_sfx(), 0.05, 0.4)  # sticker commentaire
c0, r0 = C['chronoAt'] / 30, C['readyAt'] / 30
add(sfx, pop_sfx(), c0, 0.35)
t = c0 + 0.25
while t < r0 - 0.05: add(sfx, click(2.2), t, 0.12); t += 0.25  # tic-tac
for k in range(0, 40, 3): add(sfx, click(1.0 + 0.5 * rng.random()), C['typeFrom'] / 30 + 0.9 + k / 30, 0.06)  # frappe
add(sfx, chime(84), r0, 0.3); add(sfx, chime(88), r0 + 0.1, 0.25)
for j in (2, 5): add(sfx, whoosh(0.45), S[j][0] / 30 - 0.2, 0.3)
add(sfx, boom(), S[2][0] / 30, 0.3)
add(sfx, pop_sfx(), (S[5][0] + round(S[5][1] * 0.45)) / 30, 0.35)
add(sfx, whoosh(0.4), END - 0.2, 0.25); add(sfx, chime(81), END + 0.3, 0.22); add(sfx, chime(88), END + 0.45, 0.2)
mix = (mus + sfx * 0.5)[: int(total * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.22
d = int(0.012 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
wavfile.write('public/media/defi/bed.wav', SR, (st * 32767).astype(np.int16)); print('ok', round(total, 2))
