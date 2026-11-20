import json,glob,re,os,sys
D='db4/posts'; vers={}
# versions from listing file names unknown -> re-read via list output not stored; read from a sidecar later
BASE=['#growthity','#meta','#metaads','#facebook','#facebookads','#instagram','#instagramads','#publicitemeta','#pubfacebook','#marketingdigital','#publicite','#entrepreneur','#tpe','#pme','#commercant','#artisan']
EMO=re.compile('[\U0001F300-\U0001FAFF☀-➿⭐✅❌✨]')
def first_emoji(t):
    t=t.lower()
    for k,e in [('vrai ou faux','🤔'),('note vos pubs','🕵️'),('étape','🧭'),('pubs vidéo','🎬'),('pub','🎬'),('lead','📥'),('nouveau','🆕'),('calendrier','📅'),('whatsapp','🔔'),('carrousel','📚'),('astuce','💡'),('erreur','⚠️')]:
        if k in t: return e
    return '🚀'
def enrich(cap, kind):
    lines=cap.rstrip().split('\n')
    tags=[]; 
    while lines and (lines[-1].strip().startswith('#') or not lines[-1].strip()):
        l=lines.pop().strip()
        if l: tags=re.findall(r'#\w+',l)+tags
    extra=['#reels','#ugc','#videomarketing'] if kind=='video' else ['#carrousel','#astucesmarketing'] if kind=='carousel' else ['#astucesmarketing']
    allt=[]
    for t in ['#growthity']+tags+BASE+extra:
        if t.lower() not in [a.lower() for a in allt]: allt.append(t)
    allt=allt[:22]
    out=[]
    for i,l in enumerate(lines):
        s=l.strip()
        if i==0 and s and not EMO.search(s): l=first_emoji(s)+' '+l
        elif 'lien en bio' in s.lower() and '👉' not in s: l=re.sub(r'(?i)(lien en bio)', r'👉 \1', l, count=1)
        elif re.search(r'(en commentaire)',s,re.I) and not EMO.search(s): l='💬 '+l
        elif s.lower().startswith('enregistrez') and not EMO.search(s[:3]): l='📌 '+l
        out.append(l)
    return '\n'.join(out).rstrip()+'\n\n'+' '.join(allt)
media={}
for f in glob.glob('db3/media/*.json'):
    media[os.path.basename(f)[:-5]]=json.load(open(f)).get('kind')
writes=[];ex=[]
for f in sorted(glob.glob(D+'/*.json')):
    x=json.load(open(f)); pid=os.path.basename(f)[:-5]
    if x.get('type')!='post' or x.get('status')=='live' or not x.get('launch') or x.get('zernio') or pid=='p-cp2' or not x.get('caption'): continue
    new=enrich(x['caption'],media.get(x.get('mediaId'),'video'))
    if new!=x['caption']: writes.append((pid,new)); 
json.dump(writes,open('enrich_writes.json','w'),ensure_ascii=False)
print(len(writes))
for pid,c in writes[:3]+[w for w in writes if 'vf-1' in w[0]]: print('====',pid);print(c)
