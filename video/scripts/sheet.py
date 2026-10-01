import glob, math, sys
from PIL import Image
fs = sorted(glob.glob('out/stills/f*.jpg'))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
for part in range(0, len(ims), 6):
    sub = ims[part:part + 6]
    sheet = Image.new('RGB', (w * 2, h * math.ceil(len(sub) / 2)), 'white')
    for i, im in enumerate(sub):
        sheet.paste(im, ((i % 2) * w, (i // 2) * h))
    sheet.save(f'out/stills/sheet{part // 6}.jpg', quality=80)
