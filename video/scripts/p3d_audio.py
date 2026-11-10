"""Music + sound design for the « Pub 3D boulanger » Growthity ad (src/chatpub/Pub3D.tsx).
Usage: python3 scripts/p3d_audio.py [p3d|f3d] → public/chatpub/<name>-bed.wav"""
import sys
NAME = sys.argv[1] if len(sys.argv) > 1 else "p3d"
import os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'rng'])
TOTAL = 19.5 if NAME == 'p3d' else 20.6
INTRO = 4.0 if NAME == 'p3d' else 3.0
n = int(TOTAL * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pluck(m, d=0.45):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * note(m) * t) + 0.35 * np.sin(4 * np.pi * note(m) * t)) * np.exp(-t * 7)
bpm = 104; beat = 60 / bpm
prog = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]
melody = [72, 76, 79, 76, 74, 72, 74, 76, 77, 76, 74, 72, 71, 72, 74, 79]
i = 0
while i * beat < TOTAL:
    at = i * beat; bar = (i // 4) % 4
    if at < INTRO:  # music-box intro
        add(mus, pluck(melody[i % 16] + 12, 0.6), at, 0.18)
    else:
        add(mus, pluck(melody[i % 16]), at, 0.22)
        add(mus, pluck(prog[bar][i % 4] - 12, 0.5), at + beat / 2, 0.12)
        if at >= 8.0: add(mus, kick(), at, 0.35)
        if at >= 8.0 and i % 2: add(mus, hp(rng.standard_normal(int(0.05 * SR)), 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90), at, 0.08)
    if i % 4 == 0:
        t = np.arange(int(beat * 4 * SR)) / SR
        pad = sum(np.sin(2 * np.pi * note(m) * t) for m in prog[bar]) / 4 * np.minimum(1, t / 0.3) * np.exp(-t * 0.4)
        add(mus, lp(pad, 1800), at, 0.10 if at < INTRO else 0.14)
    i += 1
env = np.ones(n); env[int(15.0 * SR):] = 0.55
fo = int(1.2 * SR); e = int(TOTAL * SR); env[e - fo:e] *= np.linspace(1, 0, fo); env[e:] = 0
mus *= env
if NAME == 'p3d':
    for c in (4.0, 8.0, 12.0): add(sfx, whoosh(0.5), c - 0.3, 0.22)
    add(sfx, boom(), 4.6, 0.25)                       # phone glow
    for k in range(3): add(sfx, pop_sfx(), 8.6 + k * 0.9, 0.35); add(sfx, chime(84 + 3 * k), 8.65 + k * 0.9, 0.18)
    add(sfx, chime(79), 12.4, 0.2)
else:
    for c in (3.0, 7.0, 11.0): add(sfx, whoosh(0.5), c - 0.3, 0.22)
    add(sfx, boom(), 3.5, 0.22)                       # hologram
    for k in range(10): add(sfx, chime(84 + (k * 5) % 12), 7.2 + k * 0.35, 0.1)   # butterflies
    add(sfx, boom(), 11.0, 0.3); add(sfx, chime(79), 11.1, 0.22)
add(sfx, whoosh(0.6), 14.7, 0.3); add(sfx, boom(), 15.0, 0.35); add(sfx, chime(88), 15.2, 0.2)
mix = (mus + sfx)[: int(TOTAL * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write(f'public/chatpub/{NAME}-bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', TOTAL)
