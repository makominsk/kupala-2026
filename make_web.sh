#!/bin/bash
set -uo pipefail

SRC="/Volumes/РАЗОБРАТЬ/Купала/видео_4К"
OUT="/Users/macbookpro_ma-ko/kupala-gallery"
FFMPEG="/usr/local/opt/ffmpeg-full/bin/ffmpeg"

# HDR(HLG/BT.2020) -> SDR(BT.709) тонмаппинг + 30fps для лёгких превью
VF="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,fps=30"

mkdir -p "$OUT/web" "$OUT/logs"

names=$(python3 -c "import json;print('\n'.join(json.load(open('$OUT/videos.json'))))")

total=0; ok=0; fail=0
for name in $names; do
  total=$((total+1))
  src="$SRC/$name.mov"
  dst="$OUT/web/$name.mp4"
  echo "[$total] $name"
  if [ ! -f "$src" ]; then echo "  SRC MISSING"; fail=$((fail+1)); continue; fi
  if [ -f "$dst" ]; then echo "  exists, skip"; ok=$((ok+1)); continue; fi
  "$FFMPEG" -y -i "$src" \
    -vf "$VF" \
    -c:v libx264 -preset veryfast -crf 25 -maxrate 3M -bufsize 6M \
    -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 128k -movflags +faststart \
    "$dst" >"$OUT/logs/web_$name.log" 2>&1
  if [ $? -eq 0 ]; then ok=$((ok+1)); else echo "  FAILED"; fail=$((fail+1)); fi
done
echo "WEB_DONE: total=$total ok=$ok fail=$fail"
du -sh "$OUT/web"
