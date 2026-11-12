"""Ambiance de AvantApres4 : avant lent et mineur (tic-tac, « bonk » des prises ratées), montée + impact à la transition,
clavier + chime dans le chat, fond entraînant discret sous la voix de l'après, accord final + fondu.
Usage : python3 scripts/avap4_audio.py avap4 → public/<cfg.bed>"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, chime, pop_sfx, click, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'chime', 'pop_sfx', 'click', 'rng'])
c = json.load(open(f'src/chatpub/{sys.argv[1] if len(sys.argv) > 1 else "avap4"}.json'))
B = c['before']['dur']; T = B + c['tr']['dur']; C = T + c['chat']['dur']; D = C + c['after']['dur']; E = D + c['end']['dur']
n = int(E * SR) + SR; mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def pad(ms, dur, g=0.12, cut=1500):
    ts = np.arange(int(dur * SR)) / SR
    return lp(sum(np.sin(2 * np.pi * note(m) * ts) for m in ms) / len(ms) * np.minimum(1, ts / 0.3) * np.minimum(1, (dur - ts) / 0.4), cut) * g
# avant : accords mineurs lents + tic-tac
for k, ch in enumerate([[57, 60, 64], [53, 57, 60], [55, 59, 62]]):
    add(mus, pad(ch, 2.4), k * 2.2, 0.9)
t = 0.3
while t < B:
    add(sfx, click(2.2) * 0.5, t, 0.10); t += 0.5
takes = c['before']['takes']; ta = c['before']['takeAt']
for k in range(takes):
    at = 0.66 + (ta - 0.66) * ((k + 1) / takes) ** 0.5
    tt = np.arange(int(0.12 * SR)) / SR; add(sfx, np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 30), at, 0.12)
# transition
tt = np.arange(int(0.9 * SR)) / SR
add(sfx, hp(rng.standard_normal(len(tt)), 1500) * (tt / 0.9) ** 2 * 0.5, B - 0.85, 0.3); add(sfx, boom(), B, 0.3); add(sfx, chime(84), B + 0.1, 0.18)
# chat : clavier + chime
t = T + 0.1
while t < T + 1.0: add(sfx, click(1.6), t, 0.12); t += 0.06 + rng.random() * 0.04
lk = c['chat'].get('lockAt', 1.4); rd = c['chat'].get('readyAt', 1.4)
t = T + 0.85
while t < T + lk - 0.05:  # tic du carrousel qui ralentit
    add(sfx, click(2.0), t, 0.10); t += 0.05 + (t - T - 0.85) * 0.12
add(sfx, whoosh(0.3), T + lk - 0.2, 0.2); add(sfx, pop_sfx(), T + lk, 0.35); add(sfx, chime(88), T + lk + 0.05, 0.14)
add(sfx, chime(91), T + rd, 0.2)
# fond entraînant (chat + après), discret
bpm = 112; beat = 60 / bpm; prog = [[64, 68, 71], [61, 64, 68], [66, 69, 73], [59, 63, 66]]
i = 0
while T + i * beat < D:
    at = T + i * beat; bar = (i // 4) % 4
    add(mus, kick(), at, 0.18 if at < C else 0.10)
    if i % 4 == 0: add(mus, pad(prog[bar], beat * 4, 0.10, 2000), at, 1.0 if at < C else 0.6)
    i += 1
# fin : accord + chime
add(mus, pad([52, 64, 68, 71, 76], c['end']['dur'] + 0.2, 0.2, 2400), D - 0.05, 1.0); add(sfx, chime(88), D + 0.1, 0.18)
e = np.ones(n); E0 = int(E * SR); e[E0 - int(1.2 * SR):E0] = np.linspace(1, 0, int(1.2 * SR)); e[E0:] = 0
mix = ((mus * 0.6 + sfx) * e)[: int(E * SR)]; mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.28
out = 'public/' + c['bed']; wavfile.write(out, SR, (np.stack([mix, mix], 1) * 32767).astype(np.int16)); print('ok', out, round(E, 2))
