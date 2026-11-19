"""Musique + sound design de la pub « arrête d'acheter tes leads » 16:9 → public/leads/bed-lb.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/leads/words_lb.json'))
VO = {4: 431, 5: 1015, 6: 1200, 7: 1313, 8: 1470, 9: 1673, 10: 1880}
VOH = {1: 4, 2: 154}
T = dict(hook=0, spy=266, pub=426, big=560, meta=826, form=1010, camp=1195, wa=1308, leads=1465, res=1668, end=1875, total=2004)
VM = 831
VC = 271
def cue(k, start, d=0):
    for w in W[f'lb-{k}']:
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
bpm = 116; bt = 60 / bpm; bar = bt * 4
chords = [[48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]]
piano = [[64, 67, 72], [60, 64, 69], [57, 60, 65], [59, 62, 67]]
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
    if at >= 0.0 and not (s('end') - 0.3 < at < s('end') + 1.2):
        add(mus, kick(), at, 0.42)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.14)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.06)
    i += 1
env = np.ones(n) * 0.9
tl = int((s('total') - 1.0) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.9, 0, te - tl); env[te:] = 0
ia = int((s('big') - 0.2) * SR); ib = int((s('big') + 0.3) * SR); ic = int((s('meta') - 0.4) * SR); idd = int((s('meta') + 0.1) * SR)
env[ia:ib] = np.linspace(0.9, 0.22, ib - ia); env[ib:ic] = 0.22; env[ic:idd] = np.linspace(0.22, 0.9, idd - ic)
mus *= env

# accroche : leads qui tombent en direct
def cueH(k, start, d=0):
    for w in W[f'lh-{k}']:
        if w['w'].lower().startswith(start): return (VOH[k] + round(w['s'] * 30)) / 30
    return (VOH[k] + d * 30) / 30
add(sfx, sub(1.2, 40), 0.0, 0.5); add(sfx, boom(), 0.02, 0.35)
for j in range(2, 38, 2): add(sfx, click(1.0 + 0.5 * rng.random()), j / 30, 0.1)
add(sfx, pop_sfx(), 40 / 30, 0.4); add(sfx, riser(0.3, 400, 2000), 40 / 30 - 0.25, 0.2)
for i in range(3): add(sfx, pop_sfx(), (52 + i * 4) / 30, 0.2)
for i, a in enumerate([64, 74, 84, 96, 108, 122, 138, 154, 172, 192]):
    add(sfx, tone(88, 0.22, r=11), a / 30, 0.2); add(sfx, tone(95, 0.28, r=9), a / 30 + 0.08, 0.17)
add(sfx, boom(), cueH(2, "d'agence"), 0.3); add(sfx, boom(), cueH(2, 'achetés'), 0.3)
add(sfx, chime(84), cueH(2, 'outil'), 0.28); add(sfx, chime(91), cueH(2, 'outil') + 0.12, 0.2)
for i in range(5): add(sfx, pop_sfx(), cueH(2, 'outil') + i * 2 / 30, 0.18)
add(sfx, riser(1.0), s('spy') - 1.0, 0.3)
# scènes
def cueM(start, d=0):
    for w in W['lm-1']:
        if w['w'].lower().startswith(start): return (VM + round(w['s'] * 30)) / 30
    return (VM + d * 30) / 30
ck = cueM('connectes', 0.3) + 16 / 30; na = cueM('pas', 2.0) + 4 / 30; gd = cueM('guidé', 4.1) - 6 / 30
add(sfx, click(1.3), ck, 0.3); add(sfx, click(1.3), na, 0.3); add(sfx, whoosh(0.3), gd - 0.05, 0.25)
for i in range(5): add(sfx, pop_sfx(), gd + (10 + i * 9) / 30, 0.25)
add(sfx, chime(84), gd + (10 + 4 * 9 + 2) / 30, 0.25); add(sfx, chime(91), gd + (10 + 4 * 9 + 6) / 30, 0.2)
def cueC(start, d=0):
    for w in W['lc-1']:
        if w['w'].lower().startswith(start): return (VC + round(w['s'] * 30)) / 30
    return (VC + d * 30) / 30
for j in range(T['spy'] + 4, T['spy'] + 22, 2): add(sfx, click(1.0 + 0.5 * rng.random()), j / 30, 0.09)
for i in range(4): add(sfx, pop_sfx(), cueC('concurrents') - 8 / 30 + i * 4 / 30, 0.22)
pk = cueC('domaine') + 2 / 30
add(sfx, click(1.3), pk, 0.3); add(sfx, chime(86), pk + 8 / 30, 0.25)
add(sfx, whoosh(0.5), s('big') - 0.15, 0.32); add(sfx, sub(0.9, 46), s('big') + 0.05, 0.35)
for k in ['spy', 'pub', 'meta', 'form', 'camp', 'wa', 'leads', 'res']:
    add(sfx, whoosh(0.45), s(k) - 0.15, 0.3); add(sfx, sub(0.7, 50), s(k) + 0.03, 0.3)
for j in range(T['pub'] + 6, T['pub'] + 50, 2): add(sfx, click(1.0 + 0.5 * rng.random()), j / 30, 0.09)
add(sfx, chime(86), cue(4, 'crée') - 0.1, 0.25)
for kk in ['logement', 'chauffage', 'propriétaire']: add(sfx, pop_sfx(), cue(5, kk) - 4 / 30, 0.3); add(sfx, click(1.3), cue(5, kk) + 8 / 30, 0.2)
for i in range(12): add(sfx, pop_sfx(), (T['camp'] + 16 + i * 4) / 30, 0.2); add(sfx, tone(84 + (i % 4) * 2, 0.15, r=14), (T['camp'] + 16 + i * 4) / 30, 0.06)
lv = max(cue(6, 'zone') + 14 / 30, (T['camp'] + 16 + 11 * 4 + 14) / 30)
add(sfx, click(1.3), lv - 4 / 30, 0.3); add(sfx, chime(84), lv, 0.28); add(sfx, chime(91), lv + 0.12, 0.2)
for t0 in [cue(7, 'lead'), cue(7, 'direct') + 6 / 30, cue(7, 'direct') + 22 / 30]:
    add(sfx, tone(88, 0.25, r=10), t0, 0.22); add(sfx, tone(95, 0.3, r=9), t0 + 0.09, 0.2)
add(sfx, click(1.3), cue(7, 'rappelles'), 0.3); add(sfx, pop_sfx(), cue(7, 'personne'), 0.3)
ask = cue(8, 'montre') - 10 / 30
for j in range(int(ask * 30), int(ask * 30) + 12, 2): add(sfx, click(1.1), j / 30, 0.1)
add(sfx, pop_sfx(), ask + 26 / 30, 0.35)
add(sfx, click(1.3), cue(8, 'filtr'), 0.3); add(sfx, pop_sfx(), cue(8, 'numéros'), 0.35)
add(sfx, click(1.3), cue(8, 'export'), 0.3); add(sfx, chime(86), cue(8, 'export') + 6 / 30, 0.22)
for j in range(T['res'] - 8, T['res'] + 10, 2): add(sfx, click(1.1), j / 30, 0.1)
add(sfx, pop_sfx(), cue(9, 'il') - 4 / 30, 0.3); add(sfx, chime(88), cue(9, 'meilleurs'), 0.22)
add(sfx, whoosh(0.45), cue(9, 'et') - 0.2, 0.3)
for j in range(3): add(sfx, pop_sfx(), cue(9, 'et') + (6 + j * 7) / 30, 0.22)
add(sfx, whoosh(0.4), cue(9, 'nuit') - 0.2, 0.3)
# fin
add(sfx, boom(), s('end'), 0.45); add(sfx, sub(1.4, 42), s('end'), 0.5)
add(sfx, chime(81), cue(10, 'génère'), 0.22); add(sfx, chime(88), cue(10, 'avec'), 0.2)
mix = (mus + sfx * 0.4)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
wavfile.write('public/leads/bed-lb.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
