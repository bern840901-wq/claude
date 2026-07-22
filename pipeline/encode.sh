#!/bin/bash
# Encode the rendered chain for smooth scrubbing + build posters, then flip
# USE_PLACEHOLDERS in ../world-config.js to false.
# Desktop: native res, crf 20, GOP 8. Mobile (9:16): 720 wide, crf 23, GOP 4.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$HERE/work}"
SITE="$(cd "$HERE/.." && pwd)"
VID="$SITE/assets/vid"
STILLS="$SITE/assets/stills"
mkdir -p "$VID" "$STILLS"

NAMES="bridge gov biz media expo study contact"

enc()  { ffmpeg -v error -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2" && echo "enc  $2 $(du -h "$2" | cut -f1)"; }

encm() { ffmpeg -v error -y -i "$1" -an -vf "scale=720:-2,unsharp=5:5:0.6:5:5:0.0" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$2" && echo "encm $2 $(du -h "$2" | cut -f1)"; }

webp_from() { # src dst width
  if command -v cwebp >/dev/null 2>&1; then cwebp -quiet -q 84 -resize "$3" 0 "$1" -o "$2";
  else ffmpeg -v error -y -i "$1" -vf "scale=$3:-2" -q:v 80 "$2"; fi
  echo "webp $2"
}

for n in $NAMES; do
  # desktop
  [ -f "$WORK/leg_$n.mp4" ] && enc "$WORK/leg_$n.mp4" "$VID/$n.mp4"
  # poster = the leg's FIRST frame (what the scene opens on), fallback: the still
  if [ -f "$WORK/leg_$n.mp4" ]; then
    ffmpeg -v error -y -ss 0 -i "$WORK/leg_$n.mp4" -frames:v 1 -q:v 2 "$WORK/poster_$n.png"
    webp_from "$WORK/poster_$n.png" "$STILLS/$n.webp" 1800
  elif [ -f "$WORK/still_$n.png" ]; then
    webp_from "$WORK/still_$n.png" "$STILLS/$n.webp" 1800
  fi
  # mobile (native 9:16 chain)
  if [ -f "$WORK/leg_${n}_m.mp4" ]; then
    encm "$WORK/leg_${n}_m.mp4" "$VID/$n-m.mp4"
    ffmpeg -v error -y -ss 0 -i "$WORK/leg_${n}_m.mp4" -frames:v 1 -q:v 2 "$WORK/poster_${n}_m.png"
    webp_from "$WORK/poster_${n}_m.png" "$STILLS/$n-m.webp" 900
  fi
done

echo
echo "Done. Now flip the switch in world-config.js:"
echo "  window.USE_PLACEHOLDERS = false;"
echo "Then QA per pipeline/README.md (seams, blob seekability, phone scrub)."
