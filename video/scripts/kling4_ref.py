"""Kling v4 reference-to-video via fal (auth proxy), comme l'app Growthity.
Usage: python3 kling4_ref.py <job.json> <out.mp4>   job = {prompt, duration, elements:[{frontal_image_url, reference_image_urls}], image_urls?}"""
import sys, json, time, urllib.request, urllib.error
job, out = json.load(open(sys.argv[1])), sys.argv[2]
body = {'prompt': job['prompt'], 'duration': job['duration'], 'aspect_ratio': '9:16', 'resolution': job.get('resolution', '1080p'),
        'elements': job['elements'], **({'image_urls': job['image_urls']} if job.get('image_urls') else {})}
def req(u, d=None):
    r = urllib.request.Request(u, data=json.dumps(d).encode() if d else None, headers={'Content-Type': 'application/json'}, method='POST' if d else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=120))
q = req('https://queue.fal.run/fal-ai/kling-video/v4/reference-to-video', body); print('request', q['request_id'], flush=True)
while True:
    time.sleep(15)
    try: s = req(q['status_url'])
    except urllib.error.HTTPError as e: print('status', e.code, e.read()[:300], flush=True); continue
    if s.get('status') == 'COMPLETED': break
try: res = req(q['response_url'])
except urllib.error.HTTPError as e: print('FAILED', e.code, e.read()[:1500].decode(errors='replace'), flush=True); sys.exit(1)
print(json.dumps(res)[:400], flush=True)
urllib.request.urlretrieve(res['video']['url'], out); print('OK', out)
