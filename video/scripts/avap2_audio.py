"""Bed for AvantApres2: ticking clock + low drone (before), whoosh/boom (transition), upbeat beat (after, ducked under the ad).
Usage: python3 scripts/avap2_audio.py → public/chatpub/avap2-bed.wav"""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'rng'])
J = json.load(open('src/chatpub/avap2.json')); AF = J['after']['frames']
T = {'before': 468}; T['tr'] = 468; T['prompt'] = T['tr'] + 34; T['ad'] = T['prompt'] + 196; T['pub'] = T['ad'] + AF; T['end'] = T['pub'] + 104; T['total'] = T['end'] + 105
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
tick = hp(rng.standard_normal(int(0.02 * SR)), 3000) * np.exp(-np.arange(int(0.02 * SR)) / SR * 300)
t = 0.0
while t < s('tr'):
    add(sfx, tick, t, 0.22 if int(t * 2) % 2 == 0 else 0.14); t += 0.5
tt = np.arange(int(s('tr') * SR)) / SR
drone = (np.sin(2 * np.pi * note(38) * tt) + 0.5 * np.sin(2 * np.pi * note(45) * tt)) * 0.05 * np.minimum(1, tt / 1.5)
add(mus, lp(drone, 400), 0)
add(sfx, whoosh(0.7), s('tr') - 0.4, 0.5); add(sfx, boom(), s('tr'), 0.5); add(sfx, chime(84), s('tr') + 0.15, 0.3)
bpm = 122; beat = 60 / bpm; prog_ = [[60, 64, 67, 71], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]
i = 0; t0 = s('prompt')
while t0 + i * beat < s('total'):
    at = t0 + i * beat; bar = (i // 4) % 4
    add(mus, kick(), at, 0.42)
    if i % 2: add(mus, hp(rng.standard_normal(int(0.12 * SR)), 1800) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30), at, 0.14)
    add(mus, hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140), at + beat / 2, 0.09)
    if i % 4 == 0:
        ts = np.arange(int(beat * 4 * SR)) / SR
        pad = sum(np.sin(2 * np.pi * note(m) * ts) for m in prog_[bar]) / 4 * np.minimum(1, ts / 0.05) * np.exp(-ts * 0.5)
        add(mus, lp(pad, 2200), at, 0.16)
    i += 1
env = np.ones(n); env[int(s('ad') * SR):int(s('pub') * SR)] = 0.25; env[int(s('end') * SR):] = 0.6
env = np.convolve(env, np.ones(int(0.1 * SR)) / int(0.1 * SR), mode='same'); e = int(s('total') * SR); fo = int(1.2 * SR); env[e - fo:e] *= np.linspace(1, 0, fo)
mus *= env
for fr in (68, 95, 112, 133): add(sfx, pop_sfx(), s('prompt') + fr / 30, 0.32)
add(sfx, whoosh(0.5), s('ad') - 0.3, 0.3); add(sfx, whoosh(0.5), s('pub') - 0.3, 0.3)
add(sfx, pop_sfx(), s('pub') + 34 / 30, 0.45); add(sfx, chime(84), s('pub') + 38 / 30, 0.3)
add(sfx, boom(), s('end'), 0.35); add(sfx, chime(79), s('end') + 0.1, 0.22)
mix = (mus + sfx)[: int(s('total') * SR)]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.45
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write('public/chatpub/avap2-bed.wav', SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', round(s('total'), 2), T)
