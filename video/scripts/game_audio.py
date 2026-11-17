"""Musique chiptune + bruitages de jeu de la pub « Le mode facile » → public/game/bed.wav (timeline = ModeFacile.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/game/words.json')); C = json.load(open('src/game/game.json'))
VO = {1: 4, 2: 94, 3: 304, 4: 484}
def cue(k, start, d=0):
    for w in W[f'game-{k}']:
        if w['w'].lower().startswith(start): return (VO[k] + round(w['s'] * 30)) / 30
    return (VO[k] + d * 30) / 30
AD = round((C['ad']['to'] - C['ad']['from']) * 30)
T = dict(hard=92, over=252, pickEasy=292, easy=300, done=372, reward=410); T['end'] = 410 + AD; T['total'] = T['end'] + 96
T['pickHard'] = round(cue(1, 'difficile') * 30) + 2
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def sq(m, d, duty=0.5, r=5.0):
    t = np.arange(int(d * SR)) / SR
    ph = (note(m) * t) % 1
    return np.where(ph < duty, 1.0, -1.0) * np.exp(-t * r) * np.minimum(1, t / 0.003)
def tri(m, d, r=3.0):
    t = np.arange(int(d * SR)) / SR
    ph = (note(m) * t) % 1
    return (4 * np.abs(ph - 0.5) - 1) * np.exp(-t * r)
def noise_hit(d=0.05, r=60):
    t = np.arange(int(d * SR)) / SR
    return rng.standard_normal(len(t)) * np.exp(-t * r)
def arp_up(base, steps, dt, gain):
    return [(sq(base + s_, dt * 1.2, 0.25, 8), i * dt) for i, s_ in enumerate(steps)]
def song(t0, t1, bpm, gain, key=0, minor=False):
    bt = 60 / bpm
    prog_ = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]] if not minor else [[0, 3, 7], [8, 12, 15], [5, 8, 12], [7, 10, 14]]
    lead = [12, 16, 19, 16, 14, 12, 7, 9] if not minor else [12, 15, 19, 15, 14, 12, 7, 8]
    i = 0
    while t0 + i * bt / 2 < t1 - 0.02:
        at = t0 + i * bt / 2; bar = (i // 8) % 4
        ch = prog_[bar]
        add(mus, tri(48 + key + ch[0] - 12, bt / 2, 6), at, 0.35 * gain)
        add(mus, sq(60 + key + ch[i % 3], bt / 2 * 0.9, 0.125, 9), at, 0.08 * gain)
        if i % 2 == 0: add(mus, sq(72 + key + lead[(i // 2) % 8] - 12, bt * 0.9, 0.5, 4), at, 0.07 * gain)
        if i % 2 == 0: add(mus, kick(), at, 0.35 * gain)
        add(mus, noise_hit(0.03, 120), at + bt / 4, 0.05 * gain)
        if i % 4 == 2: add(mus, noise_hit(0.12, 30), at, 0.12 * gain)
        i += 1
# titre : jingle majeur
song(0, s('hard'), 140, 0.9)
for k, (x, at) in enumerate(arp_up(72, [0, 4, 7, 12], 0.07, 1)): add(sfx, x, 0.05 + at, 0.25)
add(sfx, sq(84, 0.12, 0.5, 20), s('pickHard'), 0.3); add(sfx, sq(79, 0.2, 0.5, 10), s('pickHard') + 0.08, 0.3)
# mode difficile : mineur, plus tendu
song(s('hard'), s('over'), 150, 0.85, key=-3, minor=True)
for kk in ['acteur', 'tourner', 'monter', 'lancer']:
    at = cue(2, kk) + 6 / 30
    for j, m in enumerate([67, 62, 55]): add(sfx, sq(m, 0.12, 0.5, 14), at + j * 0.06, 0.3)
    add(sfx, noise_hit(0.15, 25), at, 0.25); add(sfx, boom(), at, 0.25)
# game over : descente
for j, m in enumerate([72, 71, 70, 69, 67, 64, 60]): add(sfx, sq(m, 0.25, 0.5, 6), s('over') + 0.05 + j * 0.12, 0.3)
add(sfx, tri(36, 1.2, 1.5), s('over') + 0.9, 0.5)
add(sfx, sq(84, 0.12, 0.5, 20), s('pickEasy'), 0.3)
# mode facile : majeur, lumineux
song(s('easy'), s('reward'), 150, 0.8, key=2)
tA = cue(3, 'une') - 4 / 30
for j in range(40): add(sfx, noise_hit(0.015, 300), tA + j / 30, 0.08)
for (x, at) in arp_up(76, [0, 4, 7, 12, 16, 19, 24], 0.06, 1): add(sfx, x, s('done') - 0.25 + at, 0.25)
for i in range(3): add(sfx, sq(88 + i * 2, 0.18, 0.25, 10), s('done') + (6 + i * 5) / 30, 0.3)
# récompense : musique basse sous la voix de Priya
song(s('reward'), s('end'), 120, 0.3, key=2)
for (x, at) in arp_up(84, [0, 7, 12], 0.07, 1): add(sfx, x, s('reward') + 34 / 30, 0.25)
# fin
song(s('end'), s('total') - 0.1, 140, 0.85, key=0)
add(sfx, boom(), s('end'), 0.4)
for (x, at) in arp_up(72, [0, 4, 7, 12, 16], 0.06, 1): add(sfx, x, cue(4, 'passe') - 0.05 + at, 0.3)
tl = int((s('total') - 0.7) * SR); te = int(s('total') * SR)
env = np.ones(n); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0
mus *= env
mix = (lp(mus, 9000) + sfx * 0.45)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.01 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
wavfile.write('public/game/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', T)
