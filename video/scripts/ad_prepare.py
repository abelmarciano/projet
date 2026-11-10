"""Prepare a raw ad for the « Du chat à la pub » edit: transcribe (ElevenLabs scribe_v1, word timings),
cut the silences, retime the words. Usage: python3 scripts/ad_prepare.py <video.mp4> <id> [gap=0.22] [pad=0.07]
→ src/chatpub/ad-<id>.json {src, fps, segments:[{from,to}], words:[{w,s,e}] (times on the CUT timeline), frames}"""
import json, os, subprocess, sys, urllib.request, uuid
src, aid = sys.argv[1], sys.argv[2]
GAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.22
PAD = float(sys.argv[4]) if len(sys.argv) > 4 else 0.07
tmp = f'/tmp/ad-{aid}.mp3'
subprocess.run(['/usr/bin/ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-vn', '-ac', '1', '-ar', '16000', tmp], check=True)
dur = float(subprocess.check_output(['/usr/bin/ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).decode())
b = uuid.uuid4().hex
body = (f'--{b}\r\nContent-Disposition: form-data; name="model_id"\r\n\r\nscribe_v1\r\n'
        f'--{b}\r\nContent-Disposition: form-data; name="language_code"\r\n\r\nfra\r\n'
        f'--{b}\r\nContent-Disposition: form-data; name="timestamps_granularity"\r\n\r\nword\r\n'
        f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n').encode() + open(tmp, 'rb').read() + f'\r\n--{b}--\r\n'.encode()
req = urllib.request.Request('https://api.elevenlabs.io/v1/speech-to-text', data=body, headers={'Content-Type': f'multipart/form-data; boundary={b}'})
d = json.load(urllib.request.urlopen(req, timeout=300))
words = [w for w in d['words'] if w.get('type') == 'word']
print('Transcription :', d['text'])
# speech islands
segs = []
for w in words:
    s, e = max(0, w['start'] - PAD), min(dur, w['end'] + PAD)
    if segs and s - segs[-1][1] < GAP:
        segs[-1][1] = max(segs[-1][1], e)
    else:
        segs.append([s, e])
# retime words onto the cut timeline
out, acc = [], 0.0
offs = []
for s, e in segs:
    offs.append((s, e, acc)); acc += e - s
def remap(t):
    for s, e, a in offs:
        if s - 1e-6 <= t <= e + 1e-6:
            return a + (t - s)
    return None
for w in words:
    a, z = remap(w['start']), remap(w['end'])
    if a is not None and z is not None:
        out.append({'w': w['text'], 's': round(a, 3), 'e': round(z, 3)})
fps = 30
res = {'id': aid, 'src': src, 'fps': fps, 'text': d['text'], 'segments': [{'from': round(s, 3), 'to': round(e, 3)} for s, e in segs], 'words': out, 'frames': int(round(acc * fps))}
json.dump(res, open(f'src/chatpub/ad-{aid}.json', 'w'), ensure_ascii=False, indent=1)
print(f'{len(segs)} segments, {dur:.2f}s → {acc:.2f}s (blancs coupés : {dur - acc:.2f}s)')
