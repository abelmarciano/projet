"""Musique + sound design de la pub motion « Tout. Au même endroit. » → public/allinone/bed.wav
Timeline : SC / VO / mots de src/allinone (mêmes valeurs que AllInOne.tsx)."""
import json, os
import numpy as np
from scipy.io import wavfile
src = open(os.path.join(os.path.dirname(__file__), 'shorts_audio.py')).read().split('def timeline')[0]
g = {'__file__': __file__}
exec(src, g)
SR, note, lp, hp, kick, whoosh, boom, click, chime, pop_sfx, rng = (g[k] for k in ['SR', 'note', 'lp', 'hp', 'kick', 'whoosh', 'boom', 'click', 'chime', 'pop_sfx', 'rng'])
SC = dict(chaos=0, collapse=150, reveal=206, ch1=226, ch2=398, ch3=520, ch4=696, fin=842, total=1000)
VO = {1: 8, 2: 152, 3: 236, 4: 404, 5: 526, 6: 702, 7: 852}
W = json.load(open('src/allinone/words.json'))
def cue(k, start, d=0):
    for w in W[f'aio-{k}']:
        if w['w'].lower().startswith(start): return (VO[k] + round(w['s'] * 30)) / 30
    return (VO[k] + d * 30) / 30
s = lambda k: SC[k] / 30
n = int(s('total') * SR) + SR
mus = np.zeros(n); sfx = np.zeros(n)
def add(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i < 0 or i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * gain
def tone(m, d, a=0.01, r=3.0, h=(1, 0.3, 0.1)):
    t = np.arange(int(d * SR)) / SR
    x = sum(amp * np.sin(2 * np.pi * note(m) * (k + 1) * t) for k, amp in enumerate(h))
    return x * np.minimum(1, t / a) * np.exp(-t * r)
def riser(d, f0=150, f1=2400):
    t = np.arange(int(d * SR)) / SR
    x = hp(rng.standard_normal(len(t)), 1800) * (t / d) ** 2 * 0.5
    ph = 2 * np.pi * np.cumsum(f0 + (f1 - f0) * (t / d) ** 2) / SR
    return (x + np.sin(ph) * (t / d) ** 3 * 0.35) * np.minimum(1, (d - t) / 0.02)
def sub(d=1.2, f=55):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * (f * 1.6 * np.exp(-t * 4) + f) * t) * np.exp(-t * 2.6)
def swish(d=0.3):
    t = np.arange(int(d * SR)) / SR
    return hp(rng.standard_normal(len(t)), 3500) * np.sin(np.pi * t / d) ** 2 * 0.6
def tick():
    t = np.arange(int(0.03 * SR)) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200)
# --- 1. chaos : drone sombre + pulsation + tic-tac nerveux ---
d = s('reveal'); t = np.arange(int(d * SR)) / SR
drone = sum(np.sin(2 * np.pi * note(m) * t + 0.4 * np.sin(2 * np.pi * 0.2 * t)) for m in [33, 40, 45, 46]) / 4
drone = lp(drone, 900) * np.minimum(1, t / 0.6) * (0.5 + 0.5 * (t / d))
add(mus, drone, 0, 0.5)
beat = 60 / 100
k = 0
while k * beat < s('collapse'):
    add(mus, sub(0.5, 45), k * beat, 0.35); k += 1
for i in range(int(s('collapse') / (beat / 2))):
    add(sfx, tick(), i * beat / 2, 0.08 if i % 2 else 0.14)
# chaque outil qui « ping »
for t0 in np.arange(0.4, s('collapse'), 0.37):
    add(sfx, tone(84 + int(rng.integers(0, 6)) * 2, 0.15, r=25, h=(1, 0.2)), t0 + 0.05 * rng.random(), 0.05)
# --- 2. aspiration : montée + coupure + impact ---
add(sfx, riser(s('reveal') - s('collapse') - 0.15, 80, 3200), s('collapse') + 0.1, 0.6)
add(sfx, boom(), s('reveal'), 0.8); add(sfx, sub(1.6, 40), s('reveal'), 0.8)
add(sfx, chime(81), s('reveal') + 0.05, 0.35); add(sfx, chime(88), s('reveal') + 0.18, 0.25); add(sfx, chime(93), s('reveal') + 0.3, 0.18)
add(sfx, whoosh(0.8), s('reveal') - 0.1, 0.4)
# --- 3. monde clair : groove lumineux 112 bpm ---
bpm = 112; bt = 60 / bpm; bar = bt * 4
start = s('ch1') - bt  # anacrouse
chords = [[57, 61, 64, 68, 71], [54, 57, 61, 64, 69], [50, 54, 57, 62, 66], [52, 56, 59, 64, 68]]
bass = [45, 42, 38, 40]
arp = [0, 2, 4, 2, 3, 1, 4, 3]
nb = int((s('total') - start) / bar) + 1
for b in range(nb):
    at = start + b * bar
    seg = int(bar * SR); tt = np.arange(seg) / SR
    e = np.minimum(1, tt / 0.06) * np.exp(-tt * 0.3)
    pad = sum(np.sin(2 * np.pi * note(m) * tt + 0.15 * np.sin(2 * np.pi * 0.3 * tt)) for m in chords[b % 4]) / 5
    add(mus, lp(pad, 3500) * e * 0.15, at)
    for q in range(8):
        bs = tone(bass[b % 4], bt / 2, a=0.005, r=6, h=(1, 0.5, 0.2))
        add(mus, lp(bs, 400), at + q * bt / 2, 0.22 if q % 2 == 0 else 0.12)
        add(mus, tone(chords[b % 4][arp[q]] + 12, 0.3, a=0.002, r=9, h=(1, 0.25)), at + q * bt / 2, 0.06)
