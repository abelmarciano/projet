import sys, glob, os
from PIL import Image, ImageDraw
files = sys.argv[2:]
W = 640; cols = 3
thumbs = []
for f in files:
    im = Image.open(f).convert('RGB'); im.thumbnail((W, 400))
    c = Image.new('RGB', (W, 420), 'white'); c.paste(im, (0, 0))
    ImageDraw.Draw(c).text((4, 404), os.path.basename(f), fill='red')
    thumbs.append(c)
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new('RGB', (W * cols, 420 * rows), 'gray')
for i, t in enumerate(thumbs): sheet.paste(t, ((i % cols) * W, (i // cols) * 420))
sheet.save(sys.argv[1])
