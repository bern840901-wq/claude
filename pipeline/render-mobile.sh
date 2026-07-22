#!/bin/bash
# scroll-world mobile chain — native 9:16 portrait (pipeline §6b), Architecture A.
# The portrait chain is COMPLETE and independent: its own 9:16 stills, its own
# sequential legs frame-locked against its OWN renders (never the landscape ones).
# bash 3.2 safe. Run after (or in parallel with) render-desktop.sh.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$HERE/work}"
PROMPTS="$HERE/prompts"
mkdir -p "$WORK"

NAMES="bridge gov biz media expo study contact"
PORTRAIT_CLAUSE="Vertical portrait composition, the focal subject centered with generous space above and below. "

VMODEL="${VMODEL:-seedance_2_0}"
case "$VMODEL" in
  kling3_0)          VOPTS="--mode std --sound off";        LEG_DUR=10 ;;
  seedance_2_0_mini) VOPTS="--mode std --resolution 720p";  LEG_DUR=8 ;;
  *)                 VOPTS="--mode std --resolution 1080p"; LEG_DUR=8 ;;
esac
ATTEMPTS=3

gen_still_m() { # name — native 9:16 still, same preamble + subject
  local n="$1"
  higgsfield generate create gpt_image_2 \
    --prompt "${PORTRAIT_CLAUSE}$(cat "$PROMPTS/preamble.txt" "$PROMPTS/subject_$n.txt")" \
    --aspect_ratio 9:16 --resolution 2k --quality high \
    --wait --wait-timeout 15m --json > "$WORK/still_${n}_m.json" 2> "$WORK/still_${n}_m.err"
  local url; url=$(jq -r '.[0].result_url // empty' "$WORK/still_${n}_m.json")
  if [ -n "$url" ]; then curl -fsSL "$url" -o "$WORK/still_${n}_m.png" && echo "still-m $n ok"; else echo "still-m $n FAIL"; fi
}

gen_leg_m() { # name start_image
  local n="$1" start="$2" a=1 url st
  while [ "$a" -le "$ATTEMPTS" ]; do
    higgsfield generate create "$VMODEL" \
      --prompt "${PORTRAIT_CLAUSE}$(cat "$PROMPTS/leg_$n.txt")" \
      --start-image "$start" \
      $VOPTS --aspect_ratio 9:16 --duration "$LEG_DUR" \
      --wait --wait-timeout 20m --json > "$WORK/leg_${n}_m.json" 2> "$WORK/leg_${n}_m.err"
    url=$(jq -r '.[0].result_url // empty' "$WORK/leg_${n}_m.json")
    if [ -n "$url" ]; then curl -fsSL "$url" -o "$WORK/leg_${n}_m.mp4" && { echo "leg-m $n ok (attempt $a)"; return 0; }; fi
    st=$(jq -r '.[0].status // empty' "$WORK/leg_${n}_m.json" 2>/dev/null)
    echo "leg-m $n attempt $a failed (status: ${st:-unknown}) — re-rolling"
    a=$((a+1))
  done
  echo "leg-m $n FAILED after $ATTEMPTS attempts (NSFW fallback: VMODEL=kling3_0 bash $0 leg $n)"
  return 1
}

last_frame() { ffmpeg -v error -y -sseof -0.15 -i "$1" -frames:v 1 -q:v 2 "$2"; }

run_stills() { for n in $NAMES; do gen_still_m "$n" & done; wait; echo "--- portrait stills done; review before legs. ---"; }

run_legs() {
  local prev="" start
  for n in $NAMES; do
    if [ -z "$prev" ]; then start="$WORK/still_${n}_m.png"
    else last_frame "$WORK/leg_${prev}_m.mp4" "$WORK/handoff_${prev}_m.png" || return 1; start="$WORK/handoff_${prev}_m.png"; fi
    gen_leg_m "$n" "$start" || return 1
    last_frame "$WORK/leg_${n}_m.mp4" "$WORK/check_${n}_m.png"
    echo "leg-m $n last frame -> $WORK/check_${n}_m.png (inspect before it chains on)"
    prev="$n"
  done
  echo "--- portrait legs done. Next: bash encode.sh ---"
}

case "${1:-all}" in
  stills) run_stills ;;
  legs)   run_legs ;;
  leg)
    n="$2"; start="${3:-}"
    if [ -z "$start" ]; then
      prev=""; for x in $NAMES; do [ "$x" = "$n" ] && break; prev="$x"; done
      if [ -z "$prev" ]; then start="$WORK/still_${n}_m.png"; else last_frame "$WORK/leg_${prev}_m.mp4" "$WORK/handoff_${prev}_m.png"; start="$WORK/handoff_${prev}_m.png"; fi
    fi
    gen_leg_m "$n" "$start" ;;
  all)    run_stills && run_legs ;;
  *) echo "usage: bash $0 [stills|legs|leg <name>|all]"; exit 1 ;;
esac
