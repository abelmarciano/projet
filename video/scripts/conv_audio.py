"""Musique premium + sound design de la pub de conversion → public/conv/bed.wav (timeline = Conversion.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/conv/words.json'))
VO = {1: 6, 2: 150, 3: 214, 4: 364, 5: 474, 6: 606}
T = dict(wall=0, prompt=138, send=200, demo=208, meta=358, proof=470, cta=600, total=720)
def cue(k, start, d=0):
    for w in W[f'conv-{k}']:
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
def riser(d, f0=200, f1=2600):
    t = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / d) ** 2) / SR
    return (hp(rng.standard_normal(len(t)), 2200) * (t / d) ** 2 * 0.35 + np.sin(ph) * (t / d) ** 3 * 0.25) * np.minimum(1, (d - t) / 0.02)
def sub(d=1.0, f=46):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f * 1.7 * np.exp(-t * 4) + f) * t) * np.exp(-t * 2.8)
bpm = 112; bt = 60 / bpm; bar = bt * 4
chords = [[50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64]]
piano = [[62, 65, 69], [58, 62, 65], [55, 58, 62], [57, 61, 64]]
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.2) * np.exp(-tt * 0.25)
    add(mus, lp(pad, 3000), at, 0.12)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.8, h=(1, 0.5, 0.2)), 320), at, 0.3)
    for q, m in enumerate(piano[b % 4] + piano[b % 4][::-1][1:] + [piano[b % 4][1]]):
        add(mus, tone(m + 12, 0.6, r=4, h=(1, 0.25, 0.05)), at + q * bt / 2 * 1.0, 0.05)
    b += 1
i = 0
while i * bt < s('total') - 0.5:
    at = i * bt
    if at >= s('prompt') - 0.1:
        add(mus, kick(), at, 0.45)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.15)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.07)
    i += 1
env = np.ones(n) * 0.9
ia = int((s('cta') - 0.4) * SR); ib = int((s('cta') + 0.4) * SR); env[ia:ib] = np.linspace(0.9, 0.45, ib - ia); ic = int((s('cta') + 1.6) * SR); env[ib:ic] = np.linspace(0.45, 0.9, ic - ib)
tl = int((s('total') - 1.0) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.9, 0, te - tl); env[te:] = 0
mus *= env
add(sfx, sub(1.2, 42), 0.05, 0.5)
for k in range(12): add(sfx, pop_sfx(), 0.07 + k * 0.05, 0.08)
for j, t0 in enumerate([cue(1, 'sans'), cue(1, 'sans') + 26 / 30, cue(1, 'sans') + 55 / 30]): add(sfx, click(1.1), t0, 0.35)
add(sfx, riser(1.0), s('prompt') - 1.0, 0.35); add(sfx, whoosh(0.6), s('prompt') - 0.25, 0.35); add(sfx, boom(), s('prompt'), 0.35)
for j in range(T['prompt'] + 14, T['send'] - 6, 2): add(sfx, click(1.0 + 0.5 * rng.random()), j / 30, 0.12)
add(sfx, pop_sfx(), s('send'), 0.5); add(sfx, riser(0.3, 400, 2000), s('send') - 0.25, 0.2)
add(sfx, whoosh(0.5), s('demo') - 0.1, 0.3); add(sfx, sub(0.8, 50), s('demo') + 0.05, 0.4)
for kk in ['script', 'acteur', 'voix', 'sous']: add(sfx, pop_sfx(), cue(3, kk), 0.35); add(sfx, chime(86), cue(3, kk) + 0.05, 0.12)
add(sfx, whoosh(0.5), s('meta') - 0.1, 0.3)
add(sfx, chime(84), cue(4, 'publie'), 0.3); add(sfx, chime(91), cue(4, 'publie') + 0.12, 0.2)
for j in range(3): add(sfx, click(1.3), cue(4, "l'optimise") + (4 + j * 6) / 30, 0.25)
add(sfx, whoosh(0.5), s('proof') - 0.2, 0.3)
for kk, d0 in [('café', 0), ('fleuriste', 0), ('resto', 0), ('friperie', 0), ('quel', 0), ('quel', 5 / 30)]: add(sfx, pop_sfx(), cue(5, kk) + d0, 0.35)
add(sfx, boom(), s('cta'), 0.5); add(sfx, sub(1.4, 42), s('cta'), 0.5); add(sfx, chime(81), s('cta') + 0.1, 0.25); add(sfx, chime(88), s('cta') + 0.25, 0.18)
mix = (mus + sfx * 0.36)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/conv', exist_ok=True)
wavfile.write('public/conv/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
