"""Musique + sound design de la pub « arrête d'acheter tes leads » 16:9 → public/duel2/bed.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/duel2/words.json'))
TLJ = json.load(open('src/duel2/timeline.json'))
VO = {int(k): v for k, v in TLJ['VO'].items()}
T = TLJ['S']
def cue(k, start, d=0):
    for w in W[f'dr-{k}']:
        if w['w'].lower().startswith(start): return (VO[k] + round(w['s'] * 30)) / 30
    return (VO[k] + d * 30) / 30
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
def tick():
    t = np.arange(int(0.05 * SR)) / SR
    return np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)
bpm = 124; bt = 60 / bpm; bar = bt * 4
chords = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]]
piano = [[64, 67, 72], [60, 64, 69], [57, 60, 65], [59, 62, 67]]
reveal = cue(3, 'raté', 0.1)
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.2) * np.exp(-tt * 0.25)
    add(mus, lp(pad, 3000), at, 0.12)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.8, h=(1, 0.5, 0.2)), 320), at, 0.3)
    for q, m in enumerate(piano[b % 4] + piano[b % 4][::-1][1:] + [piano[b % 4][1]]):
        add(mus, tone(m + 12, 0.6, r=4, h=(1, 0.25, 0.05)), at + q * bt / 2, 0.05)
    b += 1
i = 0
while i * bt < s('total') - 0.5:
    at = i * bt
    if at >= reveal - 0.05 and not (s('end') - 0.3 < at < s('end') + 1.0):
        add(mus, kick(), at, 0.42)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.14)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.06)
    i += 1
env = np.ones(n) * 0.9
tl = int((s('total') - 1.0) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.9, 0, te - tl); env[te:] = 0
env[int(s('count') * SR):int(reveal * SR)] *= 0.35
mus *= env
add(sfx, whoosh(0.4), 0.05, 0.3); add(sfx, pop_sfx(), 0.15, 0.3); add(sfx, pop_sfx(), 0.3, 0.3)
add(sfx, pop_sfx(), cue(1, 'lequel', 4.2), 0.35)
for k in range(int((reveal - s('count')) * 4)): add(sfx, tick(), s('count') + k * 0.25, 0.25)
for w in ['trois', 'deux', 'un']: add(sfx, sub(0.5, 60), cue(2, w), 0.4); add(sfx, tone(76, 0.3, r=8), cue(2, w), 0.2)
for d in [0, 9, 18]: add(sfx, pop_sfx(), s('count') + d / 30, 0.25)
add(sfx, boom(), reveal, 0.55); add(sfx, sub(1.4, 40), reveal, 0.6); add(sfx, chime(84), reveal + 0.05, 0.25); add(sfx, chime(91), reveal + 0.25, 0.22)
for j in range(0, 40, 2): add(sfx, click(1.0 + 0.5 * rng.random()), s('make') + 4 / 30 + j / 30, 0.09)
for w in ['choisis', 'voix', 'sous-titres']: add(sfx, pop_sfx(), cue(4, w), 0.3); add(sfx, chime(86), cue(4, w) + 0.04, 0.12)
for k in ['make', 'pub']: add(sfx, whoosh(0.45), s(k) - 0.15, 0.3); add(sfx, sub(0.7, 50), s(k) + 0.03, 0.28)
add(sfx, click(1.6), cue(5, 'clic', 0.4), 0.6); add(sfx, boom(), cue(5, 'clic', 0.4), 0.3)
add(sfx, pop_sfx(), cue(5, 'facebook', 1.8), 0.35); add(sfx, pop_sfx(), cue(5, 'instagram', 2.3), 0.35)
add(sfx, boom(), s('end'), 0.45); add(sfx, sub(1.4, 42), s('end'), 0.5)
pe = cue(6, 'tourné', 1.9) + 10 / 30
add(sfx, pop_sfx(), pe, 0.4); add(sfx, chime(81), pe, 0.3); add(sfx, chime(88), pe + 0.12, 0.25)
mix = (mus + sfx * 0.42)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/duel2', exist_ok=True)
wavfile.write('public/duel2/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
