import subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
TEXT = "Avec Grossiti, vos pubes Méta sont créées, et publiées en deux minutes. Vous décrivez votre produit, en une phrase. Grossiti écrit le script, choisit l'actrice, et tourne la vidéo."
def punch(path):
    sr, x = wavfile.read(path); x = x.astype(float) / 32768
    x = sosfilt(butter(2, 100, 'high', fs=sr, output='sos'), x)
    x = x + 0.5 * sosfilt(butter(2, 2500, 'high', fs=sr, output='sos'), x)  # presence
    x = np.tanh(x * 3.0) / np.tanh(3.0)  # radio-style compression
    x *= 0.9 / np.abs(x).max()
    wavfile.write(path, sr, (x * 32767).astype(np.int16))
for name, model, ls in [('A-siwis', '/tmp/voice/fr-siwis-medium.onnx', 0.78), ('B-gilles', '/tmp/v_voice-fr-gilles-low/fr-gilles-low.onnx', 0.8)]:
    out = f'out/samples/voix-{name}.wav'
    subprocess.run(['python3', '-m', 'piper', '-m', model, '-f', out, '--length-scale', str(ls), '--sentence-silence', '0.08', '--noise-w-scale', '1.0'], input=TEXT.encode(), check=True, capture_output=True)
    punch(out)
    sr, x = wavfile.read(out); print(name, round(len(x) / sr, 2), 's')
