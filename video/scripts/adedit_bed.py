"""Sound design for an AdEdit cfg with fx: light music bed ducked under the voice, whoosh on each cut, pop on each sticker,
shimmer on the first frame, soft riser + hit at the end. Usage: python3 scripts/adedit_bed.py <ad-id> → public/<cfg.bed>"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'rng'])
a = json.load(open(f'src/chatpub/ad-{sys.argv[1]}.json'))
T = a['frames'] / 30; n = int(T * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pluck(m, d=0.4):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(4 * np.pi * note(m) * t)) * np.exp(-t * 8)
bpm = 112; beat = 60 / bpm; prog = [[64, 67, 71, 74], [60, 64, 67, 71], [62, 65, 69, 72], [59, 62, 67, 71]]; mel = [76, 79, 83, 79, 81, 79, 76, 74]
i = 0
while i * beat < T:
    at = i * beat; bar = (i // 4) % 4
    add(mus, kick(), at, 0.28); add(mus, pluck(mel[i % 8]), at + beat / 2, 0.12)
    add(mus, hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140), at + beat / 2, 0.06)
    if i % 4 == 0:
        ts = np.arange(int(beat * 4 * SR)) / SR
        add(mus, lp(sum(np.sin(2 * np.pi * note(m) * ts) for m in prog[bar]) / 4 * np.minimum(1, ts / 0.08) * np.exp(-ts * 0.6), 2000), at, 0.12)
    i += 1
env = np.full(n, 0.55); fo = int(0.8 * SR); e = int(T * SR); env[e - fo:e] *= np.linspace(1, 0.2, fo); mus *= env
acc = 0; cuts = []
for sg in a['segments']:
    cuts.append(acc); acc += round((sg['to'] - sg['from']) * 30) / 30
for c in cuts[1:]: add(sfx, whoosh(0.35), c - 0.17, 0.32)
for st in a.get('stickers', []): add(sfx, pop_sfx(), st['from'], 0.35)
add(sfx, chime(88), 0.05, 0.14)
tt = np.arange(int(0.9 * SR)) / SR
riser = hp(rng.standard_normal(len(tt)), 1500) * (tt / 0.9) ** 2 * 0.4
add(sfx, riser, T - 1.4, 0.25); add(sfx, boom(), T - 0.5, 0.25)
mix = (mus + sfx)[: int(T * SR)]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.32
out = 'public/' + a['bed']; os.makedirs(os.path.dirname(out), exist_ok=True)
wavfile.write(out, SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', out, round(T, 2), cuts)
