"""Musique + sound design de la pub motion « Tes mots deviennent des pubs. » → public/mots/bed.wav (timeline = MotsPub.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
VO = {1: 6, 2: 72, 3: 186, 4: 316, 5: 505, 6: 632}
T = dict(hook=0, prompt=66, typeA=84, typeB=176, assemble=300, ad=332, variants=492, end=622, total=744)
W = json.load(open('src/mots/words.json'))
def cue(k, start, d=0):
    for w in W[f'mots-{k}']:
        if w['w'].lower().startswith(start): return (VO[k] + round(w['s'] * 30)) / 30
    return (VO[k] + d * 30) / 30
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.01, r=3.0, h=(1, 0.3, 0.1)):
    t = np.arange(int(d * SR)) / SR
    return sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h)) * np.minimum(1, t / a) * np.exp(-t * r)
def riser(d, f0=200, f1=2800):
    t = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / d) ** 2) / SR
    return (hp(rng.standard_normal(len(t)), 2000) * (t / d) ** 2 * 0.4 + np.sin(ph) * (t / d) ** 3 * 0.3) * np.minimum(1, (d - t) / 0.02)
def sub(d=1.2, f=50):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f * 1.6 * np.exp(-t * 4) + f) * t) * np.exp(-t * 2.6)
def swell(m_list, d):
    t = np.arange(int(d * SR)) / SR
    x = sum(np.sin(2 * np.pi * note(m) * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) for m in m_list) / len(m_list)
    return lp(x, 2600) * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 0.6)
# accroche : nappe mystérieuse
add(mus, swell([50, 57, 62, 69], s('prompt') + 0.4), 0, 0.5)
add(sfx, sub(1.4, 45), 0.05, 0.6)
# groove doux à partir de la phrase (96 bpm, accords chauds)
bpm = 96; bt = 60 / bpm; bar = bt * 4
start = s('prompt')
chords = [[49, 56, 61, 64, 68], [47, 54, 59, 63, 66], [45, 52, 57, 61, 64], [47, 54, 59, 62, 66]]
bass = [37, 35, 33, 35]
arp = [0, 2, 3, 4, 3, 2, 1, 2]
for b in range(int((s('total') - start) / bar) + 1):
    at = start + b * bar
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.15) * np.exp(-tt * 0.25)
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 3000) * e * 0.17, at)
    add(mus, lp(tone(bass[b % 4], bar, a=0.01, r=0.9, h=(1, 0.4, 0.15)), 380), at, 0.26)
    for q in range(8):
        add(mus, tone(chords[b % 4][arp[q]] + 12, 0.45, a=0.003, r=6, h=(1, 0.2)), at + q * bt / 2, 0.055)
i = 0
while start + i * bt < s('total') - 0.6:
    at = start + i * bt
    if at >= s('assemble') - 0.05:
        add(mus, kick(), at, 0.42)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.07)
    if i % 2 == 1 and at >= s('assemble'):
        cl = hp(rng.standard_normal(int(0.09 * SR)), 2200) * np.exp(-np.arange(int(0.09 * SR)) / SR * 38)
        add(mus, cl, at, 0.14)
    i += 1
env = np.ones(n) * 0.8
fa = int((s('end') - 0.4) * SR); fb = int((s('end') + 0.5) * SR); env[fa:fb] = np.linspace(0.8, 0.35, fb - fa)
fc = int((s('end') + 1.6) * SR); env[fb:fc] = np.linspace(0.35, 0.8, fc - fb)
tl = int((s('total') - 1.2) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.8, 0, te - tl); env[te:] = 0
mus *= env
# accroche : un « tic » par mot
for w in W['mots-1']: add(sfx, click(1.1), VO[1] / 30 + w['s'] - 0.05, 0.12)
# frappe au clavier
for j in range(T['typeA'], T['typeB'], 2):
    add(sfx, click(1.0 + 0.5 * rng.random()), j / 30 + 0.012 * rng.random(), 0.16)
# mots clés → cartes
for kk, m in [('produit', 81), ('ambiance', 85), ('réseau', 88)]:
    add(sfx, whoosh(0.35), cue(3, kk) - 0.15, 0.25); add(sfx, chime(m), cue(3, kk), 0.3); add(sfx, pop_sfx(), cue(3, kk) + 0.05, 0.3)
# assemblage
add(sfx, riser(1.0), s('assemble') - 0.1, 0.4)
add(sfx, boom(), s('assemble') + 0.9, 0.6); add(sfx, sub(1.4, 42), s('assemble') + 0.9, 0.6)
add(sfx, chime(81), s('assemble') + 0.95, 0.25); add(sfx, chime(88), s('assemble') + 1.05, 0.18)
# allumette (craquement doux) dans le téléphone
crack = hp(rng.standard_normal(int(0.25 * SR)), 3000) * np.exp(-np.arange(int(0.25 * SR)) / SR * 14)
add(sfx, crack, s('assemble') + 1.4, 0.25)
# variantes
add(sfx, whoosh(0.5), s('variants') + 0.2, 0.3); add(sfx, whoosh(0.5), s('variants') + 0.35, 0.25)
add(sfx, riser(0.9, 600, 2400), cue(5, 'testées'), 0.15)
add(sfx, pop_sfx(), cue(5, 'meilleure') - 0.1, 0.45); add(sfx, chime(86), cue(5, 'meilleure'), 0.3); add(sfx, chime(93), cue(5, 'meilleure') + 0.12, 0.2)
# fin
add(sfx, boom(), s('end') + 0.05, 0.5); add(sfx, sub(1.6, 42), s('end') + 0.05, 0.5)
add(sfx, chime(81), s('end') + 0.1, 0.25); add(sfx, chime(88), s('end') + 0.25, 0.18)
mix = (mus + sfx * 0.36)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/mots', exist_ok=True)
wavfile.write('public/mots/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's')
