"""Musique + sound design de la pub « arrête d'acheter tes leads » 16:9 → public/golive/bed.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
TLJ = json.load(open('src/golive/timeline.json'))
T = TLJ['S']
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.004, r=5.0, h=(1, 0.35, 0.12)):
    t = np.arange(int(d * SR)) / SR
    return sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h)) * np.minimum(1, t / a) * np.exp(-t * r)
def sub(d=1.0, f=46):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f * 1.7 * np.exp(-t * 4) + f) * t) * np.exp(-t * 2.8)
bpm = 112; bt = 60 / bpm; bar = bt * 4
chords = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]]
piano = [[64, 67, 72], [60, 64, 69], [57, 60, 65], [59, 62, 67]]
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.3) * np.exp(-tt * 0.2)
    add(mus, lp(pad, 2600), at, 0.13)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.7, h=(1, 0.5, 0.2)), 300), at, 0.28)
    for q, m in enumerate(piano[b % 4] + piano[b % 4][::-1][1:] + [piano[b % 4][1]]):
        add(mus, tone(m + 12, 0.7, r=3.5, h=(1, 0.25, 0.05)), at + q * bt / 2, 0.05)
    b += 1
i = 0
while i * bt < s('total') - 0.5:
    at = i * bt
    if at >= s('prompt') - 0.05 and at < s('end') - 0.3:
        add(mus, kick(), at, 0.3)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.1)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.05)
    i += 1
env = np.ones(n) * 0.85
tl = int((s('total') - 1.5) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.85, 0, te - tl); env[te:] = 0
mus *= env
add(sfx, sub(1.2, 44), 0.2, 0.4); add(sfx, chime(84), 0.25, 0.2); add(sfx, chime(91), 0.45, 0.18)
for i in range(7): add(sfx, pop_sfx(), (40 + i * 4) / 30, 0.18)
for k in ['prompt', 'brand', 'product', 'actor', 'video', 'meta', 'perf', 'social', 'wa']:
    add(sfx, whoosh(0.4), s(k) - 0.12, 0.25); add(sfx, sub(0.6, 52), s(k) + 0.03, 0.2)
for j in range(0, 60, 2): add(sfx, click(1.0 + 0.5 * rng.random()), s('prompt') + 1.6 + j / 30, 0.07)
add(sfx, boom(), s('end'), 0.4); add(sfx, sub(1.4, 42), s('end'), 0.45); add(sfx, chime(81), s('end') + 1.2, 0.25); add(sfx, chime(88), s('end') + 1.35, 0.2)
mix = (mus + sfx * 0.4)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.42
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/golive', exist_ok=True)
wavfile.write('public/golive/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
