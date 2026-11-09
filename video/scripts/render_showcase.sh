#!/bin/bash
# Showcase reels: intro « tapé dans Growthity » + real Growthity ad + end card → out/showcase/<id>.mp4
cd "$(dirname "$0")/.." || exit 1
D=node_modules/@remotion/compositor-linux-x64-gnu; F="/usr/bin/ffmpeg -nostdin -v error -y"
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p out/showcase/parts out/showcase/posters
if [ ! -f out/showcase/parts/end.mp4 ]; then
  npx remotion render src/index.ts ShowEnd out/showcase/parts/end-raw.mp4 --muted --codec=h264 --crf=18 --browser-executable=$B >/dev/null 2>&1 &&
  $F -i out/showcase/parts/end-raw.mp4 -i public/reels/show-end.wav -map 0:v -map 1:a -c:v copy -c:a aac -ar 48000 -ac 2 -shortest out/showcase/parts/end.mp4
fi
python3 - "$@" <<'PY' > out/showcase/parts/jobs.txt
import json, sys
S = json.load(open('src/reels/showcase.json'))
for s in S:
    if len(sys.argv) > 1 and s['id'] not in sys.argv[1:]: continue
    props = {'prompt': s['prompt'], 'label': s['label'], 'n': s['id'][1:]}
    if s.get('reconstructed'): props['heading'] = 'Le brief :'
    print(s['id'], s['src'], json.dumps(props, ensure_ascii=False))
PY
while read -r id src props; do
  npx remotion render src/index.ts ShowIntro out/showcase/parts/$id-intro-raw.mp4 --props="$props" --muted --codec=h264 --crf=18 --browser-executable=$B </dev/null >/dev/null 2>&1 || { echo "FAIL intro $id"; continue; }
  $F -i out/showcase/parts/$id-intro-raw.mp4 -i public/reels/show-intro.wav -map 0:v -map 1:a -c:v copy -c:a aac -ar 48000 -ac 2 -shortest out/showcase/parts/$id-intro.mp4
  $F -i public/media/gw/$src.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30" -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -ar 48000 -ac 2 out/showcase/parts/$id-body.mp4
  $F -i out/showcase/parts/$id-intro.mp4 -i out/showcase/parts/$id-body.mp4 -i out/showcase/parts/end.mp4 -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 21 -preset medium -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart out/showcase/growthity-$id.mp4 &&
  $F -ss 4.2 -i out/showcase/growthity-$id.mp4 -frames:v 1 -vf scale=540:-1 -q:v 4 out/showcase/posters/$id.jpg && echo "DONE $id"
done < out/showcase/parts/jobs.txt
