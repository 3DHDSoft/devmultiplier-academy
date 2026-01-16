#!/bin/bash
# Render all Remotion compositions to MP4

set -e

# List of compositions to render
compositions=(
  "AggregateLifecycle"
  # "CommandQueryFlow"
  # "ContextMapDemo"
  # "CQRSArchitecture"
  # "EventStormDemo"
)

# Create output directory if it doesn't exist
mkdir -p out

echo "Rendering ${#compositions[@]} composition(s)..."

for comp in "${compositions[@]}"; do
  echo "Rendering: $comp"
  bunx remotion render src/index.tsx "$comp" "out/${comp}.mp4" \
    --codec h264 \
    --crf 12 \
    --pixel-format yuv444p \
    --image-format png
  echo "Done: out/${comp}.mp4"
done

echo "All compositions rendered successfully!"
