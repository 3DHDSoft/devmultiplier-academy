import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface ArrowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay?: number;
  color?: string;
  label?: string;
  dashed?: boolean;
}

export const Arrow: React.FC<ArrowProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  delay = 0,
  color = '#475569',
  label,
  dashed = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate arrow geometry
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Animation progress
  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 20,
      stiffness: 60,
    },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < delay) {
    return null;
  }

  // Calculate the current end point based on progress
  const currentLength = length * progress;
  const currentEndX = fromX + Math.cos(angle) * currentLength;
  const currentEndY = fromY + Math.sin(angle) * currentLength;

  // Arrowhead points (scaled for 2x resolution)
  const arrowSize = 24;
  const arrowAngle = Math.PI / 6; // 30 degrees

  const arrowPoint1X = currentEndX - arrowSize * Math.cos(angle - arrowAngle);
  const arrowPoint1Y = currentEndY - arrowSize * Math.sin(angle - arrowAngle);
  const arrowPoint2X = currentEndX - arrowSize * Math.cos(angle + arrowAngle);
  const arrowPoint2Y = currentEndY - arrowSize * Math.sin(angle + arrowAngle);

  // Label position (middle of arrow)
  const labelX = (fromX + toX) / 2;
  const labelY = (fromY + toY) / 2 - 30;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        {/* Arrow line */}
        <line
          x1={fromX}
          y1={fromY}
          x2={currentEndX}
          y2={currentEndY}
          stroke={color}
          strokeWidth={5}
          strokeDasharray={dashed ? '16,8' : 'none'}
        />

        {/* Arrowhead (only show when mostly drawn) */}
        {progress > 0.8 && (
          <polygon
            points={`${currentEndX},${currentEndY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
            fill={color}
            style={{
              opacity: interpolate(progress, [0.8, 1], [0, 1]),
            }}
          />
        )}
      </svg>

      {/* Label */}
      {label && progress > 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: labelX,
            top: labelY,
            transform: 'translateX(-50%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 28,
            fontWeight: 500,
            color: color,
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '8px 16px',
            borderRadius: '8px',
            opacity: interpolate(progress, [0.5, 0.8], [0, 1]),
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
