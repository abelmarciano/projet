"""Musique + sound design de la pub « arrête d'acheter tes leads » 16:9 → public/night/bed.wav (timeline = src/leads/LeadsDemo.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/night/words.json'))
TLJ = json.load(open('src/night/timeline.json'))
VO = {int(k): v for k, v in TLJ['VO'].items()}
T = TLJ['S']
def cue(k, start, d=0):
    for w in W[f'ns-{k}']:
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
def buzz(d=0.28):
    t = np.arange(int(d * SR)) / SR
    return (np.sign(np.sin(2 * np.pi * 150 * t)) * 0.6 + np.sin(2 * np.pi * 300 * t) * 0.4) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * t))
bpm = 120; bt = 60 / bpm; bar = bt * 4
chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
piano = [[64, 69, 72], [60, 65, 69], [64, 67, 72], [62, 67, 71]]
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.2) * np.exp(-tt * 0.25)
    add(mus, lp(pad, 2800), at, 0.12)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=0.8, h=(1, 0.5, 0.2)), 320), at, 0.3)
    for q, m in enumerate(piano[b % 4] + piano[b % 4][::-1][1:] + [piano[b % 4][1]]):
        add(mus, tone(m + 12, 0.6, r=4, h=(1, 0.25, 0.05)), at + q * bt / 2, 0.05)
    b += 1
i = 0
while i * bt < s('total') - 0.5:
    at = i * bt
    night = s('night') - 0.1 < at < s('wake')
    if at >= s('chat') - 0.05 and not (s('end') - 0.3 < at < s('end') + 1.0):
        add(mus, kick(), at, 0.25 if night else 0.42)
        if i % 2 == 1 and not night: add(mus, hp(rng.standard_normal(int(0.1 * SR)), 2200) * np.exp(-np.arange(int(0.1 * SR)) / SR * 32), at, 0.14)
    hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
    if at >= s('chat'): add(mus, hh, at + bt / 2, 0.06)
    i += 1
env = np.ones(n) * 0.9
tl = int((s('total') - 1.0) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.9, 0, te - tl); env[te:] = 0
env[:int(s('chat') * SR)] *= 0.55
mus *= env
for a in [10, 24, 36, 47, 57]:
    add(sfx, buzz(), a / 30, 0.5); add(sfx, chime(93), a / 30 + 0.02, 0.18)
add(sfx, whoosh(0.5), s('chat') - 0.2, 0.35); add(sfx, boom(), s('chat'), 0.4); add(sfx, sub(1.0, 44), s('chat'), 0.45)
ts = cue(2, 'une', 1.6)
for j in range(0, 30, 2): add(sfx, click(1.0 + 0.5 * rng.random()), ts + j / 30, 0.1)
for kk in ["l'idée", "l'actrice", 'monte']: add(sfx, pop_sfx(), cue(3, kk), 0.3); add(sfx, chime(86), cue(3, kk) + 0.04, 0.12)
add(sfx, whoosh(0.4), cue(3, 'vidéo') - 0.15, 0.3)
for k in ['pub', 'night', 'wake']:
    add(sfx, whoosh(0.45), s(k) - 0.15, 0.3); add(sfx, sub(0.7, 50), s(k) + 0.03, 0.28)
add(sfx, pop_sfx(), cue(4, 'facebook'), 0.35); add(sfx, pop_sfx(), cue(4, 'instagram'), 0.35)
add(sfx, chime(84), cue(4, 'autour'), 0.25); add(sfx, chime(91), cue(4, 'autour') + 0.12, 0.2)
dur = T['wake'] - T['night']
for i in range(4): add(sfx, tone(88, 0.2, r=12), (T['night'] + 14 + round(i * (dur - 30) / 4)) / 30, 0.18)
for i in range(4): add(sfx, tone(88, 0.22, r=11), (T['wake'] + 8 + i * 8) / 30, 0.2); add(sfx, tone(95, 0.28, r=9), (T['wake'] + 8 + i * 8) / 30 + 0.08, 0.17)
add(sfx, boom(), s('end'), 0.45); add(sfx, sub(1.4, 42), s('end'), 0.5)
pe = cue(7, 'bosse', 1.8) + 10 / 30
add(sfx, pop_sfx(), pe, 0.4); add(sfx, chime(81), pe, 0.3); add(sfx, chime(88), pe + 0.12, 0.25)
mix = (mus + sfx * 0.42)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/night', exist_ok=True)
wavfile.write('public/night/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2))
