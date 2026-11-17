"""Musique + sound design de la pub « Arrête le scroll » → public/scroll/bed.wav (timeline = ScrollStop.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
T = dict(stop=44, full=50, hero=140, burst=140, formats=278, publish=330, end=366, total=472)
BURST = [152, 184, 216]; FLIP_AT = 246
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.005, r=6.0, h=(1, 0.4, 0.15)):
    t = np.arange(int(d * SR)) / SR
    return sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h)) * np.minimum(1, t / a) * np.exp(-t * r)
def sub(d=1.0, f=48):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f * 1.8 * np.exp(-t * 5) + f) * t) * np.exp(-t * 3)
def swish(d=0.18):
    t = np.arange(int(d * SR)) / SR
    return hp(rng.standard_normal(len(t)), 3000) * np.sin(np.pi * t / d) ** 2 * 0.7
def scratch(d=0.35):
    t = np.arange(int(d * SR)) / SR
    f = 900 * np.exp(-t * 9) + 80
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.8 + hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 12) * 0.3
bpm = 128; bt = 60 / bpm; bar = bt * 4
def groove(t0, t1, gain=1.0, chords=([45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59])):
    b = 0
    while t0 + b * bar < t1:
        at = t0 + b * bar
        seg = int(min(bar, t1 - at) * SR); tt = np.arange(seg) / SR
        pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.exp(-tt * 0.6)
        add(mus, lp(pad, 3800) * 0.13 * gain, at)
        for q in range(8):
            if at + q * bt / 2 < t1:
                add(mus, lp(tone(chords[b % 4][0] - 12, bt / 2, r=7), 300), at + q * bt / 2, 0.3 * gain)
                add(mus, tone(chords[b % 4][[1, 3, 2, 4, 3, 2, 4, 1][q]] + 12, 0.2, r=14, h=(1, 0.3)), at + q * bt / 2, 0.06 * gain)
        b += 1
    i = 0
    while t0 + i * bt < t1 - 0.05:
        at = t0 + i * bt
        add(mus, kick(), at, 0.55 * gain)
        hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
        add(mus, hh, at + bt / 2, 0.1 * gain); add(mus, hh, at + bt / 4, 0.04 * gain); add(mus, hh, at + bt * 0.75, 0.05 * gain)
        if i % 2 == 1:
            cl = hp(rng.standard_normal(int(0.1 * SR)), 2000) * np.exp(-np.arange(int(0.1 * SR)) / SR * 30)
            add(mus, cl, at, 0.2 * gain)
        i += 1
# 1. le fil : groove tendu, filtré
groove(0, s('stop'), 0.8)
for j in range(0, T['stop'], 3): add(sfx, click(1.6 + 0.4 * rng.random()), j / 30, 0.07)
add(sfx, whoosh(1.2), 0.1, 0.35)
# 2. STOP : coupure nette, scratch + impact
add(sfx, scratch(), s('stop') - 0.02, 0.6); add(sfx, boom(), s('stop') + 0.18, 0.7); add(sfx, sub(1.2, 42), s('stop') + 0.18, 0.7)
# (pendant la pub de Romane : pas de musique, on entend la pub)
add(sfx, swish(0.5), s('hero') - 0.35, 0.4)
# 3. rafale : drop
groove(s('burst'), s('end') - 0.05, 1.0)
add(sfx, boom(), s('burst'), 0.55); add(sfx, sub(1.0, 45), s('burst'), 0.6)
for a in BURST:
    add(sfx, swish(), a / 30 - 0.08, 0.6); add(sfx, pop_sfx(), a / 30, 0.25)
for k in range(7):
    add(sfx, click(1.8), (FLIP_AT + k * 4) / 30, 0.3)
add(sfx, chime(88), (FLIP_AT + 24) / 30, 0.3)
# 4. formats : trois claquements
for k in range(3):
    add(sfx, pop_sfx(), (T['formats'] + 6 + k * 16) / 30, 0.45); add(sfx, swish(0.12), (T['formats'] + 4 + k * 16) / 30, 0.4)
# publier → tampon
add(sfx, click(1.0), (T['publish'] + 4) / 30, 0.5)
add(sfx, boom(), (T['publish'] + 12) / 30, 0.6); add(sfx, sub(0.8, 50), (T['publish'] + 12) / 30, 0.5); add(sfx, chime(86), (T['publish'] + 14) / 30, 0.3)
# 5. fin
add(sfx, boom(), s('end'), 0.6); add(sfx, chime(81), s('end') + 0.1, 0.3); add(sfx, chime(88), s('end') + 0.25, 0.22)
groove(s('end'), s('total'), 0.75, chords=([45, 52, 57, 61, 64], [42, 49, 54, 57, 61], [38, 45, 50, 54, 57], [40, 47, 52, 56, 59]))
tl = int((s('total') - 0.8) * SR); te = int(s('total') * SR)
env = np.ones(n); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0
mus *= env
mix = (mus + sfx * 0.45)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.45
d = int(0.01 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/scroll', exist_ok=True)
wavfile.write('public/scroll/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's')
