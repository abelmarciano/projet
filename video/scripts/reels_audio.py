"""Music bed + sound design for the organic Reels (no voice).

Usage: python3 scripts/reels_audio.py [r6 r7 ...]  → public/reels/<id>.wav (48 kHz stereo)
Scene plan mirrors plan() in src/reels/Reels.tsx.
"""
import json, os, sys
import numpy as np
from scipy.io import wavfile

src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
cwd = os.getcwd()
exec(src, g)  # note, lp, hp, env, kick, whoosh, boom, click, chime, pop_sfx, SR, rng
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
FPS = 30
REELS = json.load(open('src/reels/reels.json'))

PLAN = {
    'launch': [('hook', 66), ('c0', 42), ('c1', 42), ('c2', 42), ('say', 66), ('end', 96)],
    'coulisses': [('hook', 54), ('prompt', 120), ('clip', 222), ('end', 90)],
    'casting': [('hook', 54), ('grid', 66), ('p0', 36), ('p1', 36), ('p2', 36), ('p3', 36), ('end', 90)],
    'hooks': [('hook', 54), ('h0', 54), ('h1', 54), ('h2', 54), ('say', 60), ('end', 90)],
}
PROGS = [
    ([[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 52, 55, 59, 64], [55, 59, 62, 66, 69]], [45, 41, 36, 43]),
    ([[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [48, 52, 55, 58, 62], [45, 48, 52, 55, 60]], [38, 34, 36, 33]),
    ([[52, 55, 59, 62, 66], [48, 52, 55, 59, 62], [50, 53, 57, 60, 64], [47, 50, 54, 57, 62]], [40, 36, 38, 35]),
    ([[55, 59, 62, 66, 69], [52, 55, 59, 62, 67], [48, 52, 55, 59, 62], [50, 54, 57, 60, 66]], [43, 40, 36, 38]),
]


def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i : i + len(x)] += x * gain


def build(r, k):
    plan = PLAN[r['kind']]
    if r['kind'] == 'launch':
        plan = [('hook', 60)] + [(f'c{i}', 42) for i in range(len(r['clips']))] + [('say', 60), ('end', 90)]
    if r['kind'] == 'coulisses' and r['clip'] == 'ugc-solaire.mp4':
        plan = [(n, 150 if n == 'clip' else d) for n, d in plan]
    total = sum(d for _, d in plan) / FPS
    n = int(total * SR) + SR
    mus = np.zeros(n)
    sfx = np.zeros(n)
    bpm = r.get('bpm', 120)
    beat = 60 / bpm
    chords, bass = PROGS[k % len(PROGS)]
    bar = beat * 4
    t = np.arange(n) / SR
    # pads + bass, one chord per bar
    for b in range(int(total / bar) + 2):
        s0 = b * bar
        ch = chords[b % 4]
        seg = int(bar * SR)
        tt = np.arange(seg) / SR
        e = np.minimum(1, tt / 0.08) * np.exp(-tt * 0.35)
        pad = sum(np.sin(2 * np.pi * note(m) * tt + np.sin(2 * np.pi * 0.3 * tt) * 0.4) for m in ch) / len(ch)
        add(mus, lp(pad, 2200) * e * 0.20, s0)
        bt = np.arange(seg) / SR
        bs = np.sin(2 * np.pi * note(bass[b % 4]) * bt) * np.exp(-((bt % beat) * 3.0))
        add(mus, lp(bs, 400) * 0.30, s0)
    # drums from the first cut on
    first = plan[0][1] / FPS
    i = 0
    while i * beat < total - 0.5:
        at = i * beat
        if at >= first - 0.01:
            add(mus, kick(), at, 0.55)
            hat = hp(rng.standard_normal(int(0.05 * SR)), 7000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90)
            add(mus, hat, at + beat / 2, 0.10)
        i += 1
    # cuts
    tc = 0
    for name, d in plan:
        s = tc / FPS
        if tc > 0:
            add(sfx, whoosh(0.45), s - 0.35, 0.22)
        if name == 'prompt':
            for j in range(0, 82, 3):
                add(sfx, click(1.0 + 0.3 * rng.random()), s + (4 + j) / FPS, 0.25)
            add(sfx, pop_sfx(), s + 92 / FPS, 0.5)
            add(sfx, chime(79), s + 98 / FPS, 0.18)
        if name in ('clip', 'c0', 'p0', 'h0', 'grid'):
            add(sfx, boom(), s, 0.35)
        if name == 'end':
            add(sfx, chime(76), s + 0.1, 0.22)
            add(sfx, boom(), s, 0.3)
        tc += d
    # duck music a little under the end card, fade out
    fade = np.ones(n)
    fo = int(1.2 * SR)
    end_i = int(total * SR)
    fade[end_i - fo : end_i] = np.linspace(1, 0, fo)
    fade[end_i:] = 0
    mix = mus * fade + sfx
    mix = mix[: end_i]
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
    # gentle stereo width
    d = int(0.012 * SR)
    left = mix
    right = np.concatenate([np.zeros(d), mix[:-d]]) * 0.92 + mix * 0.08
    st = np.stack([left, right], 1)
    os.makedirs('public/reels', exist_ok=True)
    wavfile.write(f"public/reels/{r['id']}.wav", SR, (st * 32767).astype(np.int16))
    print('ok', r['id'], round(total, 2), 's')


ids = sys.argv[1:] or [r['id'] for r in REELS]
for k, r in enumerate(REELS):
    if r['id'] in ids:
        build(r, k)
