"""Bruitages + fond musical du split-screen chat (SplitChat) : frappe clavier pendant la saisie, clic à l'envoi et sur « Publier »,
pop à chaque ligne cochée, whoosh quand la pub est prête, chime de succès sur Meta. Usage : python3 scripts/split_audio.py → public/<cfg.bed>"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, click, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'click', 'rng'])
c = json.load(open(f"src/chatpub/{sys.argv[1] if len(sys.argv) > 1 else 'split'}.json")); Q = c['cues']
T = c['total'] / 30; n = int(T * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pluck(m, d=0.35):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * note(m) * t) + 0.3 * np.sin(4 * np.pi * note(m) * t)) * np.exp(-t * 9)
def key():
    k = int(0.025 * SR); t = np.arange(k) / SR
    return hp(rng.standard_normal(k), 2500) * np.exp(-t * 260) * (0.6 + 0.4 * rng.random())
# fond : lo-fi léger, 96 bpm
bpm = 96; beat = 60 / bpm; prog = [[62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 71], [57, 60, 64, 67]]; mel = [74, 77, 81, 77, 79, 77, 74, 72]
i = 0
while i * beat < T:
    at = i * beat; bar = (i // 4) % 4
    add(mus, kick(), at, 0.22 if i % 2 == 0 else 0.0); add(mus, pluck(mel[i % 8]), at + beat / 2, 0.08)
    add(mus, hp(rng.standard_normal(int(0.03 * SR)), 9000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 140), at + beat / 2, 0.05)
    if i % 4 == 0:
        ts = np.arange(int(beat * 4 * SR)) / SR
        add(mus, lp(sum(np.sin(2 * np.pi * note(m) * ts) for m in prog[bar]) / 4 * np.minimum(1, ts / 0.08) * np.exp(-ts * 0.5), 1800), at, 0.12)
    i += 1
e = np.ones(n); fo = int(0.8 * SR); E = int(T * SR); e[E - fo:E] *= np.linspace(1, 0, fo); mus *= e * 0.5
def typing(a, b):
    t = a + 0.05
    while t < b - 0.3:
        add(sfx, key(), t, 0.22); t += 0.07 + rng.random() * 0.06
if 'ask1' in Q:
    for a, b in [('ask1', 'send1'), ('ask2', 'send2')]:
        typing(Q[a], Q[b]); add(sfx, click(1.2), Q[b], 0.5); add(sfx, whoosh(0.4), Q[b] + 0.05, 0.22)
if 'list' in Q:  # split « concurrents »
    for i in range(3): add(sfx, pop_sfx(), Q['list'] + i * 4 / 30, 0.28)
    for k in ['hook', 'angle']: add(sfx, pop_sfx(), Q[k], 0.22)
    add(sfx, click(1.2), Q['pick'], 0.5)
    add(sfx, whoosh(0.5), Q['ready'] - 0.25, 0.3); add(sfx, chime(88), Q['ready'], 0.18); add(sfx, boom(), Q['ready'], 0.14)
elif 'ask1' in Q:  # split « stats » : tuiles, leads
    add(sfx, chime(84), Q['sum'], 0.14)
    for k in ['spent', 'cpc', 'cpl']: add(sfx, pop_sfx(), Q[k], 0.32)
    for i in range(5): add(sfx, pop_sfx(), Q['leads'] + i * 5 / 30, 0.2)
    add(sfx, chime(91), Q['leads'] + 0.2, 0.16)
else:
    typing(Q['write'], Q['send'])
    add(sfx, click(1.2), Q['send'], 0.5); add(sfx, whoosh(0.4), Q['send'] + 0.05, 0.22)
    for k in ['actor', 'script', 'voice', 'subs']: add(sfx, pop_sfx(), Q[k], 0.32)
    add(sfx, whoosh(0.5), Q['ready'] - 0.25, 0.3); add(sfx, chime(84), Q['ready'], 0.16)
    add(sfx, click(1.2), Q['click'], 0.55)
    add(sfx, chime(91), Q['meta'], 0.2); add(sfx, boom(), Q['meta'], 0.18)
add(sfx, whoosh(0.3), Q['look'] - 0.15, 0.2)
mix = (mus + sfx)[: int(T * SR)]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.3
out = 'public/' + c['bed']; wavfile.write(out, SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', out, round(T, 2))
