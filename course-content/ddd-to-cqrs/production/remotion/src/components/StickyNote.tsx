import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

export type StickyNoteColor = 'orange' | 'blue' | 'yellow' | 'pink' | 'green';

interface StickyNoteProps {
  text: string;
  color: StickyNoteColor;
  delay?: number;
  x: number;
  y: number;
  width?: number;
  fontSize?: number;
}

const colorMap: Record<StickyNoteColor, { bg: string; border: string; text: string }> = {
  orange: {
    bg: '#fed7aa',
    border: '#f97316',
    text: '#9a3412',
  },
  blue: {
    bg: '#bfdbfe',
    border: '#3b82f6',
    text: '#1e40af',
  },
  yellow: {
    bg: '#fef08a',
    border: '#eab308',
    text: '#854d0e',
  },
  pink: {
    bg: '#fbcfe8',
    border: '#ec4899',
    text: '#9d174d',
  },
  green: {
    bg: '#bbf7d0',
    border: '#22c55e',
    text: '#166534',
  },
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  text,
  color,
  delay = 0,
  x,
  y,
  width = 180,
  fontSize = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = colorMap[color];

  // Spring animation for natural feel
  const scale = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slight rotation for sticky note feel
  const rotation = interpolate(frame - delay, [0, 15], [-5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < delay) {
    return null;
  }

  const containerStyle = { position: 'absolute' as const, left: x, top: y, width, opacity, transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'top left' };
  const noteStyle = { backgroundColor: colors.bg, border: `3px solid ${colors.border}`, borderRadius: '8px', padding: '12px 10px', width: '100%', boxSizing: 'border-box' as const, boxShadow: '3px 3px 10px rgba(0,0,0,0.12)', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize, fontWeight: 600, color: colors.text, textAlign: 'center' as const, lineHeight: 1.3, overflow: 'hidden' as const, whiteSpace: 'nowrap' as const, textOverflow: 'ellipsis' as const };

  return (
    <div style={containerStyle}>
      <div style={noteStyle}>{text}</div>
    </div>
  );
};
