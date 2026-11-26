"""Chaîne voix comme l'app Growthity : audio Kling natif → ElevenLabs speech-to-speech (voix Growthity) → transcription scribe_v1 mot à mot.
Usage: python3 defi_voice.py <raw.mp4> <voice_id> <out_prefix>  → <out_prefix>-voice.mp4 (vidéo + voix convertie) et <out_prefix>-words.json"""
import sys, json, subprocess, urllib.request, uuid
raw, voice, pre = sys.argv[1:4]
wav = pre + '-orig.mp3'
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', raw, '-vn', '-ac', '1', '-ar', '44100', '-b:a', '192k', wav], check=True)
def multipart(fields, files):
    b = uuid.uuid4().hex; out = b''
    for k, v in fields.items(): out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, (fn, data, ct) in files.items(): out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{fn}"\r\nContent-Type: {ct}\r\n\r\n'.encode() + data + b'\r\n'
    return out + f'--{b}--\r\n'.encode(), f'multipart/form-data; boundary={b}'
# speech-to-speech ElevenLabs via fal (l'API directe refuse la conversion de voix avec cette clé)
subprocess.run(['python3', 'scripts/sts_fal.py', wav, voice, pre + '-sts.mp3'], check=True)
# voix convertie + chaîne « micro de téléphone » (pas l'audio d'origine : il contient l'ancienne voix)
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', '-i', raw, '-i', pre + '-sts.mp3', '-filter_complex',
                '[1:a]highpass=f=85,lowpass=f=12500,acompressor=threshold=-20dB:ratio=2.5,aecho=0.8:0.5:18:0.12,equalizer=f=3200:t=q:w=1:g=2[v];anoisesrc=c=pink:a=0.004:d=40[n];[v][n]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5[a]',
                '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', pre + '-voice.mp4'], check=True)
body, ct = multipart({'model_id': 'scribe_v1', 'language_code': 'fr', 'timestamps_granularity': 'word'}, {'file': ('a.mp3', open(pre + '-sts.mp3', 'rb').read(), 'audio/mpeg')})
d = json.load(urllib.request.urlopen(urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'Content-Type': ct}), timeout=300))
words = [{'w': w['text'], 's': w['start'], 'e': w['end']} for w in d['words'] if w.get('type') == 'word']
json.dump(words, open(pre + '-words.json', 'w'), ensure_ascii=False)
print(d['text'])
