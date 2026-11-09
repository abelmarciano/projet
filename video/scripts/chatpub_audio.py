"""Music bed + UI sound design for « Du chat à la pub » (voices and the ad's own sound are added in Remotion).
Usage: python3 scripts/chatpub_audio.py cp1  → public/chatpub/cp1-bed.wav. Timeline mirrors timeline() in src/chatpub/ChatToAd.tsx."""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])

def T_of(c):
    T = dict(hookEnd=66, tapActorChip=80, modalIn=84, tapCharlotte=104, tapUse=120, modalOut=124, actorChip=128, typeStart=134, send=180, threadIn=182, reply=192, genStart=196, genDone=236, zoom=246, videoStart=262)
    T['videoEnd'] = T['videoStart'] + c['videoFrames']; T['back'] = T['videoEnd']
    T['tapPublish'] = T['back'] + 58; T['published'] = T['tapPublish'] + 6; T['end'] = T['back'] + 80; T['total'] = T['end'] + 72
    return T

def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain

cid = sys.argv[1]
c = json.load(open(f'src/chatpub/{cid}.json'))
T = T_of(c); s = lambda k: T[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
bpm = 124; beat = 60 / bpm; bar = beat * 4
chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [55, 59, 62, 66, 69], [52, 55, 59, 62, 67]]
bass = [45, 41, 43, 40]
for b in range(int(s('total') / bar) + 2):
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.06) * np.exp(-tt * 0.4)
    pad = sum(np.sin(2 * np.pi * note(m) * tt + 0.3 * np.sin(2 * np.pi * 0.25 * tt)) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 1800) * e * 0.16, b * bar)
    bs = np.sin(2 * np.pi * note(bass[b % 4]) * tt) * np.exp(-((tt % beat) * 3.2))
    add(mus, lp(bs, 380) * 0.26, b * bar)
i = 0
while i * beat < s('total'):
    at = i * beat
    if at > s('hookEnd') - 0.1:
        add(mus, kick(), at, 0.38)
        h = hp(rng.standard_normal(int(0.04 * SR)), 8000) * np.exp(-np.arange(int(0.04 * SR)) / SR * 100)
        add(mus, h, at + beat / 2, 0.08)
    i += 1
# music: soft under the hook, normal in the chat, OFF during the ad, back for publish + end
env = np.ones(n) * 0.0
def ramp(a, b, v0, v1):
    ia, ib = int(a * SR), int(b * SR); env[ia:ib] = np.linspace(v0, v1, ib - ia)
ramp(0, s('hookEnd'), 0.35, 0.45)
ramp(s('hookEnd'), s('videoStart') - 0.3, 0.75, 0.75)
ramp(s('videoStart') - 0.3, s('videoStart'), 0.75, 0)
ramp(s('back'), s('back') + 0.4, 0, 0.75)
ramp(s('back') + 0.4, s('total') - 1.2, 0.75, 0.75)
ramp(s('total') - 1.2, s('total'), 0.75, 0)
mus *= env
# sfx
add(sfx, whoosh(0.5), s('hookEnd') - 0.35, 0.25)
for k in ['tapActorChip', 'tapCharlotte', 'tapUse']:
    add(sfx, pop_sfx(), s(k), 0.35)
add(sfx, whoosh(0.35), s('modalIn') - 0.1, 0.12)
for j in range(T['typeStart'], T['send'] - 8, 2):
    add(sfx, click(1.0 + 0.4 * rng.random()), j / 30 + 0.01 * rng.random(), 0.16)
add(sfx, pop_sfx(), s('send'), 0.4); add(sfx, whoosh(0.4), s('send'), 0.15)
add(sfx, chime(79), s('genDone'), 0.22)
add(sfx, whoosh(0.6), s('zoom'), 0.3); add(sfx, boom(), s('videoStart'), 0.2)
add(sfx, whoosh(0.45), s('back') - 0.2, 0.2)
add(sfx, pop_sfx(), s('tapPublish'), 0.4); add(sfx, chime(84), s('published'), 0.3); add(sfx, chime(88), s('published') + 0.12, 0.2)
add(sfx, boom(), s('end'), 0.25); add(sfx, chime(76), s('end') + 0.1, 0.18)
mix = (mus + sfx)[: int(s('total') * SR)]
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.5  # leave headroom for the voice
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.92 + mix * 0.08], 1)
os.makedirs('public/chatpub', exist_ok=True)
wavfile.write(f'public/chatpub/{cid}-bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', cid, round(s('total'), 2), 's')
