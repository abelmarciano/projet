"""Music + sound design + Manon voice for the social shorts.

Usage: python3 scripts/shorts_audio.py [s1 s2 ...]  → public/shorts/<id>.wav (48 kHz stereo)
Timing mirrors src/shorts/timeline.ts (lines = voice takes, scenes = groups of lines).
"""
import json, math, os, subprocess, sys
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt, resample_poly
from scipy.io import wavfile

SR = 48000
FPS = 30
CFG = json.load(open('src/shorts/config.json'))
FFMPEG = 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg'
ENV = dict(os.environ, LD_LIBRARY_PATH='node_modules/@remotion/compositor-linux-x64-gnu')

# one harmonic colour per short so the series doesn't sound copy-pasted
PROGS = {
    's1': ([[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 52, 55, 59, 64], [55, 59, 62, 66, 69]], [45, 41, 36, 43], 122),
    's2': ([[53, 57, 60, 64, 67], [55, 59, 62, 64, 71], [57, 60, 64, 67, 71], [52, 55, 59, 64, 67]], [41, 43, 45, 40], 118),
    's3': ([[50, 53, 57, 60, 64], [46, 50, 53, 57, 62], [48, 52, 55, 58, 62], [45, 48, 52, 55, 60]], [38, 34, 36, 33], 124),
    's4': ([[52, 55, 59, 62, 66], [48, 52, 55, 59, 62], [50, 53, 57, 60, 64], [47, 50, 54, 57, 62]], [40, 36, 38, 35], 120),
    's5': ([[55, 59, 62, 66, 69], [52, 55, 59, 62, 67], [48, 52, 55, 59, 62], [50, 54, 57, 60, 66]], [43, 40, 36, 38], 128),
}

rng = np.random.default_rng(11)


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 45 + 100 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def whoosh(dur=0.6):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for i in range(0, n, 512):
        p = i / n
        out[i : i + 512] = lp(noise[i : i + 512], 300 + 7000 * p ** 1.5, 1)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


def boom():
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t * 11)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.8)


def click(bright=1.0):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 2500 * bright) * np.exp(-t * 260)


def chime(base=76):
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for i, m in enumerate([base, base + 4, base + 7, base + 12]):
        d = int(i * 0.06 * SR)
        s[d:] += np.sin(2 * np.pi * note(m) * t[: n - d]) * np.exp(-t[: n - d] * 4)
    return s


def pop_sfx():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)


def timeline(sid):
    conf = CFG['shorts'][sid]
    vo = json.load(open(f'src/shorts/data/{sid}_vo.json'))
    lines, t = [], 0
    for i, b in enumerate(vo['beats']):
        fr = CFG['lead'] + math.ceil(b['dur'] * 30) + CFG['gap'] + conf['extra'][i]
        if i == len(vo['beats']) - 1:
            fr = max(fr, CFG['endMin'])
        words = [{'w': w['w'], 'f': t + CFG['lead'] + round(w['s'] * 30)} for w in b['words']]
        lines.append({'start': t, 'frames': fr, 'audio': b['audio'], 'words': words})
        t += fr
    scenes = [lines[g[0]]['start'] for g in conf['scenes']]
    return lines, scenes, t


def word_f(line, prefix, fallback=0):
    for w in line['words']:
        if ''.join(c for c in w['w'].lower() if c.isalnum() or c in "'’").startswith(prefix):
            return w['f']
    return line['start'] + fallback


