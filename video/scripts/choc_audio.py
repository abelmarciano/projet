"""Musique + bruitages du short « Je n'existe pas » (src/choc/ChocAd.tsx) → public/media/choc/bed.wav (sans la voix)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
W = json.load(open('src/choc/words.json'))
ws = lambda s: next(w['s'] for w in W if w['w'].lower().startswith(s))
END = round((W[-1]['e'] + 0.3) * 30) / 30; total = END + 84 / 30
BEAT = ws('une')
n = int(total * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if 0 <= i < len(buf): x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def glitch(d=0.25):
    m = int(d * SR); x = rng.standard_normal(m)
    x = np.repeat(x[::14], 14)[:m]  # bitcrush
    gate = (np.sin(np.arange(m) / SR * 2 * np.pi * 38) > 0).astype(float)
    t = np.arange(m) / SR; buzz = np.sign(np.sin(2 * np.pi * 110 * t)) * 0.5
    return hp((x * 0.7 + buzz) * gate, 400) * np.exp(-t * 6)
t = np.arange(int(BEAT * SR)) / SR  # nappe sombre et tendue avant le beat
drone = (np.sin(2 * np.pi * note(33) * t) + 0.5 * np.sin(2 * np.pi * note(40) * t * 1.003) + 0.3 * np.sin(2 * np.pi * note(45) * t)) * np.minimum(1, t / 0.05)
add(mus, lp(drone, 900) * np.linspace(0.8, 1, len(t)), 0, 0.22)
add(mus, hp(rng.standard_normal(int(0.6 * SR)), 3000) * np.linspace(0, 1, int(0.6 * SR)) ** 2, BEAT - 0.6, 0.15)  # montée
bpm = 124; bt = 60 / bpm; bar = bt * 4
chords = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]]
b = 0
while BEAT + b * bar < total:
    at = BEAT + b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5 * np.minimum(1, tt / 0.1) * np.exp(-tt * 0.3)
    add(mus, lp(pad, 3000), at, 0.12); b += 1
i = 0
while BEAT + i * bt < total - 0.4:
    at = BEAT + i * bt
    if not (END - 0.25 < at < END + 0.5): add(mus, kick(), at, 0.42)
    add(mus, hp(rng.standard_normal(int(0.02 * SR)), 9500) * np.exp(-np.arange(int(0.02 * SR)) / SR * 180), at + bt / 2, 0.06)
    i += 1
env = np.ones(n); tl = int((total - 1.0) * SR); te = int(total * SR); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0; mus *= env
add(sfx, boom(), 0, 0.5); add(sfx, glitch(0.3), 0, 0.5)
add(sfx, glitch(0.18), ws('visage') - 1 / 30, 0.35)
add(sfx, glitch(0.25), ws('rien') - 2 / 30, 0.4)
add(sfx, whoosh(0.8), ws('rien'), 0.25)  # balayage du scan
add(sfx, glitch(0.3), ws('réel') + 2 / 30, 0.5); add(sfx, boom(), ws('réel') + 2 / 30, 0.3)
for w in ['photo', 'phrase', 'présente']: add(sfx, pop_sfx(), ws(w), 0.35)
add(sfx, glitch(0.2), END - 6 / 30, 0.4); add(sfx, boom(), END, 0.45)
add(sfx, chime(84), END + 0.5, 0.25); add(sfx, chime(88), END + 0.95, 0.22)
mix = (mus + sfx * 0.5)[: int(total * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.32
d = int(0.012 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
wavfile.write('public/media/choc/bed.wav', SR, (st * 32767).astype(np.int16)); print('ok', round(total, 2))
