import sys, glob
from PIL import Image
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(f'{d}/f*.jpg'))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
s = Image.new('RGB', (w * len(ims), h), 'white')
for i, im in enumerate(ims):
    s.paste(im, (i * w, 0))
s.save(out, quality=82)
