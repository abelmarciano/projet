#!/bin/bash
# Render organic reels: scripts/render_reels.sh 6 7 … → out/reels/growthity-reel-N.mp4 (+ -web.mp4, poster)
cd "$(dirname "$0")/.." || exit 1
D=node_modules/@remotion/compositor-linux-x64-gnu
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p out/reels/posters
for n in "$@"; do
  npx remotion render src/index.ts Reel$n out/reels/raw-$n.mp4 --props="{\"id\":\"r$n\",\"withAudio\":false}" --codec=h264 --crf=16 --muted --browser-executable=$B > out/reels/render-$n.log 2>&1 || { echo "FAIL $n"; continue; }
  LD_LIBRARY_PATH=$D $D/ffmpeg -v error -y -i out/reels/raw-$n.mp4 -i public/reels/r$n.wav -map 0:v -map 1:a -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/reels/growthity-reel-$n.mp4 &&
  LD_LIBRARY_PATH=$D $D/ffmpeg -v error -y -ss 2.6 -i out/reels/growthity-reel-$n.mp4 -frames:v 1 -vf scale=540:-1 -q:v 4 out/reels/posters/reel-$n.jpg && rm -f out/reels/raw-$n.mp4 out/reels/render-$n.log && echo "DONE $n"
done