i = 0
while start + i * bt < s('total') - 0.5:
    at = start + i * bt
    add(mus, kick(), at, 0.45)
    hh = hp(rng.standard_normal(int(0.025 * SR)), 9500) * np.exp(-np.arange(int(0.025 * SR)) / SR * 160)
    add(mus, hh, at + bt / 2, 0.09); add(mus, hh, at + bt * 0.75, 0.04)
    if i % 2 == 1:
        cl = hp(rng.standard_normal(int(0.1 * SR)), 2000) * np.exp(-np.arange(int(0.1 * SR)) / SR * 35)
        add(mus, cl, at, 0.16)
    i += 1
env = np.ones(n) * 0.8
ia, ib = int(s('reveal') * SR), int(s('ch1') * SR); env[:ia] = 1.0; env[ia:ib] = np.linspace(0.3, 0.8, ib - ia)
# respiration avant le final, puis plein
fa = int((s('fin') - 0.5) * SR); fb = int((s('fin') + 0.6) * SR); env[fa:fb] = np.linspace(0.8, 0.25, fb - fa)
fc = int((s('fin') + 1.4) * SR); env[fb:fc] = 0.25
tl = int((s('total') - 1.2) * SR); te = int(s('total') * SR); env[tl:te] = np.linspace(0.8, 0, te - tl); env[te:] = 0
mus *= env
# --- 4. transitions & micro-sons ---
for a in ['ch2', 'ch3', 'ch4']:
    add(sfx, whoosh(0.5), s(a) - 0.3, 0.35); add(sfx, sub(0.6, 60), s(a), 0.3)
# 01 : orbites, connexion IA, livrables
for j in range(6): add(sfx, pop_sfx(), s('ch1') + (10 + j * 3) / 30, 0.12)
add(sfx, riser(0.5, 400, 3000), cue(3, 'ia') - 0.45, 0.25); add(sfx, chime(84), cue(3, 'ia'), 0.3)
for kk, m in [('script', 81), ('voix', 84), ('acteurs', 86), ('montage', 89)]:
    add(sfx, pop_sfx(), cue(3, kk) - 0.06, 0.3); add(sfx, chime(m), cue(3, kk) + 0.2, 0.16)
# 02 : retournements de cartes
for kk in ['monteur', 'graphiste', 'media']:
    add(sfx, swish(0.25), cue(4, kk), 0.45); add(sfx, chime(86), cue(4, kk) + 0.25, 0.14)
add(sfx, swish(0.25), cue(4, 'buyer') + 0.4, 0.45)
# 03 : plateformes
for j, kk in enumerate(['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin']):
    add(sfx, pop_sfx(), cue(5, kk) + 0.1, 0.35); add(sfx, chime(79 + j * 2), cue(5, kk) + 0.8, 0.12)
add(sfx, pop_sfx(), cue(5, 'linkedin') + 0.65, 0.35)
# 04 : courbe, recos, nuit, WhatsApp
add(sfx, riser(1.6, 300, 1600), s('ch4') + 0.3, 0.15)
for j in range(3): add(sfx, click(1.2), cue(6, 'meta') + (2 + j * 8) / 30, 0.25)
add(sfx, whoosh(0.4), cue(6, 'nuit') - 0.1, 0.25)
add(sfx, pop_sfx(), cue(6, 'whatsapp') - 0.33, 0.5); add(sfx, chime(88), cue(6, 'whatsapp') - 0.2, 0.3); add(sfx, chime(84), cue(6, 'whatsapp') - 0.08, 0.2)
# final
for j in range(4): add(sfx, pop_sfx(), s('fin') + j * 3 / 30, 0.18)
add(sfx, riser(0.8, 200, 2800), s('fin') + 0.5, 0.3)
add(sfx, boom(), s('fin') + 40 / 30, 0.65); add(sfx, sub(1.6, 42), s('fin') + 40 / 30, 0.6)
add(sfx, chime(81), s('fin') + 42 / 30, 0.3); add(sfx, chime(88), s('fin') + 46 / 30, 0.22); add(sfx, chime(93), s('fin') + 50 / 30, 0.16)
add(sfx, sub(0.8, 55), cue(7, 'tout'), 0.35)
mix = (mus + sfx)[: int(s('total') * SR)]
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.4) * 0.45
d = int(0.012 * SR)
st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]]) * 0.9 + mix * 0.1], 1)
os.makedirs('public/allinone', exist_ok=True)
wavfile.write('public/allinone/bed.wav', SR, (st * 32767).astype(np.int16))
print('ok', round(s('total'), 2), 's')
