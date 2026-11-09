"""Turn launch_content docs into ArtifactData batch entries (≤50 per batch).
python3 studio/data/build_writes.py <assets.json> <out_dir> <versions.json>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from launch_content import main
assets = json.load(open(sys.argv[1]))
A = {}
for k, v in assets.items():
    A[k] = [{'asset': x[0], 'ct': 'video/mp4', 'poster': x[1]} if isinstance(x, list) else {'asset': x, 'ct': 'image/png'} for x in v]
json.dump(A, open(os.path.join(sys.argv[2], '_assets_norm.json'), 'w'))
docs = main(os.path.join(sys.argv[2], '_assets_norm.json'), sys.argv[2])
V = json.load(open(sys.argv[3]))
entries = []
for col, did, op, data in docs:
    f = os.path.join(sys.argv[2], f'{col}__{did}.json')
    json.dump(data, open(f, 'w'), ensure_ascii=False)
    e = {'op': op, 'collection': col, 'doc_id': did, 'file_path': f}
    if f'{col}/{did}' in V:
        e['if_version'] = V[f'{col}/{did}']
        if op == 'set':
            e['op'] = 'update'
    entries.append(e)
for i in range(0, len(entries), 50):
    json.dump(entries[i:i + 50], open(os.path.join(sys.argv[2], f'batch{i // 50 + 1}.json'), 'w'))
print(len(entries), 'entries,', (len(entries) + 49) // 50, 'batches')
