"""Met une vidéo 9:16 dans la zone sûre des Reels / TikTok / Shorts.
Le contenu est réduit (80 %) et recentré sous l'en-tête de l'appli, loin des bords coupés sur téléphone
(~100 px de chaque côté), de la colonne d'icônes à droite et de la légende en bas. Le fond est la même vidéo floutée,
le contenu s'y fond par un bord progressif.
Usage : python3 scripts/reel_safe.py in.mp4 out.mp4 [scale=0.8] [top=150]"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter
src, dst = sys.argv[1], sys.argv[2]
S = float(sys.argv[3]) if len(sys.argv) > 3 else 0.8
TOP = int(sys.argv[4]) if len(sys.argv) > 4 else 150
W, H = int(1080 * S) // 2 * 2, int(1920 * S) // 2 * 2
X = (1080 - W) // 2
F = 36
m = Image.new('L', (W, H), 0)
ImageDraw.Draw(m).rounded_rectangle((F, F, W - F, H - F), radius=40, fill=255)
m = m.filter(ImageFilter.GaussianBlur(F / 2))
mask = os.path.join(tempfile.mkdtemp(), 'mask.png'); m.save(mask)
fc = (f"[0:v]split[a][b];[a]scale=1080:1920,boxblur=60:3,eq=saturation=1.1[bg];"
      f"[b]scale={W}:{H}[fg];[1:v]format=gray[mk];[fg][mk]alphamerge[fgm];[bg][fgm]overlay={X}:{TOP}:shortest=1,format=yuv420p[v]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-loop', '1', '-i', mask, '-filter_complex', fc, '-map', '[v]', '-map', '0:a?',
                '-c:v', 'libx264', '-profile:v', 'main', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', dst], check=True)
print('ok', dst)
