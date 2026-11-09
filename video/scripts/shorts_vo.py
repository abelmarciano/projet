"""Manon voice-over for the 5 social shorts (ElevenLabs, word timings for captions).

Usage: python3 scripts/shorts_vo.py [s1 s2 ...]
Writes public/shorts/vo/<short>_<beat>.wav and src/shorts/data/<short>_vo.json.
The API key is injected by the network proxy (never stored here).
"""
import base64, json, os, subprocess, sys, urllib.request

VOICE = 'm5U7XCsc8v988k2RJAqN'  # Manon (ElevenLabs, French)
URL = f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128'
SETTINGS = {'stability': 0.38, 'similarity_boost': 0.8, 'style': 0.45, 'use_speaker_boost': True, 'speed': 1.08}
FFMPEG = 'ffmpeg' if not os.path.exists('node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg') else 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg'
ENV = dict(os.environ, LD_LIBRARY_PATH='node_modules/@remotion/compositor-linux-x64-gnu')
SCRIPT = json.load(open('scripts/shorts_script.json'))


def tts(text, prev, nxt):
    body = {'text': text, 'model_id': 'eleven_multilingual_v2', 'voice_settings': SETTINGS, 'previous_text': prev, 'next_text': nxt}
    req = urllib.request.Request(URL, json.dumps(body).encode(), {'Content-Type': 'application/json', 'xi-api-key': 'proxy-injected'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def words(al):
    """character alignment → [{w, s, e}] (seconds)"""
    out, cur, s, e = [], '', None, None
    for ch, cs, ce in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur:
                out.append({'w': cur, 's': s, 'e': e})
            cur, s = '', None
            continue
        if s is None:
            s = cs
        cur += ch
        e = ce
    if cur:
        out.append({'w': cur, 's': s, 'e': e})
    return out


for sid in sys.argv[1:] or list(SCRIPT):
    lines = SCRIPT[sid]
    beats = []
    for k, text in enumerate(lines):
        prev = ' '.join(lines[:k])[-300:]
        nxt = ' '.join(lines[k + 1 :])[:300]
        res = tts(text, prev, nxt)
        mp3 = f'public/shorts/vo/{sid}_{k + 1}.mp3'
        wav = mp3[:-4] + '.wav'
        open(mp3, 'wb').write(base64.b64decode(res['audio_base64']))
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', '48000', wav], check=True, env=ENV)
        os.remove(mp3)
        al = res.get('normalized_alignment') or res['alignment']
        w = words(res['alignment'])
        dur = max(x['e'] for x in w)
        beats.append({'text': text, 'audio': f'shorts/vo/{sid}_{k + 1}.wav', 'dur': dur, 'words': w})
        print(sid, k + 1, f'{dur:.2f}s', text)
    json.dump({'id': sid, 'beats': beats}, open(f'src/shorts/data/{sid}_vo.json', 'w'), ensure_ascii=False, indent=1)
