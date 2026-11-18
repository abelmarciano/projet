"""Post-traitement voix off (coupe des blancs, tempo, loudnorm) + timings mots ElevenLabs scribe_v1.
Usage: python3 scripts/leads_vo_post.py <out_words.json> id1 id2 ..."""
import json, subprocess, sys, urllib.request, uuid
out = sys.argv[1]; W = {}
for vid in sys.argv[2:]:
    src, dst = f'public/voice/{vid}.mp3', f'public/voice/{vid}-n.mp3'
    af = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,'
          'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,atempo=1.04,loudnorm=I=-13:TP=-1.5')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', af, '-ar', '44100', '-b:a', '192k', dst], check=True)
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\nfr\r\n'
            f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n').encode() + open(dst, 'rb').read() + f'\r\n--{b}--\r\n'.encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'Content-Type': f'multipart/form-data; boundary={b}'})
    d = json.load(urllib.request.urlopen(req, timeout=180))
    W[vid] = [{'w': x['text'], 's': round(x['start'], 3), 'e': round(x['end'], 3)} for x in d['words'] if x.get('type') == 'word']
    print(vid, round(W[vid][-1]['e'], 2), ' '.join(x['w'] for x in W[vid]))
json.dump(W, open(out, 'w'), ensure_ascii=False, indent=1)
