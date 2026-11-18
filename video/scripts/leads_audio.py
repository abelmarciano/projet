"""Musique + sound design de la démo leads 16:9 → public/leads/bed.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/leads/words.json'))
VO = {1: 8, 2: 156, 3: 290, 4: 435, 5: 540, 6: 646, 7: 748, 8: 930, 9: 1075, 10: 1192}
T = dict(hook=0, pub=150, form=285, camp=430, wa=535, leads=640, res=925, buyer=1070, end=1185, total=1300)
def cue(k, start, d=0):
    for w in W[f'ld-{k}']:
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
    if at >= s('pub') - 0.1 and not (s('end') - 0.3 < at < s('end') + 1.2):
        add(mus, kick(), at, 0.42)
        if i % 2 == 1: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.14)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    add(mus, hh, at + bt / 2, 0.06)
    i += 1
env = np.ones(n) * 0.9
tl = int((s('total') - 1.0) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.9, 0, te - tl); env[te:] = 0
mus *= env
# accroche
add(sfx, sub(1.2, 42), 0.05, 0.5)
add(sfx, boom(), cue(1, 'des'), 0.35); add(sfx, whoosh(0.3), cue(1, 'pas') - 0.1, 0.3)
add(sfx, whoosh(0.25), cue(1, 'likes') + 0.15, 0.35)
for j in range(6): add(sfx, pop_sfx(), cue(1, 'voici') + (6 + j * 4) / 30, 0.18)
# transitions de scènes
for k in ['pub', 'form', 'camp', 'wa', 'leads', 'res', 'buyer']:
    add(sfx, whoosh(0.45), s(k) - 0.15, 0.3); add(sfx, sub(0.7, 50), s(k) + 0.03, 0.3)
add(sfx, riser(1.0), s('pub') - 1.0, 0.3)
for j in range(T['pub'] + 10, T['pub'] + 54, 2): add(sfx, click(1.0 + 0.5 * rng.random()), j / 30, 0.1)
add(sfx, chime(86), cue(2, 'crée', 1.78) - 0.1, 0.25)
for kk in ['questions', 'prospects']: add(sfx, pop_sfx(), cue(3, kk), 0.3)
add(sfx, chime(84), cue(3, 'prospects') + 0.15, 0.18)
add(sfx, click(1.3), (T['camp'] + 20) / 30, 0.3)
add(sfx, pop_sfx(), cue(4, 'facebook'), 0.3); add(sfx, pop_sfx(), cue(4, 'instagram'), 0.3)
add(sfx, chime(84), cue(4, 'instagram') + 14 / 30, 0.28); add(sfx, chime(91), cue(4, 'instagram') + 18 / 30, 0.2)
for t0 in [cue(5, 'contact') - 4 / 30, cue(5, 'whatsapp') - 2 / 30, cue(5, 'whatsapp') + 16 / 30]:
    add(sfx, tone(88, 0.25, r=10), t0, 0.22); add(sfx, tone(95, 0.3, r=9), t0 + 0.09, 0.2)
ask = cue(6, 'montre') - 8 / 30
for j in range(int(ask * 30), int(ask * 30) + 14, 2): add(sfx, click(1.1), j / 30, 0.1)
add(sfx, pop_sfx(), ask + 34 / 30, 0.35)
add(sfx, click(1.3), cue(7, 'filtrés'), 0.3); add(sfx, pop_sfx(), cue(7, 'numéros'), 0.35)
add(sfx, click(1.3), cue(7, "l'export"), 0.3); add(sfx, chime(86), cue(7, "l'export") + 6 / 30, 0.22)
for j in range(T['res'] - 6, T['res'] + 12, 2): add(sfx, click(1.1), j / 30, 0.1)
add(sfx, pop_sfx(), cue(8, 'il') - 4 / 30, 0.3); add(sfx, chime(88), cue(8, 'meilleurs'), 0.22)
add(sfx, pop_sfx(), cue(8, 'quoi') - 6 / 30, 0.3)
for j in range(3): add(sfx, pop_sfx(), (T['buyer'] + 12 + j * 10) / 30, 0.25)
add(sfx, whoosh(0.4), cue(9, 'nuit') - 0.2, 0.3)
# fin
add(sfx, boom(), s('end'), 0.45); add(sfx, sub(1.4, 42), s('end'), 0.5)
add(sfx, chime(81), cue(10, 'plus'), 0.22); add(sfx, chime(88), cue(10, 'moins'), 0.2)
mix = (mus + sfx * 0.4)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/leads', exist_ok=True)
wavfile.write('public/leads/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
