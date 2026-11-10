"""Music + sound design for LaunchReel (src/chatpub/LaunchReel.tsx). Ducked under the UGC clips' own voices.
Usage: python3 scripts/launch_audio.py → public/chatpub/launch-bed.wav"""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
L = json.load(open('src/chatpub/launch.json'))
fr = lambda s: round(s * 30)
clips = L['clips']; hook, montage = clips[0], clips[1:]
T = {'hookEnd': fr(hook['to'] - hook['from'])}
T['aEnd'] = T['hookEnd'] + 62; T['mStart'] = T['aEnd']
cuts = []; t = T['mStart']
for c in montage: cuts.append(t); t += fr(c['to'] - c['from'])
T['mEnd'] = t; T['bEnd'] = t + 186; T['cEnd'] = T['bEnd'] + 118; T['total'] = T['cEnd'] + 96
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def sub(d=0.8):
    tt = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (60 * np.exp(-tt * 3) + 35) * tt) * np.exp(-tt * 3.5)
def riser(d):
    tt = np.arange(int(d * SR)) / SR
    return (hp(rng.standard_normal(len(tt)), 1500) * (tt / d) ** 2 * 0.5 + np.sin(2 * np.pi * (200 + 1800 * (tt / d) ** 2) * tt) * (tt / d) ** 3 * 0.3) * np.minimum(1, (d - tt) / 0.03)
bpm = 128; beat = 60 / bpm; bar = beat * 4
chords = [[50, 57, 60, 64, 69], [46, 53, 57, 62, 65], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64]]; bass = [38, 34, 36, 33]
for b in range(int(s('total') / bar) + 2):
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.04) * np.exp(-tt * 0.5)
    pad = sum(np.sin(2 * np.pi * note(m) * tt) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 2400) * e * 0.18, b * bar)
    bs = np.sign(np.sin(2 * np.pi * note(bass[b % 4]) * tt)) * np.exp(-((tt % (beat / 2)) * 5))
    add(mus, lp(bs, 300) * 0.22, b * bar)
i = 0
while i * beat < s('total'):
    at = i * beat; add(mus, kick(), at, 0.5)
    hh = hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140)
    add(mus, hh, at + beat / 2, 0.1)
    if i % 2: add(mus, hp(rng.standard_normal(int(0.12 * SR)), 1800) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30), at, 0.15)
    i += 1
env = np.ones(n) * 0.75
def setr(a, b, v): env[int(a * SR):int(b * SR)] = v
setr(0, s('hookEnd'), 0.18)           # under Sabrina's voice
setr(s('mStart'), s('mEnd'), 0.22)    # under the ads' voices
env = np.convolve(env, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode='same')
fo = int(1.0 * SR); e_i = int(s('total') * SR); env[e_i - fo:e_i] *= np.linspace(1, 0, fo)
mus *= env
add(sfx, whoosh(0.5), s('hookEnd') - 0.3, 0.3); add(sfx, sub(), s('hookEnd'), 0.4)
for k in range(6): add(sfx, pop_sfx(), s('hookEnd') + (2 + k * 3) / 30, 0.18)
for c in cuts: add(sfx, whoosh(0.3), c / 30 - 0.15, 0.16)
add(sfx, riser(0.8), s('mEnd') - 0.7, 0.2); add(sfx, sub(), s('mEnd'), 0.35)
for j in range(T['mEnd'] + 8, T['mEnd'] + 52, 2): add(sfx, click(1.0 + 0.4 * rng.random()), j / 30, 0.13)
add(sfx, pop_sfx(), s('mEnd') + 58 / 30, 0.4); add(sfx, boom(), s('mEnd') + 62 / 30, 0.35)
add(sfx, chime(79), s('mEnd') + 138 / 30, 0.25)
add(sfx, whoosh(0.5), s('bEnd') - 0.2, 0.25)
add(sfx, pop_sfx(), s('bEnd') + 34 / 30, 0.45); add(sfx, chime(84), s('bEnd') + 38 / 30, 0.3)
for k in range(3): add(sfx, chime(88 - 2 * k), s('bEnd') + (58 + 12 * k) / 30, 0.2)
add(sfx, boom(), s('cEnd'), 0.35); add(sfx, chime(76), s('cEnd') + 0.1, 0.2)
mix = (mus + sfx)[: int(s('total') * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write('public/chatpub/launch-bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's', T)
