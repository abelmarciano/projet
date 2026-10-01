"""Synthesised soundtrack for the Growthity promo, locked to the scene timeline.

Writes public/soundtrack.wav (48 kHz stereo). Run: python3 scripts/soundtrack.py
"""
import json
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 48000
FPS = 30
TL = json.load(open('src/timeline.json'))
IDS = [s['id'] for s in TL['scenes']]
SCENES = [s['duration'] for s in TL['scenes']]
TRANS = [t['duration'] for t in TL['transitions']]

starts, t = [], 0
for i, d in enumerate(SCENES):
    starts.append(t)
    t += d - (TRANS[i] if i < len(TRANS) else 0)
S = dict(zip(IDS, starts))
TOTAL_F = t
DUR = TOTAL_F / FPS
N = int(DUR * SR) + SR  # 1s tail, trimmed later
rng = np.random.default_rng(7)


def fr(frame):
    return frame / FPS


def note(n):  # MIDI → Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else 1
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


L = np.zeros(N)
R = np.zeros(N)


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl = gain * np.sqrt(0.5 * (1 - pan))
    gr = gain * np.sqrt(0.5 * (1 + pan))
    L[i : i + len(sig)] += sig * gl
    R[i : i + len(sig)] += sig * gr


# ---------- harmony: 120 BPM, one chord per bar (2 s) ----------
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
PROG = [  # Fmaj9, G6, Am7, Cmaj7/E  — bright, hopeful
    [53, 57, 60, 64, 67],
    [55, 59, 62, 64, 71],
    [57, 60, 64, 67, 71],
    [52, 55, 59, 64, 67],
]
ROOTS = [41, 43, 45, 40]

# Pad (detuned saw stack, low-passed), whole piece
for b in range(int(DUR / BAR) + 1):
    t0 = b * BAR
    chord = PROG[b % 4]
    n = int((BAR + 0.6) * SR)
    tt = np.arange(n) / SR
    sig = np.zeros(n)
    for m in chord:
        for det in (-0.08, 0.0, 0.07):
            f0 = note(m + det)
            ph = rng.random()
            saw = 2 * ((tt * f0 + ph) % 1) - 1
            sig += saw
    sig = lp(sig, 1400 + 600 * np.sin(b * 0.7)) / 15
    sig *= env_adsr(n, 0.5, 0.7)
    add(sig, t0, 0.32, pan=-0.15 if b % 2 else 0.15)

# Section flags (seconds)
hero_t = fr(S['Hero'])
chat_t = fr(S['Chat'])
outro_t = fr(S['Outro'])

end_t = DUR

beat_times = np.arange(0, DUR, BEAT)


def sidechain(at):
    return 1.0


# Kick (soft, from the Hero drop until the outro tag)
def kick():
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    f = 45 + 95 * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7.5)


K = kick()
for bt in beat_times:
    if hero_t <= bt < outro_t + 2.9:
        add(K, bt, 0.55)

# Sub bass on 8ths, ducked after each kick
for b in range(int(DUR / BAR) + 1):
    root = ROOTS[b % 4]
    for k in range(8):
        at = b * BAR + k * BEAT / 2
        if not (hero_t <= at < outro_t + 2.9):
            continue
        n = int(BEAT / 2 * SR)
        tt = np.arange(n) / SR
        s = np.sin(2 * np.pi * note(root) * tt) + 0.25 * np.sin(4 * np.pi * note(root) * tt)
        e = env_adsr(n, 0.01, 0.05) * (0.45 if k % 2 == 0 else 1.0)
        add(s * e, at, 0.22)

# Hats on off-beats from the Chat scene
for bt in beat_times:
    at = bt + BEAT / 2
    if chat_t <= at < outro_t + 2.9:
        n = int(0.06 * SR)
        s = hp(rng.standard_normal(n), 8000) * np.exp(-np.arange(n) / SR * 70)
        add(s, at, 0.07, pan=0.3)

# Clap on 2 & 4 from Formats on
for i, bt in enumerate(beat_times):
    if fr(S['Actors']) <= bt < outro_t + 2.9 and i % 2 == 1:
        n = int(0.18 * SR)
        s = lp(hp(rng.standard_normal(n), 1200), 5000) * np.exp(-np.arange(n) / SR * 22)
        add(s, bt, 0.10, pan=-0.1)

# Pluck arpeggio (16ths) from the Chat scene, with stereo echo
for b in range(int(DUR / BAR) + 1):
    chord = PROG[b % 4]
    pattern = [0, 2, 4, 2, 1, 3, 4, 3]
    for k in range(16):
        at = b * BAR + k * BEAT / 4
        if not (chat_t <= at < outro_t + 2.9):
            continue
        m = chord[pattern[k % 8]] + 12
        n = int(0.35 * SR)
        tt = np.arange(n) / SR
        s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 14)
        add(s, at, 0.07, pan=-0.35)
        add(s, at + BEAT * 0.75, 0.035, pan=0.45)


# ---------- sound design ----------
def whoosh(dur=0.7, up=True):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 512
    for i in range(0, n, seg):
        p = i / n
        fc = 300 + (6000 if up else 4000) * (p if up else 1 - p) ** 1.5
        out[i : i + seg] = lp(noise[i : i + seg], min(fc, 18000), 1)
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * e


