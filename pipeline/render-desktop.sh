#!/bin/bash
# scroll-world desktop chain — Architecture A (continuous forward take).
# 7 stills (concurrent) + 7 legs (STRICTLY sequential: each leg starts from the
# previous leg's actual last frame). bash 3.2 safe. Run detached; takes ~1-2 h.
#
# Requires: higgsfield (authed), ffmpeg, jq, curl.
# Usage:  bash render-desktop.sh            # full run
#         bash render-desktop.sh stills     # stills only
#         bash render-desktop.sh legs       # legs only (stills must exist)
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${WORK:-$HERE/work}"
PROMPTS="$HERE/prompts"
mkdir -p "$WORK"

NAMES="bridge gov biz media expo study contact"

VMODEL="${VMODEL:-seedance_2_0}"
case "$VMODEL" in
  kling3_0)          VOPTS="--mode std --sound off";        LEG_DUR=10 ;;
  seedance_2_0_mini) VOPTS="--mode std --resolution 720p";  LEG_DUR=8 ;;
  *)                 VOPTS="--mode std --resolution 1080p"; LEG_DUR=8 ;;
esac
ATTEMPTS=3

still_prompt() { cat "$PROMPTS/preamble.txt" "$PROMPTS/subject_$1.txt"; }

gen_still() { # name
  local n="$1"
  higgsfield generate create gpt_image_2 --prompt "$(still_prompt "$n")" \
    --aspect_ratio 3:2 --resolution 2k --quality high \
    --wait --wait-timeout 15m --json > "$WORK/still_$n.json" 2> "$WORK/still_$n.err"
  local url; url=$(jq -r '.[0].result_url // empty' "$WORK/still_$n.json")
  if [ -n "$url" ]; then curl -fsSL "$url" -o "$WORK/still_$n.png" && echo "still $n ok"; else echo "still $n FAIL (see $WORK/still_$n.err)"; fi
}

gen_leg() { # name start_image  -> $WORK/leg_<name>.mp4, retries + NSFW note
  local n="$1" start="$2" a=1 url st
  while [ "$a" -le "$ATTEMPTS" ]; do
    higgsfield generate create "$VMODEL" --prompt "$(cat "$PROMPTS/leg_$n.txt")" \
      --start-image "$start" \
      $VOPTS --aspect_ratio 16:9 --duration "$LEG_DUR" \
      --wait --wait-timeout 20m --json > "$WORK/leg_$n.json" 2> "$WORK/leg_$n.err"
    url=$(jq -r '.[0].result_url // empty' "$WORK/leg_$n.json")
    if [ -n "$url" ]; then curl -fsSL "$url" -o "$WORK/leg_$n.mp4" && { echo "leg $n ok (attempt $a)"; return 0; }; fi
    st=$(jq -r '.[0].status // empty' "$WORK/leg_$n.json" 2>/dev/null)
    echo "leg $n attempt $a failed (status: ${st:-unknown}) — re-rolling"
    a=$((a+1))
  done
  echo "leg $n FAILED after $ATTEMPTS attempts."
  echo "  If status was 'nsfw': strip trigger words, or re-run just this leg on kling3_0:"
  echo "  VMODEL=kling3_0 bash $0 leg $n"
  return 1
}

last_frame() { ffmpeg -v error -y -sseof -0.15 -i "$1" -frames:v 1 -q:v 2 "$2"; }

run_stills() {
  for n in $NAMES; do gen_still "$n" & done
  wait
  echo "--- stills done. REVIEW $WORK/still_*.png for cohesion before running legs. ---"
}

run_legs() {
  local prev="" start
  for n in $NAMES; do
    if [ -z "$prev" ]; then start="$WORK/still_$n.png"
    else
      last_frame "$WORK/leg_$prev.mp4" "$WORK/handoff_$prev.png" || { echo "no leg_$prev.mp4 — aborting chain"; return 1; }
      start="$WORK/handoff_$prev.png"
    fi
    gen_leg "$n" "$start" || return 1
    # eyeball gate: the last frame must read as a calm forward glide before chaining on
    last_frame "$WORK/leg_$n.mp4" "$WORK/check_$n.png"
    echo "leg $n last frame -> $WORK/check_$n.png (inspect; re-roll THIS leg if it isn't a calm forward glide)"
    prev="$n"
  done
  echo "--- all legs done. Next: bash encode.sh ---"
}

case "${1:-all}" in
  stills) run_stills ;;
  legs)   run_legs ;;
  leg)    # re-roll a single leg: bash render-desktop.sh leg <name> [start_image]
    n="$2"; start="${3:-}"
    if [ -z "$start" ]; then
      prev=""; for x in $NAMES; do [ "$x" = "$n" ] && break; prev="$x"; done
      if [ -z "$prev" ]; then start="$WORK/still_$n.png"; else last_frame "$WORK/leg_$prev.mp4" "$WORK/handoff_$prev.png"; start="$WORK/handoff_$prev.png"; fi
    fi
    gen_leg "$n" "$start" ;;
  all)    run_stills && run_legs ;;
  *) echo "usage: bash $0 [stills|legs|leg <name>|all]"; exit 1 ;;
esac
