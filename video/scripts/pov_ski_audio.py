"""Musique originale entraînante (house légère, 124 bpm) pour le POV ski → public/media/pov-ski/music.wav"""
import os, sys
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}; exec(src, g)
SR, note, lp, hp, kick, chime, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'chime', 'rng'])
total = float(sys.argv[1]) if len(sys.argv) > 1 else 9.0
n = int(total * SR) + SR; mix = np.zeros(n)
def add(x, t, gain=1.0):
    i = int(t * SR)
    if 0 <= i < n: x = x[: n - i]; mix[i:i + len(x)] += x * gain
bpm = 124; bt = 60 / bpm; bar = 4 * bt
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 67]]
def stab(ms, d):
    t = np.arange(int(d * SR)) / SR
    s = sum(np.sign(np.sin(2 * np.pi * note(m) * t)) * 0.3 + np.sin(2 * np.pi * note(m) * t) for m in ms) / len(ms)
    return lp(s, 3200) * np.exp(-t * 7) * np.minimum(1, t / 0.004)
def bass(m, d):
    t = np.arange(int(d * SR)) / SR
    return lp(np.sin(2 * np.pi * note(m) * t) + 0.4 * np.sign(np.sin(2 * np.pi * note(m) * t)), 500) * np.exp(-t * 4) * np.minimum(1, t / 0.005)
def clap():
    m = int(0.18 * SR); t = np.arange(m) / SR
    return hp(rng.standard_normal(m), 1200) * (np.exp(-t * 30) + 0.5 * np.exp(-((t - 0.012) * 300) ** 2))
i = 0
while i * bt < total:
    t = i * bt; b = int(t // bar); ch = chords[b % 4]
    add(kick(), t, 0.9)
    if i % 2 == 1: add(clap(), t, 0.35)
    add(hp(rng.standard_normal(int(0.03 * SR)), 8000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 120), t + bt / 2, 0.18)  # open hat contretemps
    add(bass(ch[0] - 24, bt * 0.45), t + bt / 2, 0.5)
    for s in (0.5, 1.5) if i % 4 in (0, 2) else (0.75,):
        add(stab(ch, 0.2), t + s * bt / 2, 0.28)
    i += 1
mix = mix[: int(total * SR)]
fade = int(0.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.6) * 0.6
d = int(0.01 * SR); st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.85 + mix * 0.15], 1)
os.makedirs('public/media/pov-ski', exist_ok=True)
wavfile.write('public/media/pov-ski/music.wav', SR, (st * 32767).astype(np.int16)); print('ok')
