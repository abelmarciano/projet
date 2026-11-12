"""Fond sonore « Le brief Meta » : pulsation douce et accords posés (style corporate premium), whoosh à chaque scène,
impact léger sur le titre, chime final et fondu. Usage : python3 scripts/brief_audio.py src/brief/andromeda.json"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, click, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'click', 'rng'])
c = json.load(open(sys.argv[1]))
starts = []; acc = 0
for s in c['scenes']: starts.append(acc); acc += round(s['dur'] * 30) / 30
T = acc; n = int(T * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pad(ms, dur, cut=1800):
    ts = np.arange(int(dur * SR)) / SR
    return lp(sum(np.sin(2 * np.pi * note(m) * ts) + 0.3 * np.sin(4 * np.pi * note(m) * ts) for m in ms) / len(ms) * np.minimum(1, ts / 0.25) * np.minimum(1, (dur - ts) / 0.4), cut)
bpm = 96; beat = 60 / bpm; prog = [[62, 66, 69, 73], [59, 62, 66, 69], [64, 67, 71, 74], [57, 61, 64, 69]]
i = 0
while i * beat < T - 1:
    at = i * beat; bar = (i // 4) % 4
    add(mus, kick() * 0.6, at, 0.22 if i % 2 == 0 else 0.08)
    tt = np.arange(int(0.025 * SR)) / SR; add(mus, hp(rng.standard_normal(len(tt)), 9000) * np.exp(-tt * 160), at + beat / 2, 0.05)
    if i % 4 == 0: add(mus, pad(prog[bar], beat * 4 + 0.2), at, 0.13)
    i += 1
e = np.ones(n); E = int(T * SR); e[E - int(1.6 * SR):E] *= np.linspace(1, 0, int(1.6 * SR)); e[E:] = 0; mus *= e
add(sfx, boom(), 0.05, 0.18); add(sfx, chime(86), 0.15, 0.14)
for st in starts[1:]: add(sfx, whoosh(0.35), st - 0.15, 0.22)
add(sfx, chime(93), starts[-1] + 0.2, 0.16)
for t in c.get('ticks', []): add(sfx, click(), t, 0.5)
for t in c.get('stamps', []): add(sfx, boom(), t, 0.35)
mix = (mus + sfx)[: E]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.24
os.makedirs('public/brief', exist_ok=True)
wavfile.write('public/' + c['bed'], SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', round(T, 2))
