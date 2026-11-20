"""Soumet une génération WAN 2.7 image-to-video pilotée par un audio imposé (fal, auth proxy).
Usage: python3 wan27_submit.py <image> <audio> <duree_s> <prompt.txt> <out.mp4>"""
import sys, json, base64, time, urllib.request, mimetypes
img, aud, dur, ptxt, out = sys.argv[1:6]
def uri(p):
    ct = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    return f'data:{ct};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
body = {"prompt": open(ptxt).read().strip(), "audio_url": uri(aud),
        "duration": int(dur), "resolution": "1080p", "enable_prompt_expansion": False,
        "negative_prompt": "texte, sous-titres, logo, musique, visage déformé, lèvres floues, mains devant la bouche"}
EP = 'https://queue.fal.run/fal-ai/wan/v2.7/image-to-video'
if img == '-':  # text-to-video: WAN invente la personne et le décor
    EP = 'https://queue.fal.run/fal-ai/wan/v2.7/text-to-video'; body['aspect_ratio'] = '9:16'
else:
    body['image_url'] = uri(img)
def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None,
                               headers={'Content-Type': 'application/json'}, method='POST' if data else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=120))
q = req(EP, body)
print('request', q['request_id'], flush=True)
while True:
    time.sleep(15)
    s = req(q['status_url'])
    if s.get('status') == 'COMPLETED': break
    print(s.get('status'), s.get('queue_position', ''), flush=True)
res = req(q['response_url'])
print(json.dumps(res)[:600], flush=True)
url = res['video']['url']
urllib.request.urlretrieve(url, out)
print('OK', out, url)
