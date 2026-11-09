"""Intro (typing clicks + whoosh) and end-card (chime + pad) audio for showcase reels → public/reels/show-intro.wav, show-end.wav"""
import os, numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {}; exec(src, g)
SR, note, lp, click, whoosh, chime, pop_sfx, boom = (g[k] for k in ['SR', 'note', 'lp', 'click', 'whoosh', 'chime', 'pop_sfx', 'boom'])
def add(b, x, t, gain=1.0):
    i = int(t * SR); x = x[: max(0, len(b) - i)]; b[i:i + len(x)] += x * gain
def save(name, b):
    b = b / (np.max(np.abs(b)) + 1e-9) * 0.8
    st = np.stack([b, b], 1)
    os.makedirs('public/reels', exist_ok=True)
    wavfile.write(f'public/reels/{name}.wav', SR, (st * 32767).astype(np.int16))
n = int(96 / 30 * SR); b = np.zeros(n); t = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * note(m) * t) for m in [57, 64, 69, 72]) / 4
add(b, lp(pad, 1500) * np.minimum(1, t / 0.3) * 0.12, 0)
for j in range(8, 66, 3): add(b, click(1.0), j / 30, 0.35)
add(b, pop_sfx(), 70 / 30, 0.6); add(b, chime(79), 72 / 30, 0.25); add(b, whoosh(0.5), 86 / 30 - 0.2, 0.35)
save('show-intro', b)
n = int(75 / 30 * SR); b = np.zeros(n); t = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * note(m) * t) for m in [52, 59, 64, 68, 71]) / 5
add(b, lp(pad, 1800) * np.minimum(1, t / 0.15) * np.linspace(1, 0, n) * 0.22, 0)
add(b, boom(), 0, 0.35); add(b, chime(76), 0.1, 0.3)
save('show-end', b)
print('ok')
