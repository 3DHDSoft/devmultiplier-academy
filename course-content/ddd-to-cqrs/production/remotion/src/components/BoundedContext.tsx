import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export type ContextColor = 'green' | 'orange' | 'blue' | 'purple';

interface BoundedContextProps {
  name: string;
  color: ContextColor;
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
  children?: React.ReactNode;
}

const colorMap: Record<ContextColor, { bg: string; border: string; text: string }> = {
  green: {
    bg: '#e8f5e9',
    border: '#2e7d32',
    text: '#1b5e20',
  },
  orange: {
    bg: '#fff3e0',
    border: '#e65100',
    text: '#bf360c',
  },
  blue: {
    bg: '#e3f2fd',
    border: '#1565c0',
    text: '#0d47a1',
  },
  purple: {
    bg: '#f3e5f5',
    border: '#7b1fa2',
    text: '#4a148c',
  },
};

export const BoundedContext: React.FC<BoundedContextProps> = ({
  name,
  color,
  x,
  y,
  width,
  height,
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = colorMap[color];

  // Animate the border drawing
  const borderProgress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 20,
      stiffness: 80,
    },
  });

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame - delay, [0, 20], [0.95, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < delay) {
    return null;
  }

  // Calculate perimeter for stroke-dasharray animation
  const perimeter = 2 * (width + height);
  const strokeDasharray = perimeter;
  const strokeDashoffset = perimeter * (1 - borderProgress);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: colors.bg,
          borderRadius: '12px',
          opacity: borderProgress,
        }}
      />

      {/* Animated border using SVG */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <rect
          x={3}
          y={3}
          width={width - 6}
          height={height - 6}
          rx={20}
          ry={20}
          fill="none"
          stroke={colors.border}
          strokeWidth={6}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 36,
          fontWeight: 700,
          color: colors.text,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          opacity: borderProgress,
        }}
      >
        {name}
      </div>

      {/* Children (sticky notes, etc.) */}
      <div style={{ position: 'relative', paddingTop: 50 }}>{children}</div>
    </div>
  );
};
