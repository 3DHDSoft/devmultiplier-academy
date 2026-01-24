# DevMultiplier Academy - Animation Library

React-based animations for course videos using [Remotion](https://remotion.dev).

## Quick Start

```bash
# Install dependencies
bun install

# Start preview server
bun run start

# Render video
bunx remotion render src/index.tsx EventStormDemo out/event-storm.mp4
```

## Available Compositions

| ID | Description | Duration | Lesson |
|----|-------------|----------|--------|
| `EventStormDemo` | Animated Event Storm diagram | 15s | M1L4 |

## Components

### StickyNote
Animated sticky note with spring animation.

```tsx
<StickyNote
  text="OrderPlaced"
  color="orange"  // orange | blue | yellow | pink | green
  x={100}
  y={200}
  delay={30}      // frames to wait before appearing
/>
```

### BoundedContext
Animated bounded context box with drawing border effect.

```tsx
<BoundedContext
  name="Sales Context"
  color="green"   // green | orange | blue | purple
  x={60}
  y={100}
  width={500}
  height={300}
  delay={0}
>
  {/* Child components */}
</BoundedContext>
```

### Arrow
Animated arrow with optional label.

```tsx
<Arrow
  fromX={100}
  fromY={200}
  toX={300}
  toY={200}
  delay={60}
  color="#2e7d32"
  label="triggers"
  dashed={false}
/>
```

## Color Palette

Matches DevMultiplier Academy branding:

| Color | Hex | Use |
|-------|-----|-----|
| Orange | `#fed7aa` | Domain Events |
| Blue | `#bfdbfe` | Commands |
| Yellow | `#fef08a` | Aggregates |
| Green | `#e8f5e9` | Sales Context |
| Orange BG | `#fff3e0` | Payment Context |
| Blue BG | `#e3f2fd` | Fulfillment Context |

## Adding New Compositions

1. Create component in `src/compositions/`
2. Register in `src/Root.tsx`
3. Render with `npx remotion render`

## Rendering Options

```bash
# High quality (YouTube)
bunx remotion render src/index.tsx EventStormDemo out/video.mp4 \
  --codec h264 \
  --crf 18

# Transparent background (for compositing)
bunx remotion render src/index.tsx EventStormDemo out/video.webm \
  --codec vp9 \
  --pixel-format yuva420p

# GIF (for docs/previews)
bunx remotion render src/index.tsx EventStormDemo out/preview.gif \
  --every-nth-frame 2
```

## Project Structure

```
remotion/
├── src/
│   ├── components/
│   │   ├── StickyNote.tsx
│   │   ├── BoundedContext.tsx
│   │   └── Arrow.tsx
│   ├── compositions/
│   │   └── EventStormDemo.tsx
│   ├── Root.tsx
│   └── index.tsx
├── out/                  # Rendered videos
├── package.json
└── tsconfig.json
```
