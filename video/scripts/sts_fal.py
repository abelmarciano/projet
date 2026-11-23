"""Speech-to-speech ElevenLabs via fal (auth par le proxy). Usage: python3 sts_fal.py <in.mp3> <voice_id> <out.mp3>"""
import sys, json, base64, time, urllib.request
src, voice, out = sys.argv[1:4]
def req(u, d=None):
    r = urllib.request.Request(u, data=json.dumps(d).encode() if d else None, headers={'Content-Type': 'application/json'}, method='POST' if d else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=180))
uri = 'data:audio/mpeg;base64,' + base64.b64encode(open(src, 'rb').read()).decode()
q = req('https://queue.fal.run/fal-ai/elevenlabs/voice-changer', {'audio_url': uri, 'voice': voice, 'remove_background_noise': True})
while True:
    time.sleep(4)
    s = req(q['status_url'])
    if s.get('status') == 'COMPLETED': break
res = req(q['response_url'])
urllib.request.urlretrieve(res['audio']['url'], out); print('OK', out)
