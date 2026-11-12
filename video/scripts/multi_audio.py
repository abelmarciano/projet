"""Fond musical + bruitages de MultiDecor : whoosh + impact à chaque changement de décor, pops de l'accroche, montée et chime sur l'écran final.
Usage : python3 scripts/multi_audio.py multi → public/<cfg.bed>"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'rng'])
c = json.load(open(f'src/chatpub/{sys.argv[1] if len(sys.argv) > 1 else "multi"}.json'))
T = c['videoDur'] + c['endDur']; n = int(T * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pluck(m, d=0.35):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(4 * np.pi * note(m) * t)) * np.exp(-t * 9)
bpm = 118; beat = 60 / bpm; prog = [[64, 68, 71, 75], [61, 64, 68, 71], [66, 69, 73, 76], [59, 63, 66, 71]]; mel = [76, 80, 83, 80, 78, 80, 76, 75]
i = 0
while i * beat < T:
    at = i * beat; bar = (i // 4) % 4
    add(mus, kick(), at, 0.26); add(mus, pluck(mel[i % 8]), at + beat / 2, 0.09)
    add(mus, hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140), at + beat / 2, 0.06)
    if i % 4 == 0:
        ts = np.arange(int(beat * 4 * SR)) / SR
        add(mus, lp(sum(np.sin(2 * np.pi * note(m) * ts) for m in prog[bar]) / 4 * np.minimum(1, ts / 0.08) * np.exp(-ts * 0.5), 1800), at, 0.12)
    i += 1
e = np.ones(n); E = int(T * SR)
if c.get('smoothEnd'):
    v0 = int((c['videoDur'] + 0.4) * SR); e[v0:E] *= np.linspace(1, 0, E - v0) ** 1.5; e[E:] = 0
else:
    fo = int(0.8 * SR); e[E - fo:E] *= np.linspace(1, 0, fo)
mus *= e * 0.5
if c.get('smoothEnd'):  # accord final tenu qui résout la musique
    ts = np.arange(int((c['endDur'] + 0.3) * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m_) * ts) + 0.4 * np.sin(4 * np.pi * note(m_) * ts) for m_ in [52, 64, 68, 71, 76]) / 5
    pad *= np.minimum(1, ts / 0.05) * np.exp(-ts * 1.1)
    add(mus, lp(pad, 2400), c['videoDur'] - 0.05, 0.42)
for k in range(len(c['hook'])): add(sfx, pop_sfx(), 0.07 + k * 0.2, 0.3)
for s in c['shots'][1:]: add(sfx, whoosh(0.4), s['from'] - 0.2, 0.32); add(sfx, boom(), s['from'], 0.08)
for k in range(len(c['shots'])): add(sfx, pop_sfx(), c['shots'][k]['from'] + (1.75 if k == 0 else 0.1), 0.18)
tt = np.arange(int(0.9 * SR)) / SR
add(sfx, hp(rng.standard_normal(len(tt)), 1500) * (tt / 0.9) ** 2 * 0.4, c['videoDur'] - 0.9, 0.25)
add(sfx, boom(), c['videoDur'], 0.22); add(sfx, chime(88), c['videoDur'] + 0.1, 0.2)
for k in range(len(c['shots'])): add(sfx, pop_sfx(), c['videoDur'] + k * 0.1, 0.15)
mix = (mus + sfx)[: int(T * SR)]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.3
out = 'public/' + c['bed']; wavfile.write(out, SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', out, round(T, 2))