def build(sid):
    lines, scenes, total = timeline(sid)
    dur = total / FPS
    N = int((dur + 1) * SR)
    L, R = np.zeros(N), np.zeros(N)

    def add(sig, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0:
            sig, i = sig[-i:], 0
        if i >= N:
            return
        sig = sig[: N - i]
        L[i : i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
        R[i : i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))

    fr = lambda f: f / FPS
    prog, roots, bpm = PROGS[sid]
    beat = 60 / bpm
    bar = 4 * beat
    end_t = fr(lines[-1]['start'])  # groove drops out on the end card, chord rings
    nbars = int(dur / bar) + 1
    for b in range(nbars):
        t0 = b * bar
        n = int((bar + 0.5) * SR)
        tt = np.arange(n) / SR
        sig = np.zeros(n)
        for m in prog[b % 4]:
            for det in (-0.08, 0.0, 0.07):
                sig += 2 * ((tt * note(m + det) + rng.random()) % 1) - 1
        sig = lp(sig, 1600 + 600 * np.sin(b * 0.8)) / 15 * env(n, 0.3, 0.5)
        add(sig, t0, 0.3, -0.15 if b % 2 else 0.15)
    K = kick()
    for k, bt in enumerate(np.arange(0, dur, beat)):
        if bt < end_t:
            add(K, bt, 0.6)
            add(hp(rng.standard_normal(int(0.05 * SR)), 8000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 80), bt + beat / 2, 0.08, 0.3)
            if k % 2 == 1:
                n = int(0.16 * SR)
                add(lp(hp(rng.standard_normal(n), 1200), 5000) * np.exp(-np.arange(n) / SR * 24), bt, 0.1, -0.1)
    for b in range(nbars):
        chord = prog[b % 4]
        for k in range(8):
            at = b * bar + k * beat / 2
            if at >= end_t:
                continue
            n = int(beat / 2 * SR)
            tt = np.arange(n) / SR
            s = np.sin(2 * np.pi * note(roots[b % 4]) * tt) + 0.3 * np.sin(4 * np.pi * note(roots[b % 4]) * tt)
            add(s * env(n, 0.01, 0.05) * (0.45 if k % 2 == 0 else 1.0), at, 0.22)
        for k in range(16):
            at = b * bar + k * beat / 4
            if at >= end_t:
                continue
            m = chord[[0, 2, 4, 2, 1, 3, 4, 3][k % 8]] + 12
            n = int(0.3 * SR)
            tt = np.arange(n) / SR
            s = (np.sin(2 * np.pi * note(m) * tt) + 0.3 * np.sin(4 * np.pi * note(m) * tt)) * np.exp(-tt * 15)
            add(s, at, 0.06, -0.35)
            add(s, at + beat * 0.75, 0.03, 0.45)
    n = int(4 * SR)
    tt = np.arange(n) / SR
    add(sum(np.sin(2 * np.pi * note(m) * tt) for m in prog[0] + [prog[0][0] + 12]) * np.exp(-tt * 1.1) / 6, end_t, 0.3)

    # sound design
    add(boom(), 0.0, 0.55)
    for i, s in enumerate(scenes[1:]):
        add(whoosh(0.6), fr(s) - 0.35, 0.32, -0.4 if i % 2 else 0.4)
    add(boom(), end_t + 0.1, 0.6)
    add(chime(72), end_t + 0.25, 0.12)

    def typing(start_f, end_f, cps=40):
        t = fr(start_f)
        while t < fr(end_f):
            add(click(1.4), t + rng.random() * 0.01, 0.09, 0.1)
            t += 2 / cps

    ls = lines
    if sid == 's1':
        s2 = ls[2]
        typing(s2['start'] + 2, word_f(s2, 'ils', 30) - 6, 46)
        add(click(0.6), fr(word_f(s2, 'ils', 30) - 4), 0.35)
        add(chime(79), fr(ls[3]['start'] + 2), 0.12)
        cinq = word_f(ls[1], 'cinq', 40)
        for k in range(10):
            add(pop_sfx(), fr(word_f(ls[1], 'acteurs', 10)) + k * 0.07, 0.06, (k % 3 - 1) * 0.4)
        add(chime(84), fr(cinq + 14), 0.08)
    if sid == 's2':
        typing(scenes[1] + 2, ls[2]['start'] - 4)
        add(click(0.6), fr(ls[2]['start'] - 2), 0.35)
        for p in ['script', 'choisi', 'tourné']:
            add(chime(84), fr(word_f(ls[2], p, 20)), 0.05)
    if sid == 's3':
        add(boom(), 0.02, 0.35)
        for k in range(4):
            add(pop_sfx(), fr(word_f(ls[1], 'allers', 40) - 6 + k * 6), 0.1)
        add(whoosh(0.3), fr(ls[1]['start'] + ls[1]['frames'] - 16), 0.3)
        typing(scenes[2] + 2, word_f(ls[2], 'phrase', 24) + 6, 60)
        for p in ['vidéos', 'visuels', 'carrousels']:
            add(pop_sfx(), fr(word_f(ls[2], p, 50)), 0.12)
        add(click(0.6), fr(word_f(ls[3], 'clic', 50)), 0.4)
        add(chime(81), fr(word_f(ls[3], 'clic', 50) + 3), 0.14)
    if sid == 's4':
        typing(scenes[1] + 4, scenes[1] + 30, 20)
        for p in ['gagnent', 'tournent', 'semaines']:
            add(chime(86), fr(word_f(ls[2], p, 20)), 0.06)
        add(click(0.6), fr(word_f(ls[3], 'inspire', 12)), 0.35)
        add(chime(79), fr(word_f(ls[3], 'inspire', 12) + 20), 0.1)
    if sid == 's5':
        # stopwatch ticks under the whole run
        for k in range(int(fr(ls[4]['start']) / beat)):
            add(click(2.0), k * beat + beat / 4, 0.05, 0.5)
        typing(ls[1]['start'] + 2, ls[1]['start'] + ls[1]['frames'] - 8, 50)
        for p in ['script', 'choisit', 'tourne']:
            add(pop_sfx(), fr(word_f(ls[2], p, 20)), 0.1)
        add(click(0.6), fr(word_f(ls[3], 'publie', 40)), 0.4)
        stop = word_f(ls[4], 'cinquante', 30)
        add(chime(84), fr(stop), 0.16)
        add(boom(), fr(stop), 0.4)

    mix = np.stack([L, R])
    ir_n = int(1.5 * SR)
    it = np.arange(ir_n) / SR
    for c in range(2):
        ir = lp(rng.standard_normal(ir_n) * np.exp(-it * 3.4), 6000)
        ir /= np.sqrt(np.sum(ir ** 2))
        mix[c] = mix[c] + 0.25 * fftconvolve(mix[c], ir)[: mix.shape[1]]
    mix = hp(mix, 30)

    # voice + (short 2) Charlotte's own take
    voice = np.zeros(N)
    spans = []
    for ln in lines:
        if not ln['audio']:
            continue
        vsr, v = wavfile.read('public/' + ln['audio'])
        v = v.astype(float) / 32768
        if v.ndim > 1:
            v = v.mean(axis=1)
        v = resample_poly(v, SR, vsr) if vsr != SR else v
        at = int(fr(ln['start'] + CFG['lead']) * SR)
        v = v[: max(0, N - at)]
        voice[at : at + len(v)] += v
        spans.append((at / SR, (at + len(v)) / SR))
    if voice.any():
        voice *= 0.92 / np.max(np.abs(voice))
    if sid == 's2':
        tmp = '/tmp/claude-0/charlotte.wav'
        has_audio = subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', 'public/media/ugc-charlotte.mp4', '-vn', '-ac', '1', '-ar', str(SR), tmp], env=ENV).returncode == 0
    if sid == 's2' and has_audio:
        _, c = wavfile.read(tmp)
        c = c.astype(float) / 32768
        play = fr(scenes[2] + 30)
        until = fr(scenes[3]) - play
        c = c[: int(until * SR)]
        fade = int(0.4 * SR)
        c[-fade:] *= np.linspace(1, 0, fade)
        c *= 0.85 / max(1e-6, np.max(np.abs(c)))
        at = int(play * SR)
        voice[at : at + len(c)] += c
        spans.append((play, play + len(c) / SR))

    tt = np.arange(N) / SR
    duck = np.ones(N)
    for a0, a1 in spans:
        ramp = np.clip(np.minimum((tt - (a0 - 0.2)) / 0.2, ((a1 + 0.25) - tt) / 0.25), 0, 1)
        duck = np.minimum(duck, 1 - 0.72 * ramp)
    mix *= duck * 0.5
    total_n = int(dur * SR)
    mix = mix[:, :total_n]
    fade = int(0.8 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix += np.stack([voice, voice])[:, :total_n]
    mix /= np.max(np.abs(mix)) / 0.89
    os.makedirs('public/shorts', exist_ok=True)
    wavfile.write(f'public/shorts/{sid}.wav', SR, (mix.T * 32767).astype(np.int16))
    print(sid, f'{dur:.2f}s', 'voice' if spans else 'no voice yet')


for sid in sys.argv[1:] or list(CFG['shorts']):
    build(sid)
