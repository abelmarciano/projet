"""WAN 2.7 image-to-video sans audio imposé (fal, auth proxy). Usage: python3 wan27_i2v.py <image> <duree_s> <prompt.txt> <out.mp4> [resolution]"""
import sys, json, base64, time, urllib.request, mimetypes
img, dur, ptxt, out = sys.argv[1:5]; res = sys.argv[5] if len(sys.argv) > 5 else '720p'
def uri(p): return f'data:{mimetypes.guess_type(p)[0] or "image/jpeg"};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
body = {"prompt": open(ptxt).read().strip(), "image_url": uri(img), "duration": int(dur), "resolution": res, "enable_prompt_expansion": False,
        "negative_prompt": "texte déformé, visage déformé, personnage qui change, mains déformées, saccades, flou"}
def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers={'Content-Type': 'application/json'}, method='POST' if data else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=120))
q = req('https://queue.fal.run/fal-ai/wan/v2.7/image-to-video', body)
while True:
    time.sleep(15)
    try: s = req(q['status_url'])
    except urllib.error.HTTPError as e: print('status', e.code, flush=True); continue
    if s.get('status') == 'COMPLETED': break
res_ = req(q['response_url']); urllib.request.urlretrieve(res_['video']['url'], out); print('OK', out)
