#!/bin/bash
set -uo pipefail

SRC="/Volumes/РАЗОБРАТЬ/Купала/видео_4К"
OUT="/Users/macbookpro_ma-ko/kupala-gallery"
FFMPEG="/usr/local/opt/ffmpeg-full/bin/ffmpeg"

VF="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"

mkdir -p "$OUT/videos" "$OUT/posters"

total=0
ok=0
fail=0

for src in "$SRC"/*.mov; do
  name=$(basename "$src" .mov)
  dst="$OUT/videos/$name.mp4"
  poster="$OUT/posters/$name.jpg"
  total=$((total+1))

  echo "[$total] $name.mov -> $name.mp4"

  if [ -f "$dst" ]; then
    echo "  already exists, skipping encode"
  else
    "$FFMPEG" -y -i "$src" \
      -vf "$VF" \
      -c:v h264_videotoolbox -b:v 24M -maxrate 28M -bufsize 48M -profile:v high \
      -c:a aac -b:a 192k -movflags +faststart \
      "$dst" >"$OUT/logs/$name.log" 2>&1

    if [ $? -ne 0 ]; then
      echo "  FFMPEG FAILED for $name"
      fail=$((fail+1))
      continue
    fi
  fi

  if [ ! -f "$poster" ]; then
    "$FFMPEG" -y -ss 1 -i "$dst" -vframes 1 -vf "scale=480:-1" -q:v 4 "$poster" >>"$OUT/logs/$name.log" 2>&1
  fi

  ok=$((ok+1))
done

echo "DONE: total=$total ok=$ok fail=$fail"
