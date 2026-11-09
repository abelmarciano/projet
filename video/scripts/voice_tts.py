"""ElevenLabs TTS with word timings.
Usage: python3 scripts/voice_tts.py V1 V2 ...  → public/voice/<id>.mp3 + <id>.json (words with start/end s)
Texts and voices live in src/voice/voices.json. The API key is injected by the environment proxy."""
import base64, json, sys, urllib.request, os
V = json.load(open('src/voice/voices.json'))
os.makedirs('public/voice', exist_ok=True)
for vid in sys.argv[1:]:
    v = V[vid]
    body = json.dumps({'text': v['text'], 'model_id': 'eleven_multilingual_v2', 'language_code': 'fr',
                       'voice_settings': {'stability': v.get('stability', 0.42), 'similarity_boost': 0.8, 'style': v.get('style', 0.25), 'use_speaker_boost': True, 'speed': v.get('speed', 1.0)}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice']}/with-timestamps?output_format=mp3_44100_128", data=body, headers={'Content-Type': 'application/json'})
    d = json.load(urllib.request.urlopen(req, timeout=180))
    open(f'public/voice/{vid}.mp3', 'wb').write(base64.b64decode(d['audio_base64']))
    al = d['alignment']; ch, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    words, cur, s0 = [], '', None
    for c, a, b in zip(ch, st, en):
        if c.isspace():
            if cur: words.append({'w': cur, 's': s0, 'e': pe}); cur = ''
            continue
        if not cur: s0 = a
        cur += c; pe = b
    if cur: words.append({'w': cur, 's': s0, 'e': pe})
    json.dump(words, open(f'public/voice/{vid}.json', 'w'), ensure_ascii=False)
    print(vid, round(words[-1]['e'], 2), 's', len(words), 'mots')
