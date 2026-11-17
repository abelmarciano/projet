"""Musique + sound design de la pub « On rembobine » → public/rewind/bed.wav (timeline = Rewind.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
C = json.load(open('src/rewind/rewind.json'))
W = json.load(open('src/rewind/words.json'))
A = round((C['adA']['to'] - C['adA']['from']) * 30)
T = dict(freeze=A, rew=A + 14, prompt=A + 68, ff=A + 120, adB=A + 248)
T['end'] = T['adB'] + round((C['adB']['to'] - C['adB']['from']) * 30); T['total'] = T['end'] + 84
VO = {1: T['freeze'] + 4, 2: T['prompt'] + 4, 3: T['ff'] + 2, 4: T['end'] + 4}
def cue(k, start, d=0):
    for w in W[f'rw-{k}']:
        if w['w'].lower().startswith(start): return (VO[k] + round(w['s'] * 30)) / 30
    return (VO[k] + d * 30) / 30
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
def groove(dur, bpm, gain=1.0, chords=([45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59]), drums=True):
    buf = np.zeros(int(dur * SR) + SR)
    bt = 60 / bpm; bar = bt * 4
    def ad(x, at, gg):
        i = int(at * SR)
        if i >= len(buf): return
        x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gg
    b = 0
    while b * bar < dur:
        at = b * bar; tt = np.arange(int(bar * SR)) / SR
        ad(lp(sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.exp(-tt * 0.5), 3800), at, 0.13 * gain)
        for q in range(8):
            ad(lp(tone(chords[b % 4][0] - 12, bt / 2, r=7), 320), at + q * bt / 2, 0.28 * gain)
            ad(tone(chords[b % 4][[1, 3, 2, 4, 3, 2, 4, 1][q]] + 12, 0.2, r=14, h=(1, 0.3)), at + q * bt / 2, 0.06 * gain)
        b += 1
    if drums:
        i = 0
        while i * bt < dur:
            at = i * bt
            ad(kick(), at, 0.5 * gain)
            hh = hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180)
            ad(hh, at + bt / 2, 0.1 * gain); ad(hh, at + bt * 0.75, 0.05 * gain)
            if i % 2 == 1:
                ad(hp(rng.standard_normal(int(0.1 * SR)), 2000) * np.exp(-np.arange(int(0.1 * SR)) / SR * 30), at, 0.18 * gain)
            i += 1
    return buf[: int(dur * SR)]
def tape_stop(x, d=0.6):
    """ralentit la fin du buffer jusqu'à l'arrêt (effet bande qui s'arrête)."""
    k = int(d * SR); head, tail = x[:-k], x[-k:]
    rate = np.linspace(1, 0.05, k); pos = np.cumsum(rate); pos = pos[pos < len(tail) - 1]
    out = np.interp(pos, np.arange(len(tail)), tail) * np.linspace(1, 0, len(pos))
    return np.concatenate([head, out])
# 1. la pub d'ouverture : musique italienne légère, puis bande qui s'arrête
op = groove(s('freeze') + 0.3, 112, 0.55, chords=([48, 55, 60, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [43, 50, 55, 59, 62]))
add(mus, tape_stop(op, 0.55), 0, 1.0)
add(sfx, boom(), s('freeze'), 0.4)
# 2. rembobinage : sifflement de bande qui monte, tic-tac rapide à l'envers
t = np.arange(int((s('prompt') - s('rew')) * SR)) / SR
wob = np.sin(2 * np.pi * np.cumsum(900 + 700 * np.sin(2 * np.pi * 6 * t)) / SR) * 0.2 + hp(rng.standard_normal(len(t)), 2500) * 0.15
add(sfx, wob * np.minimum(1, t / 0.1) * np.minimum(1, (t[-1] - t) / 0.15), s('rew'), 0.8)
for j in range(T['rew'], T['prompt'], 2): add(sfx, click(1.9), j / 30, 0.12)
for i in range(5): add(sfx, whoosh(0.3), (T['rew'] + 4 + i * 9) / 30, 0.25)
# 3. la phrase : nappe suspendue
tt = np.arange(int((s('ff') - s('prompt') + 0.2) * SR)) / SR
pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in [57, 61, 64, 68]) / 4 * np.minimum(1, tt / 0.3)
add(mus, lp(pad, 2500), s('prompt'), 0.16)
add(sfx, chime(84), s('prompt') + 0.1, 0.25)
add(sfx, click(1.0), s('ff') - 0.25, 0.5)
# 4. avance rapide : groove pressé
add(mus, groove(s('adB') - s('ff'), 150, 0.9), s('ff'), 1.0)
add(sfx, boom(), s('ff'), 0.5)
for kk in ['script', 'acteur', 'voix', 'montage', 'format']:
    add(sfx, pop_sfx(), cue(3, kk), 0.4); add(sfx, chime(86), cue(3, kk) + 0.05, 0.15)
add(sfx, boom(), cue(3, 'grossiti'), 0.5); add(sfx, chime(88), cue(3, 'grossiti') + 0.1, 0.3)
# 5. la pub en temps réel : musique très basse sous la voix du chef
add(mus, groove(s('end') - s('adB'), 112, 0.25), s('adB'), 1.0)
add(sfx, pop_sfx(), s('adB') + 0.33, 0.4); add(sfx, chime(88), s('adB') + 0.4, 0.25)
# 6. fin
add(mus, groove(s('total') - s('end'), 120, 0.8), s('end'), 1.0)
add(sfx, boom(), s('end'), 0.55); add(sfx, chime(81), s('end') + 0.1, 0.25)
for kk in ['une', "c'est"]: add(sfx, boom(), cue(4, kk), 0.35)
tl = int((s('total') - 0.8) * SR); te = int(s('total') * SR)
env = np.ones(n); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0
mus *= env
mix = (mus + sfx * 0.45)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.45
d = int(0.01 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
wavfile.write('public/rewind/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', T)
