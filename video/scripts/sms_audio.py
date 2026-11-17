"""Musique lo-fi + sons de messagerie de la pub SMS → public/sms/bed.wav (timeline = SmsPub.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
C = json.load(open('src/sms/sms.json'))
MSGS = [(False, 44, 'video'), (False, 140, ''), (True, 162, ''), (False, 178, ''), (True, 194, ''), (False, 208, ''), (True, 222, ''), (False, 238, ''), (True, 268, 'g'), (False, 292, ''), (True, 310, ''), (False, 336, ''), (True, 356, 'link')]
T = dict(open=36, zoom=394, end=408, total=498)
AD = round((C['ad']['to'] - C['ad']['from']) * 30)
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.004, r=8.0, h=(1, 0.3)):
    t = np.arange(int(d * SR)) / SR
    return sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h)) * np.minimum(1, t / a) * np.exp(-t * r)
def sent():
    t = np.arange(int(0.16 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(500 + 1600 * t / 0.16) / SR) * np.exp(-t * 18) * 0.7 + hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 40) * 0.2
def received():
    return tone(88, 0.25, r=14) * 0.6 + tone(95, 0.25, r=16) * 0.4
def notif():
    x = tone(83, 0.18, r=10); y = tone(90, 0.3, r=8)
    out = np.zeros(int(0.5 * SR)); out[:len(x)] += x; out[int(0.12 * SR):int(0.12 * SR) + len(y)] += y
    return out
# lo-fi : accords doux, kick feutré, vinyle
bpm = 86; bt = 60 / bpm; bar = bt * 4
chords = [[50, 57, 60, 65], [47, 55, 59, 62], [45, 52, 57, 60], [43, 50, 55, 59]]
b = 0
while b * bar < s('total'):
    at = b * bar; tt = np.arange(int(bar * SR)) / SR
    pad = sum(np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt) for m in chords[b % 4]) / 4
    add(mus, lp(pad * np.minimum(1, tt / 0.05) * np.exp(-tt * 0.7), 1800), at, 0.16)
    add(mus, lp(tone(chords[b % 4][0] - 12, bar, r=1.2, h=(1, 0.5)), 300), at, 0.3)
    b += 1
i = 0
while i * bt < s('total'):
    add(mus, lp(kick(), 2000), i * bt, 0.4 if i % 2 == 0 else 0.0)
    if i % 2 == 1: add(mus, lp(hp(rng.standard_normal(int(0.12 * SR)), 1500) * np.exp(-np.arange(int(0.12 * SR)) / SR * 25), 5000), i * bt, 0.18)
    hh = hp(rng.standard_normal(int(0.03 * SR)), 7000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 120)
    add(mus, hh, i * bt + bt / 2, 0.05)
    i += 1
add(mus, lp(hp(rng.standard_normal(n), 3000), 9000) * 0.012, 0)
env = np.ones(n)
# la pub dans la bulle : musique baissée
a0 = int((44 / 30) * SR); a1 = int(((44 + AD) / 30) * SR)
env[a0 - 4000:a0] = np.linspace(1, 0.25, 4000); env[a0:a1] = 0.25; env[a1:a1 + 6000] = np.linspace(0.25, 1, 6000)
tl = int((s('total') - 0.8) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(1, 0, te - tl); env[te:] = 0
mus *= env
# sons
add(sfx, notif(), 6 / 30, 0.5); add(sfx, notif(), 20 / 30, 0.45)
add(sfx, click(1.2), 31 / 30, 0.4); add(sfx, whoosh(0.4), s('open') - 0.15, 0.25)
for me, at, k in MSGS:
    add(sfx, sent() if me else received(), at / 30, 0.45)
    if k == 'g': add(sfx, chime(86), at / 30 + 0.05, 0.25)
add(sfx, whoosh(0.5), s('zoom'), 0.35); add(sfx, boom(), s('end'), 0.4); add(sfx, chime(84), s('end') + 0.1, 0.25)
mix = (mus + sfx * 0.5)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) * 0.45
d = int(0.01 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/sms', exist_ok=True)
wavfile.write('public/sms/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', T)
