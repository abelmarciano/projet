"""Nano Banana Pro (fal, auth proxy). Usage: python3 nano_banana.py <prompt.txt> <out.png> [aspect] [ref1.jpg ref2.jpg ...]"""
import sys, json, base64, time, urllib.request, mimetypes
ptxt, out = sys.argv[1:3]; aspect = sys.argv[3] if len(sys.argv) > 3 else '1:1'; refs = sys.argv[4:]
def uri(p):
    ct = mimetypes.guess_type(p)[0] or 'image/jpeg'
    return f'data:{ct};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
body = {"prompt": open(ptxt).read().strip(), "aspect_ratio": aspect, "resolution": "2K", "num_images": 1, "output_format": "png"}
EP = 'https://queue.fal.run/fal-ai/nano-banana-pro'
if refs: EP += '/edit'; body['image_urls'] = [uri(r) for r in refs]
def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers={'Content-Type': 'application/json'}, method='POST' if data else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=120))
q = req(EP, body)
while True:
    time.sleep(6)
    s = req(q['status_url'])
    if s.get('status') == 'COMPLETED': break
res = req(q['response_url'])
urllib.request.urlretrieve(res['images'][0]['url'], out)
print('OK', out)