def boom():
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    f = 32 + 60 * np.exp(-tt * 10)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = 200 * 2 ** (tt / dur * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    noise = hp(rng.standard_normal(n), 2000) * 0.5
    return (tone + noise) * (tt / dur) ** 2


def click(bright=1.0):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 2500 * bright) * np.exp(-tt * 260)


def chime(base=76):
    n = int(1.2 * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for i, m in enumerate([base, base + 4, base + 7, base + 12]):
        d = int(i * 0.07 * SR)
        s[d:] += np.sin(2 * np.pi * note(m) * tt[: n - d]) * np.exp(-tt[: n - d] * 4)
    return s


# Whooshes centred on each transition
for i, tr in enumerate(TRANS):
    centre = fr(starts[i + 1] + tr / 2)
    w = whoosh(0.8)
    add(w, centre - 0.4, 0.35, pan=-0.4 if i % 2 else 0.4)

add(boom(), fr(4), 0.5)  # open
add(riser(1.0), hero_t - 1.0, 0.22)  # into the promise
add(boom(), hero_t, 0.6)
add(boom(), fr(S['Outro'] + 92), 0.9)  # logo at the end
add(chime(72), fr(S['Outro'] + 96), 0.14)

# Typing in the chat (frames 12..76 of Chat, 72 chars/s)
for k in range(0, int((76 - 12) / FPS * 72), 2):
    add(click(1.4), chat_t + fr(12) + k / 72 + rng.random() * 0.01, 0.10, pan=0.1)
add(click(0.6), chat_t + fr(74), 0.35)  # send
for i in range(3):  # checklist ticks
    add(chime(84 + i), chat_t + fr(76 + 58 + i * 18), 0.04)
add(chime(79), chat_t + fr(200), 0.10)  # video lands
add(whoosh(0.9), chat_t + fr(232), 0.3)  # video flies into the phone

add(click(0.6), fr(S['Spy'] + 138), 0.4)  # S'inspirer
add(click(0.6), fr(S['Publish'] + 92), 0.4)  # Publier
add(chime(81), fr(S['Publish'] + 98), 0.16)

# Strike-throughs in the Problem scene
for i in range(3):
    add(whoosh(0.25), fr(S['Problem'] + 46 + i * 7), 0.18, pan=(i - 1) * 0.5)

# Final ringing chord
n = int(4 * SR)
tt = np.arange(n) / SR
fin = sum(np.sin(2 * np.pi * note(m) * tt) for m in [53, 60, 64, 67, 72]) * np.exp(-tt * 1.1) / 5
add(fin, fr(S['Outro'] + 92), 0.25)

# ---------- mix ----------
mix = np.stack([L, R])
ir_n = int(1.8 * SR)
it = np.arange(ir_n) / SR
for c in range(2):
    ir = rng.standard_normal(ir_n) * np.exp(-it * 3.2)
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(mix[c], ir)[: mix.shape[1]]
    mix[c] = mix[c] + 0.28 * wet

mix = hp(mix, 30)

# ---------- voice-over (public/vo/NN.wav, one take per scene) ----------
import os
from scipy.signal import resample_poly
VO_IDS = ['Problem', 'Hero', 'Chat', 'Actors', 'Formats', 'Spy', 'Publish', 'Outro']
voice = np.zeros(mix.shape[1])
spans = []
for i, sid in enumerate(VO_IDS):
    path = f'public/vo/{i + 1:02d}.wav'
    if not os.path.exists(path):
        continue
    vsr, v = wavfile.read(path)
    v = v.astype(float) / 32768
    if v.ndim > 1:
        v = v.mean(axis=1)
    v = resample_poly(v, SR, vsr)
    # takes are already EQ'd and compressed by scripts/voiceover.py
    k = IDS.index(sid)
    lead = (TRANS[k - 1] / 2 if k > 0 else 0) + 6
    at = int(fr(S[sid] + lead) * SR)
    v = v[: max(0, voice.shape[0] - at)]
    voice[at : at + len(v)] += v
    spans.append((at / SR, (at + len(v)) / SR))

# duck the music under the voice (smooth 0.25 s ramps)
tt = np.arange(mix.shape[1]) / SR
duck = np.ones_like(tt)
for a0, a1 in spans:
    ramp = np.clip(np.minimum((tt - (a0 - 0.25)) / 0.25, ((a1 + 0.3) - tt) / 0.3), 0, 1)
    duck = np.minimum(duck, 1 - 0.6 * ramp)
mix *= duck
if np.max(np.abs(voice)) > 0:
    voice *= 0.9 / np.max(np.abs(voice))
    voice_track = np.stack([voice, voice]) * 0.9
else:
    voice_track = np.zeros_like(mix)

total = int(DUR * SR)
mix = mix[:, :total]
fade_in = int(0.3 * SR)
mix[:, :fade_in] *= np.linspace(0, 1, fade_in)
fade = int(1.6 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
mix = np.tanh(mix * 1.1) / np.tanh(1.1)  # gentle glue on the music only
mix += voice_track[:, : mix.shape[1]]  # clean voice on top, never saturated
mix /= np.max(np.abs(mix)) / 0.89
wavfile.write('public/soundtrack.wav', SR, (mix.T * 32767).astype(np.int16))
print(f'{DUR:.2f}s written, total frames {TOTAL_F}')
