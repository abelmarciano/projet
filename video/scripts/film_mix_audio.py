"""Musique + sound design de la pub « arrête d'acheter tes leads » 16:9 → public/film/bed.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/film/words_mix.json'))
TLJ = json.load(open('src/film/timeline_mix.json'))
VO = {int(k): v for k, v in TLJ['VO'].items()}
T = TLJ['S']
def cue(k, start, d=0):
    for w in W[f'lm-{k}']:
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
def riser(d, f0=200, f1=2600):
    t = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / d) ** 2) / SR
    return (hp(rng.standard_normal(len(t)), 2200) * (t / d) ** 2 * 0.35 + np.sin(ph) * (t / d) ** 3 * 0.25) * np.minimum(1, (d - t) / 0.02)
bpm = 122; bt = 60 / bpm; bar = bt * 4
chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
piano = [[64, 69, 72], [60, 65, 69], [64, 67, 72], [62, 67, 71]]
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.2) * np.exp(-tt * 0.25)
    add(mus, lp(pad, 3000), at, 0.13)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.8, h=(1, 0.5, 0.2)), 320), at, 0.3)
    for q, m in enumerate(piano[b % 4] + piano[b % 4][::-1][1:] + [piano[b % 4][1]]):
        add(mus, tone(m + 12, 0.6, r=4, h=(1, 0.25, 0.05)), at + q * bt / 2, 0.05)
    b += 1
i = 0
while i * bt < s('total') - 0.5:
    at = i * bt
    if at >= s('s1') - 0.05 and not (s('end') - 0.3 < at < s('end') + 1.0):
        add(mus, kick(), at, 0.42)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.14)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.06)
    i += 1
env = np.ones(n) * 0.85
env[:int(s('s1') * SR)] *= 0.75
tl = int((s('total') - 1.5) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.85, 0, te - tl); env[te:] = 0
mus *= env
add(sfx, sub(1.2, 44), 0.2, 0.45); add(sfx, chime(84), 0.3, 0.22); add(sfx, chime(91), 0.5, 0.2)
add(sfx, chime(88), cue(1, 'en', 0.6), 0.25)
for i in range(7): add(sfx, pop_sfx(), cue(1, 'générés', 2.4) + i * 3 / 30, 0.14)
add(sfx, riser(1.2, 200, 2400), s('s1') - 1.2, 0.25); add(sfx, boom(), s('s1'), 0.45); add(sfx, sub(1.2, 40), s('s1'), 0.5)
for k in ['s2', 's3', 's4', 's5', 's6', 's6b', 's7', 's8', 's9']: add(sfx, whoosh(0.45), s(k) - 0.15, 0.3); add(sfx, sub(0.7, 50), s(k) + 0.03, 0.24)
t0 = cue(2, 'une', 0.9) + 4 / 30; L = 42
for j in range(0, int(L / 1.7), 2): add(sfx, click(1.0 + 0.4 * rng.random()), t0 + j / 30, 0.08)
ck = t0 + (L / 1.7 + 8) / 30; add(sfx, click(1.6), ck, 0.5); add(sfx, chime(84), ck + 1.0, 0.22)
for i in range(4): add(sfx, tone(88, 0.22, r=11), s('s2') + (30 + i * 18) / 30, 0.16)
pk = cue(4, 'choisissez', 1.6) + 8 / 30; add(sfx, click(1.6), pk, 0.5); add(sfx, pop_sfx(), pk + 0.05, 0.3)
for w in ['un', 'une', 'motion', 'cinématique', 'photo', 'visuels']: add(sfx, pop_sfx(), cue(5, w, 1), 0.3)
for j in range(0, 22, 3): add(sfx, click(1.2), cue(5, 'cinq', 3) + j / 30, 0.1)
for w in ['script', 'voix', 'sous', 'montage', 'formats']: add(sfx, pop_sfx(), cue(6, w, 1), 0.2)
add(sfx, chime(84), cue(6, 'prêt', 2.6), 0.28); add(sfx, chime(91), cue(6, 'prêt', 2.6) + 0.1, 0.2)
c6 = cue(7, 'leads', 4) + 12 / 30
for w in ['vendre', 'leads']: add(sfx, pop_sfx(), cue(7, w, 3), 0.25)
add(sfx, click(1.6), cue(12, 'formulaire', 1.4) + 8 / 30, 0.45)
for i in range(3): add(sfx, tone(88, 0.22, r=11), cue(12, 'lead', 2.2) + i * 9 / 30, 0.2)
add(sfx, chime(84), cue(12, 'relié', 3.4), 0.22); add(sfx, click(1.6), c6, 0.5); add(sfx, chime(84), c6 + 14 / 30, 0.25)
for i in range(3): add(sfx, pop_sfx(), cue(8, ['analyse', 'quoi', 'améliorer'][i], 1.5 + i), 0.22)
for i in range(5): add(sfx, pop_sfx(), s('s8') + (10 + i * 6) / 30, 0.18)
for w in ['lead', 'pub', 'whatsapp']: add(sfx, chime(93), cue(10, w, 1), 0.22)
add(sfx, boom(), s('end'), 0.45); add(sfx, sub(1.4, 42), s('end'), 0.5); add(sfx, chime(81), cue(11, 'growthity', 2.6), 0.3); add(sfx, chime(88), cue(11, 'growthity', 2.6) + 0.12, 0.25)
mix = (mus + sfx * 0.42)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/film', exist_ok=True)
wavfile.write('public/film/bed-mix.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
