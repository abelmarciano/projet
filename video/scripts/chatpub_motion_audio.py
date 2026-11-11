"""Music + sound design for the motion version of « Du chat à la pub ».
Usage: python3 scripts/chatpub_motion_audio.py cp1 → public/chatpub/cp1-motion-bed.wav (timeline: src/chatpub/motion_timeline.json)."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
cid = sys.argv[1]
c = json.load(open(f'src/chatpub/{cid}.json'))
T = json.load(open('src/chatpub/motion_timeline.json'))
if c.get('noLeads'): T['leadsDur'] = 0
T['videoEnd'] = T['videoStart'] + c['videoFrames']; T['pub'] = T['videoEnd']; T['leads'] = T['pub'] + T['pubEnd']; T['end'] = T['leads'] + T.get('leadsDur', 0); T['total'] = T['end'] + T['endDur']
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def riser(d):
    t = np.arange(int(d * SR)) / SR
    x = hp(rng.standard_normal(len(t)), 1500) * (t / d) ** 2
    sw = np.sin(2 * np.pi * (200 + 1800 * (t / d) ** 2) * t) * (t / d) ** 3 * 0.3
    return (x * 0.5 + sw) * np.minimum(1, (d - t) / 0.03)
def sub(d=0.9):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (60 * np.exp(-t * 3) + 35) * t) * np.exp(-t * 3.5)
bpm = 126; beat = 60 / bpm; bar = beat * 4
chords = [[50, 57, 60, 64, 69], [46, 53, 57, 62, 65], [48, 55, 60, 64, 67], [45, 52, 57, 60, 64]]
bass = [38, 34, 36, 33]
for b in range(int(s('total') / bar) + 2):
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.04) * np.exp(-tt * 0.5)
    pad = sum(np.sin(2 * np.pi * note(m) * tt + 0.25 * np.sin(2 * np.pi * 0.3 * tt)) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 2400) * e * 0.18, b * bar)
    bs = np.sign(np.sin(2 * np.pi * note(bass[b % 4]) * tt)) * np.exp(-((tt % (beat / 2)) * 5))
    add(mus, lp(bs, 300) * 0.22, b * bar)
i = 0
while i * beat < s('total'):
    at = i * beat
    add(mus, kick(), at, 0.5)
    hh = hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140)
    add(mus, hh, at + beat / 2, 0.1); add(mus, hh, at + beat / 4 * 3, 0.05)
    if i % 2 == 1:
        sn = hp(rng.standard_normal(int(0.12 * SR)), 1800) * np.exp(-np.arange(int(0.12 * SR)) / SR * 30)
        add(mus, sn, at, 0.16)
    i += 1
env = np.zeros(n)
def ramp(a, b, v0, v1):
    ia, ib = int(a * SR), int(b * SR); env[ia:ib] = np.linspace(v0, v1, max(1, ib - ia))
ramp(0, 0.3, 0, 0.7); ramp(0.3, s('videoStart') - 0.25, 0.7, 0.7); ramp(s('videoStart') - 0.25, s('videoStart'), 0.7, 0)
ramp(s('pub'), s('pub') + 0.3, 0, 0.75); ramp(s('pub') + 0.3, s('total') - 1, 0.75, 0.75); ramp(s('total') - 1, s('total'), 0.75, 0)
mus *= env
# hits & transitions
add(sfx, sub(), 0.0, 0.5)
add(sfx, whoosh(0.5), s('hookEnd') - 0.3, 0.3); add(sfx, sub(0.6), s('hookEnd'), 0.3)
for j in range(T['hookEnd'] + 2, T['carouselLock'], 3):  # carousel ticks slowing down
    pass
tick_t = s('hookEnd'); gap = 0.05
while tick_t < s('carouselLock') - 0.05:
    add(sfx, click(1.4), tick_t, 0.12); tick_t += gap; gap *= 1.18
add(sfx, chime(84), s('carouselLock'), 0.25); add(sfx, pop_sfx(), s('carouselLock'), 0.3)
add(sfx, whoosh(0.4), s('actorEnd') - 0.25, 0.25)
for j in range(T['typeStart'], T['typeEnd'], 2):
    add(sfx, click(1.0 + 0.4 * rng.random()), j / 30 + 0.01 * rng.random(), 0.15)
add(sfx, riser(0.6), s('send') - 0.55, 0.35)
add(sfx, pop_sfx(), s('send'), 0.45); add(sfx, boom(), s('burst'), 0.45); add(sfx, sub(), s('burst'), 0.45)
add(sfx, riser(1.4), s('scanStart'), 0.18)
add(sfx, chime(79), s('ready'), 0.3); add(sfx, chime(86), s('ready') + 0.1, 0.18)
add(sfx, whoosh(0.6), s('expand'), 0.35)
add(sfx, whoosh(0.5), s('pub') - 0.2, 0.3); add(sfx, sub(0.6), s('pub'), 0.3)
add(sfx, pop_sfx(), s('pub') + T['press'] / 30, 0.5); add(sfx, chime(84), s('pub') + (T['press'] + 4) / 30, 0.32); add(sfx, chime(91), s('pub') + (T['press'] + 8) / 30, 0.22)
add(sfx, pop_sfx(), s('pub') + (T['press'] + 8) / 30, 0.25); add(sfx, pop_sfx(), s('pub') + (T['press'] + 14) / 30, 0.25)
if T.get('leadsDur'):
    add(sfx, whoosh(0.5), s('leads') - 0.2, 0.3); add(sfx, sub(0.6), s('leads'), 0.3)
    for i in range(3): add(sfx, chime(88 - i * 2), s('leads') + (10 + i * 14) / 30, 0.22)
    for i in range(5): add(sfx, pop_sfx(), s('leads') + (22 + i * 10) / 30, 0.2)
add(sfx, boom(), s('end'), 0.35); add(sfx, chime(76), s('end') + 0.1, 0.2)
mix = (mus + sfx)[: int(s('total') * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write(f'public/chatpub/{cid}-motion-bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's')
