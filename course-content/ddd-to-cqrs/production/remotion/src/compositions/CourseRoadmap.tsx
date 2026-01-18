import React, { useEffect } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { loadFonts, fontFamily } from '../fonts';

/**
 * Course Roadmap Animation
 * Duration: 30 seconds (900 frames at 30fps)
 * Canvas: 1920x1080
 *
 * Timeline:
 * 0-2s:    Title fades in
 * 2-5s:    Module 1 node appears with label
 * 5-8s:    Module 2 & 3 appear with connections
 * 8-11s:   Module 4 & 5 appear with connections
 * 11-14s:  Module 6 appears with AI icon
 * 14-16s:  "Your Journey" path highlights
 * 16-30s:  Hold complete diagram
 */

interface ModuleNodeProps {
  x: number;
  y: number;
  number: number;
  title: string;
  icon: string;
  color: string;
  delay: number;
}

const ModuleNode: React.FC<ModuleNodeProps> = ({ x, y, number, title, icon, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const opacity = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  if (frame < delay) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Circle with number */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          border: '4px solid white',
        }}
      >
        <span style={{ fontSize: 48, fontFamily, fontWeight: 700, color: 'white' }}>{number}</span>
      </div>

      {/* Icon below circle */}
      <div style={{ marginTop: 12, fontSize: 36 }}>{icon}</div>

      {/* Title */}
      <div
        style={{
          marginTop: 8,
          fontFamily,
          fontSize: 22,
          fontWeight: 600,
          color: '#1f2328',
          textAlign: 'center',
          maxWidth: 180,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
    </div>
  );
};

interface ConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
  curved?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ fromX, fromY, toX, toY, delay, curved = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  if (frame < delay) return null;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);

  // For curved lines, calculate control point
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const curveOffset = curved ? 40 : 0;

  const pathD = curved
    ? `M ${fromX} ${fromY} Q ${midX} ${midY - curveOffset} ${toX} ${toY}`
    : `M ${fromX} ${fromY} L ${toX} ${toY}`;

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        opacity={0.6}
      />
    </svg>
  );
};

export const CourseRoadmap: React.FC = () => {
  useEffect(() => {
    loadFonts();
  }, []);

  const frame = useCurrentFrame();

  // Title animation
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 30], [-20, 0], { extrapolateRight: 'clamp' });

  // Layout - hexagonal pattern for visual interest
  const centerX = 960;
  const centerY = 500;

  // Module positions in a flowing path layout
  const modules = [
    { x: 180, y: 280, number: 1, title: 'Introduction to DDD', icon: '📚', color: '#3b82f6' },
    { x: 500, y: 180, number: 2, title: 'Bounded Contexts', icon: '🔲', color: '#06b6d4' },
    { x: 820, y: 280, number: 3, title: 'Aggregates & Patterns', icon: '🧩', color: '#10b981' },
    { x: 1140, y: 180, number: 4, title: 'Introduction to CQRS', icon: '⚡', color: '#f59e0b' },
    { x: 1460, y: 280, number: 5, title: 'Event Sourcing', icon: '📜', color: '#ef4444' },
    { x: 1140, y: 480, number: 6, title: 'AI-Assisted Implementation', icon: '🤖', color: '#8b5cf6' },
  ];

  // Connection timing and positions
  const connections = [
    { from: 0, to: 1, delay: 120, curved: true },
    { from: 1, to: 2, delay: 150, curved: true },
    { from: 2, to: 3, delay: 240, curved: true },
    { from: 3, to: 4, delay: 270, curved: true },
    { from: 4, to: 5, delay: 330, curved: false },
  ];

  // Module appearance delays (in frames)
  const moduleDelays = [60, 120, 180, 240, 300, 360];

  // "Your Journey" text animation
  const journeyOpacity = interpolate(frame, [420, 450], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#f8fafc' }}>
      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily,
          fontSize: 48,
          fontWeight: 700,
          color: '#0f172a',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        From DDD to CQRS with AI Agents
      </div>

      {/* Subtitle */}
      <Sequence from={30} durationInFrames={870}>
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily,
            fontSize: 24,
            fontWeight: 500,
            color: '#64748b',
            opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          Your Learning Journey
        </div>
      </Sequence>

      {/* Connection Lines - render before nodes so nodes appear on top */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={i}
          fromX={modules[conn.from].x + 50}
          fromY={modules[conn.from].y + 50}
          toX={modules[conn.to].x + 50}
          toY={modules[conn.to].y + 50}
          delay={conn.delay}
          curved={conn.curved}
        />
      ))}

      {/* Module Nodes */}
      {modules.map((mod, i) => (
        <ModuleNode key={i} x={mod.x} y={mod.y} number={mod.number} title={mod.title} icon={mod.icon} color={mod.color} delay={moduleDelays[i]} />
      ))}

      {/* Journey completion indicator */}
      <Sequence from={420} durationInFrames={480}>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily,
            fontSize: 28,
            fontWeight: 600,
            color: '#059669',
            opacity: journeyOpacity,
          }}
        >
          ✨ 6 Modules &bull; 25 Lessons &bull; Real-World Projects ✨
        </div>
      </Sequence>

      {/* Progress dots at bottom */}
      <Sequence from={480} durationInFrames={420}>
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            opacity: interpolate(frame, [480, 510], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {modules.map((mod, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: mod.color,
                opacity: frame > moduleDelays[i] + 30 ? 1 : 0.3,
                transition: 'opacity 0.3s',
              }}
            />
          ))}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
