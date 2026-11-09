#!/bin/bash
# Render shorts: scripts/render_shorts.sh 1 3 5   → out/shorts/growthity-short-N.mp4 (+ -web.mp4)
cd "$(dirname "$0")/.." || exit 1
D=node_modules/@remotion/compositor-linux-x64-gnu
B=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
mkdir -p out/shorts
for n in "$@"; do
  npx remotion render src/index.ts Short$n out/shorts/raw-$n.mp4 --props="{\"id\":\"s$n\",\"withAudio\":false}" --codec=h264 --crf=16 --muted --browser-executable=$B > out/shorts/render-$n.log 2>&1 || { echo "FAIL $n"; continue; }
  LD_LIBRARY_PATH=$D $D/ffmpeg -v error -y -i out/shorts/raw-$n.mp4 -i public/shorts/s$n.wav -map 0:v -map 1:a -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/shorts/growthity-short-$n.mp4 &&
  LD_LIBRARY_PATH=$D $D/ffmpeg -v error -y -i out/shorts/growthity-short-$n.mp4 -c:v libx264 -crf 23 -preset slow -c:a copy -movflags +faststart out/shorts/growthity-short-$n-web.mp4 && echo "DONE $n"
done
