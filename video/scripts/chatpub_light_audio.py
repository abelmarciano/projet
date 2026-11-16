"""Musique + sound design de « Du chat à la pub » version claire (LightChatPub).
Usage : python3 scripts/chatpub_light_audio.py cp6 → public/chatpub/cp6-light-bed.wav (timeline = lightTimeline de LightChatPub.tsx)."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
cid = sys.argv[1]
c = json.load(open(f'src/chatpub/{cid}.json'))
ad = round(sum(s['to'] - s['from'] for s in c['segments']) * 30)
T = dict(h1=4, h2=92, chat=120, b1=126, typeA=134, typeB=172, pick=150, lock=184, send=204, gen=212, b2=214, write=240, shoot=262, edit=281, collapse=300, ad=318)
T['adEnd'] = T['ad'] + ad; T['fmt'] = T['adEnd']; T['press'] = T['fmt'] + 66; T['end'] = T['fmt'] + 104; T['total'] = T['end'] + 96
s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def riser(d):
    t = np.arange(int(d * SR)) / SR
    x = hp(rng.standard_normal(len(t)), 2500) * (t / d) ** 2
    return x * 0.5 * np.minimum(1, (d - t) / 0.03)
def sub(d=0.8):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (70 * np.exp(-t * 3) + 40) * t) * np.exp(-t * 4)
def pluck(m, d=0.5):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(4 * np.pi * note(m) * t)) * np.exp(-t * 7)
def swish(d=0.25):
    t = np.arange(int(d * SR)) / SR
    return hp(rng.standard_normal(len(t)), 4000) * np.sin(np.pi * t / d) ** 2 * 0.6
bpm = 120; beat = 60 / bpm; bar = beat * 4
chords = [[57, 61, 64, 68, 73], [54, 61, 64, 69, 73], [50, 57, 62, 66, 69], [52, 59, 64, 68, 71]]  # A maj7 / F#m / D / E — lumineux
bass = [45, 42, 38, 40]
arp = [0, 2, 4, 3, 1, 4, 2, 3]
for b in range(int(s('total') / bar) + 2):
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.08) * np.exp(-tt * 0.35)
    pad = sum(np.sin(2 * np.pi * note(m) * tt + 0.2 * np.sin(2 * np.pi * 0.25 * tt)) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 3200) * e * 0.16, b * bar)
    bs = np.sin(2 * np.pi * note(bass[b % 4]) * tt) * np.exp(-((tt % beat) * 3.5))
    add(mus, lp(bs, 260) * 0.28, b * bar)
    for k in range(8):
        add(mus, pluck(chords[b % 4][arp[k]] + 12, 0.35), b * bar + k * beat / 2, 0.06)
i = 0
while i * beat < s('total'):
    at = i * beat
    if at > s('h2') - 0.05: add(mus, kick(), at, 0.42)
    hh = hp(rng.standard_normal(int(0.025 * SR)), 9500) * np.exp(-np.arange(int(0.025 * SR)) / SR * 160)
    add(mus, hh, at + beat / 2, 0.08)
    if i % 2 == 1 and at > s('chat'):
        cl = hp(rng.standard_normal(int(0.08 * SR)), 2500) * np.exp(-np.arange(int(0.08 * SR)) / SR * 45)
        add(mus, cl, at, 0.13)
    i += 1
env = np.ones(n) * 0.75
def ramp(a, b, v0, v1):
    ia, ib = int(a * SR), int(b * SR); env[ia:ib] = np.linspace(v0, v1, max(1, ib - ia))
ramp(0, 0.2, 0, 0.75)
ramp(s('ad') - 0.3, s('ad') + 0.2, 0.75, 0.16); env[int((s('ad') + 0.2) * SR):int((s('adEnd') - 0.3) * SR)] = 0.16
ramp(s('adEnd') - 0.3, s('adEnd') + 0.1, 0.16, 0.75)
ramp(s('total') - 1.2, s('total'), 0.75, 0); env[int(s('total') * SR):] = 0
mus *= env
# accroche : un « trait » par ligne barrée
w1 = c['words']['h1']
for t0 in [w1[2]['s'] + 0.47, w1[4]['s'] + 0.47 if len(w1) > 4 else 1.6, w1[-1]['e'] + 0.07]:
    add(sfx, swish(0.22), s('h1') + t0, 0.5); add(sfx, click(0.8), s('h1') + t0 + 0.05, 0.12)
add(sfx, sub(), s('h2') + 0.15, 0.55); add(sfx, chime(81), s('h2') + 0.2, 0.18)
add(sfx, whoosh(0.5), s('chat') - 0.1, 0.3)
for j in range(T['typeA'], T['typeB'], 2):
    add(sfx, click(1.0 + 0.4 * rng.random()), j / 30 + 0.01 * rng.random(), 0.13)
tk = s('pick'); gap = 0.05
while tk < s('lock') - 0.05:
    add(sfx, click(1.5), tk, 0.1); tk += gap; gap *= 1.17
add(sfx, chime(85), s('lock'), 0.25); add(sfx, pop_sfx(), s('lock') + 0.2, 0.25)
add(sfx, riser(0.6), s('send') - 0.55, 0.25); add(sfx, pop_sfx(), s('send'), 0.45)
add(sfx, whoosh(0.5), s('gen'), 0.25)
for k, m in [('write', 81), ('shoot', 85), ('edit', 88)]:
    add(sfx, chime(m), s(k), 0.24); add(sfx, pop_sfx(), s(k), 0.2)
add(sfx, riser(0.9), s('collapse') - 0.3, 0.25)
add(sfx, whoosh(0.6), s('collapse') + 0.1, 0.35); add(sfx, sub(0.7), s('ad'), 0.45)
acc = 0
for sg in c['segments'][:-1]:
    acc += sg['to'] - sg['from']; add(sfx, swish(0.18), s('ad') + acc - 0.08, 0.25)
add(sfx, whoosh(0.5), s('adEnd') - 0.25, 0.3); add(sfx, sub(0.6), s('adEnd'), 0.3)
for i in range(3): add(sfx, pop_sfx(), s('fmt') + (4 + i * 5) / 30, 0.22)
add(sfx, pop_sfx(), s('press'), 0.5); add(sfx, chime(86), s('press') + 0.2, 0.3); add(sfx, chime(93), s('press') + 0.33, 0.2)
add(sfx, boom(), s('end'), 0.3); add(sfx, chime(81), s('end') + 0.15, 0.2); add(sfx, chime(88), s('end') + 0.3, 0.14)
mix = (mus + sfx)[: int(s('total') * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.42
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write(f'public/chatpub/{cid}-light-bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's')
