#!/bin/bash
# Assemble deux morceaux WAN (coupe à $4 s) avec l'audio original. Usage: wan_assemble.sh <dir> <audio> <cut_s> <out>
W=$1; A=$2; C=$3; O=$4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $A)
ffmpeg -v error -y -i $W/wan1.mp4 -i $W/wan2.mp4 -i $A -filter_complex "[0:v]scale=1080:1920,trim=0:$C,setpts=PTS-STARTPTS,fps=30[a];[1:v]scale=1080:1920,trim=start=0.0334,setpts=PTS-STARTPTS,fps=30[b];[a][b]concat=n=2:v=1:a=0,trim=0:$D,setpts=PTS-STARTPTS,format=yuv420p[v]" -map "[v]" -map 2:a -c:v libx264 -profile:v main -crf 18 -preset slow -c:a aac -b:a 192k -movflags +faststart $O
