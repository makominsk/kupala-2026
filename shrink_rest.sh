#!/bin/bash
SRC="/Volumes/РАЗОБРАТЬ/Купала/видео_4К"
FFMPEG="/usr/local/opt/ffmpeg-full/bin/ffmpeg"
VF="zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,fps=30,scale=720:-2"
cd /Users/macbookpro_ma-ko/kupala-gallery
for name in IMG_6523 IMG_6540 IMG_6539 IMG_6541 IMG_6518 IMG_6550 IMG_6538 IMG_6489 IMG_6524 IMG_6517; do
  echo "shrink $name"
  "$FFMPEG" -y -i "$SRC/$name.mov" -vf "$VF" \
    -c:v libx264 -preset veryfast -crf 27 -maxrate 1500k -bufsize 3M \
    -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 112k -movflags +faststart \
    "web/$name.mp4" >"logs/webshrink_$name.log" 2>&1 && echo "  ok" || echo "  FAIL"
done
echo "SHRINK_DONE"
du -sh web
