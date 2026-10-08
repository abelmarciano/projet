"""Production package for growthity.ai (Lovable).

Turns the generated pages into what the live site serves: clean URLs (/restauration), internal app
links (/auth, /cgv…), media from jsDelivr pinned to a commit, shared CSS/JS under /marketing/.
Usage: python3 landing/src/prod.py <commit-sha> <out-dir>
"""
import glob
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sha, out = sys.argv[1], sys.argv[2]
CDN = 'https://cdn.jsdelivr.net/gh/abelmarciano/projet@%s/landing/media/' % sha
os.makedirs(os.path.join(out, 'pages'), exist_ok=True)
os.makedirs(os.path.join(out, 'public', 'marketing'), exist_ok=True)
os.makedirs(os.path.join(out, 'public', 'og'), exist_ok=True)


def media(s):
    return re.sub(r"(?<![\w/.-])media/", CDN, s)


def page(s):
    s = re.sub(r'href="https://growthity\.ai(/[^"]*)" target="_blank" rel="noopener"', r'href="\1"', s)
    s = re.sub(r'href="index\.html(#[^"]*)?"', lambda m: 'href="/%s"' % (m.group(1) or ''), s)
    s = re.sub(r'href="([a-z0-9-]+)\.html(#[^"]*)?"', lambda m: 'href="/%s%s"' % (m.group(1), m.group(2) or ''), s)
    s = s.replace('href="site.css"', 'href="/marketing/site.css"').replace('src="site.js"', 'src="/marketing/site.js"')
    s = s.replace('href="favicon.svg"', 'href="/favicon.svg"')
    return media(s)


slugs = []
for f in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    slug = os.path.basename(f)[:-5]
    slugs.append(slug)
    with open(f, encoding='utf-8') as h:
        html = page(h.read())
    assert '.html"' not in re.sub(r'https?://[^"]+', '', html), slug
    with open(os.path.join(out, 'pages', slug + '.html'), 'w', encoding='utf-8') as h:
        h.write(html)
with open(os.path.join(ROOT, 'site.js'), encoding='utf-8') as h:
    js = media(h.read())
with open(os.path.join(out, 'public', 'marketing', 'site.js'), 'w', encoding='utf-8') as h:
    h.write(js)
shutil.copy(os.path.join(ROOT, 'site.css'), os.path.join(out, 'public', 'marketing', 'site.css'))
for f in glob.glob(os.path.join(ROOT, 'og', '*.jpg')):
    shutil.copy(f, os.path.join(out, 'public', 'og'))
shutil.copy(os.path.join(ROOT, 'sitemap.xml'), os.path.join(out, 'sitemap-marketing.xml'))
print('%d pages, slugs: %s' % (len(slugs), ' '.join(slugs)))
