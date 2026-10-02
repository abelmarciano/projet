"""Split the single ElevenLabs voice-over (public/vo-manon/full.wav) into one
take per scene (public/vo/01..08.wav). Boundaries come from aligning the 26
script sentences to the silences in the file (see conversation notes)."""
import json

import numpy as np
import parselmouth
from parselmouth.praat import call
from scipy.io import wavfile

SPEED = json.load(open('src/timeline.json')).get('speed', 1.0)
BOUNDS = [0.06, 4.66, 9.72, 20.97, 27.03, 31.59, 37.12, 40.74, 44.58]  # seconds

sr, x = wavfile.read('public/vo-manon/full.wav')
for i in range(8):
    a, b = int(BOUNDS[i] * sr), int(BOUNDS[i + 1] * sr)
    seg = x[a:b].astype(float)
    nz = np.where(np.abs(seg) > 0.01 * 32768)[0]
    seg = seg[max(0, nz[0] - int(0.03 * sr)) : nz[-1] + int(0.08 * sr)]
    fade = int(0.01 * sr)
    seg[:fade] *= np.linspace(0, 1, fade)
    seg[-fade:] *= np.linspace(1, 0, fade)
    if SPEED != 1.0:  # match the sped-up picture, keep the pitch
        snd = parselmouth.Sound(seg / 32768, sampling_frequency=sr)
        seg = call(snd, 'Lengthen (overlap-add)', 75, 600, 1 / SPEED).values[0] * 32768
    wavfile.write(f'public/vo/{i + 1:02d}.wav', sr, np.clip(seg, -32768, 32767).astype(np.int16))
    print(f'{i + 1:02d}', round(len(seg) / sr, 2), 's')
