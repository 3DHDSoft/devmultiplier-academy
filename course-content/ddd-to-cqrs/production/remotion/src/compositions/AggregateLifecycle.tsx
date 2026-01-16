import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { BoundedContext } from '../components/BoundedContext';
import { StickyNote } from '../components/StickyNote';
import { Arrow } from '../components/Arrow';

/**
Aggregate Lifecycle Animation
Shows the lifecycle of a DDD Aggregate from creation to state changes
Demonstrates aggregate lifecycle using an Order example
Phase 1: Creation (CreateOrderCommand → OrderCreatedEvent)
Phase 2: State Change (ConfirmOrderCommand → OrderConfirmedEvent)
Phase 3: Invariant Protection (CancelOrderCommand rejected)

What's working well:
- All text displays without truncation - command names, status labels, events, and phase labels are fully visible
- Clear visual separation of the three phases with distinct colors (green/Creation, orange/State Change, blue/Invariant Protection)
- Legend is readable and positioned well in the upper right
- The bold arrow "➜" character in "Event Store" labels is visible and appropriately weighted
- Phase labels (customerId, items[], orderId, paymentRef, etc.) are readable at 18px monospace font
- Red coloring on error-related labels draws attention to the rejection scenario
- Flow arrows with labels ("version incremented", "guards state") clearly connect the phases

Educational value:
The animation effectively demonstrates aggregate lifecycle concepts:
- Phase 1: Command creates aggregate → emits event → persists to event store
- Phase 2: Command updates aggregate state → version increments → emits confirmation event
- Phase 3: Invalid command rejected → aggregate protects its invariants → no event emitted

The progression tells a complete story about how aggregates enforce business rules and protect consistency through versioning and invariant checking.

AggregateLifecycle.tsx (20 seconds / 600 frames)
Duration: 20 seconds (600 frames at 30fps)
Canvas: 1920x1080
*/
export const AggregateLifecycle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Layout constants for 1920x1080
  const CONTEXT_WIDTH = 580;
  const CONTEXT_HEIGHT = 560;
  const CONTEXT_GAP = 30;
  const CONTEXT_Y = 130;

  const PHASE1_X = 30;
  const PHASE2_X = PHASE1_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const PHASE3_X = PHASE2_X + CONTEXT_WIDTH + CONTEXT_GAP;

  const ROW1_Y = 220;
  const ROW2_Y = 400;
  const ROW3_Y = 560;

  const CARD_WIDTH = 160;
  const CARD_FONT = 20;

  const containerStyle = { backgroundColor: '#f8fafc', padding: 20 };
  const titleStyle = { position: 'absolute' as const, top: 20, left: 30, fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 36, fontWeight: 700, color: '#0f172a' };
  const legendContainerStyle = { position: 'absolute' as const, top: 25, right: 30, display: 'flex', gap: 30, fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 28 };
  const legendItemStyle = { display: 'flex', alignItems: 'center', gap: 10 };
  const legendSwatchBase = { width: 28, height: 28, borderRadius: 4 };
  const commandSwatchStyle = { ...legendSwatchBase, backgroundColor: '#bfdbfe', border: '2px solid #3b82f6' };
  const aggregateSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fef08a', border: '2px solid #eab308' };
  const eventSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fed7aa', border: '2px solid #f97316' };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Title */}
      <Sequence from={0} durationInFrames={600}>
        <div style={titleStyle}>Aggregate Lifecycle: Order Example</div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={600}>
        <div style={legendContainerStyle}>
          <div style={legendItemStyle}>
            <div style={commandSwatchStyle} />
            <span>Command</span>
          </div>
          <div style={legendItemStyle}>
            <div style={aggregateSwatchStyle} />
            <span>Aggregate</span>
          </div>
          <div style={legendItemStyle}>
            <div style={eventSwatchStyle} />
            <span>Event</span>
          </div>
        </div>
      </Sequence>

      {/* ============ PHASE 1: CREATION ============ */}
      <Sequence from={0} durationInFrames={600}>
        <BoundedContext name="Phase 1: Creation" color="green" x={PHASE1_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Command */}
      <Sequence from={30} durationInFrames={570}>
        <StickyNote text="CreateOrderCmd" color="blue" x={PHASE1_X + 50} y={ROW1_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={60} durationInFrames={540}>
        <PhaseLabel x={PHASE1_X + 250} y={ROW1_Y + 20} text="customerId, items[]" delay={0} frame={frame} fps={fps} />
      </Sequence>

      {/* Aggregate Created */}
      <Sequence from={90} durationInFrames={510}>
        <StickyNote text="Order (v1)" color="yellow" x={PHASE1_X + 50} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={120} durationInFrames={480}>
        <StickyNote text="Status: PENDING" color="orange" x={PHASE1_X + 200} y={ROW2_Y} delay={0} width={CARD_WIDTH + 30} fontSize={CARD_FONT} />
      </Sequence>

      {/* Event */}
      <Sequence from={150} durationInFrames={450}>
        <StickyNote text="OrderCreatedEvent" color="orange" x={PHASE1_X + 100} y={ROW3_Y} delay={0} width={CARD_WIDTH + 50} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={180} durationInFrames={420}>
        <StickyNote text="➜ Event Store" color="pink" x={PHASE1_X + 320} y={ROW3_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ PHASE 2: STATE CHANGE ============ */}
      <Sequence from={200} durationInFrames={400}>
        <BoundedContext name="Phase 2: State Change" color="orange" x={PHASE2_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Command */}
      <Sequence from={230} durationInFrames={370}>
        <StickyNote text="ConfirmOrderCmd" color="blue" x={PHASE2_X + 50} y={ROW1_Y} delay={0} width={210} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={260} durationInFrames={340}>
        <PhaseLabel x={PHASE2_X + 260} y={ROW1_Y + 20} text="orderId, paymentRef" delay={0} frame={frame} fps={fps} />
      </Sequence>

      {/* Aggregate Updated */}
      <Sequence from={290} durationInFrames={310}>
        <StickyNote text="Order (v2)" color="yellow" x={PHASE2_X + 50} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={320} durationInFrames={280}>
        <StickyNote text="Status: CONFIRMED" color="green" x={PHASE2_X + 200} y={ROW2_Y} delay={0} width={230} fontSize={CARD_FONT} />
      </Sequence>

      {/* Event */}
      <Sequence from={350} durationInFrames={250}>
        <StickyNote text="OrderConfirmedEvent" color="orange" x={PHASE2_X + 60} y={ROW3_Y} delay={0} width={250} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={380} durationInFrames={220}>
        <StickyNote text="➜ Event Store" color="pink" x={PHASE2_X + 330} y={ROW3_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ PHASE 3: INVARIANT PROTECTION ============ */}
      <Sequence from={400} durationInFrames={200}>
        <BoundedContext name="Phase 3: Invariant Protection" color="blue" x={PHASE3_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Invalid Command */}
      <Sequence from={430} durationInFrames={170}>
        <StickyNote text="CancelOrderCmd" color="blue" x={PHASE3_X + 50} y={ROW1_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={460} durationInFrames={140}>
        <PhaseLabel x={PHASE3_X + 250} y={ROW1_Y + 20} text="orderId (already confirmed!)" delay={0} frame={frame} fps={fps} color="#dc2626" />
      </Sequence>

      {/* Aggregate Protected */}
      <Sequence from={490} durationInFrames={110}>
        <StickyNote text="Order (v2)" color="yellow" x={PHASE3_X + 50} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={520} durationInFrames={80}>
        <StickyNote text="❌ REJECTED" color="pink" x={PHASE3_X + 200} y={ROW2_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={550} durationInFrames={50}>
        <PhaseLabel x={PHASE3_X + 370} y={ROW2_Y + 20} text="Invariant violated!" delay={0} frame={frame} fps={fps} color="#dc2626" />
      </Sequence>

      {/* No Event */}
      <Sequence from={570} durationInFrames={30}>
        <StickyNote text="No Event Emitted" color="pink" x={PHASE3_X + 180} y={ROW3_Y} delay={0} width={210} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ FLOW ARROWS ============ */}

      {/* Phase 1 → Phase 2 */}
      <Sequence from={215} durationInFrames={385}>
        <Arrow fromX={PHASE1_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={PHASE2_X} toY={CONTEXT_Y + 200} delay={0} color="#22c55e" label="version incremented" />
      </Sequence>

      {/* Phase 2 → Phase 3 */}
      <Sequence from={415} durationInFrames={185}>
        <Arrow fromX={PHASE2_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={PHASE3_X} toY={CONTEXT_Y + 200} delay={0} color="#f97316" label="guards state" />
      </Sequence>
    </AbsoluteFill>
  );
};

interface PhaseLabelProps {
  x: number;
  y: number;
  text: string;
  delay: number;
  frame: number;
  fps: number;
  color?: string;
}

const PhaseLabel: React.FC<PhaseLabelProps> = ({ x, y, text, delay, frame, fps, color = '#64748b' }) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });

  if (frame < delay) return null;

  const labelStyle = { position: 'absolute' as const, left: x, top: y, transform: `scale(${scale})`, fontFamily: 'monospace', fontSize: 18, color, opacity, backgroundColor: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 4 };

  return <div style={labelStyle}>{text}</div>;
};
