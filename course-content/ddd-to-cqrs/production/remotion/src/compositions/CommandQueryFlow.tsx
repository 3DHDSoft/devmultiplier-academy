import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { BoundedContext } from '../components/BoundedContext';
import { StickyNote } from '../components/StickyNote';
import { Arrow } from '../components/Arrow';

/**
Command Query Flow Animation
Shows the detailed flow of commands and queries through the system
Detailed step-by-step flow of commands and queries
Command flow: User Action → Command → Handler → Aggregate → Domain Event → Event Store
Query flow: User Request → Query → Handler → Read Model → Response
Shows Event Projection connecting both sides

What's working well:
- Clear visual separation of the three main sections (Command Flow, Event Synchronization, Query Flow) with distinct colors (orange, purple, green)
- Legend is readable and positioned well in the upper right
- All sticky notes now fit their text properly after the width fixes
- The flow arrows with labels ("publishes events", "updates read model") clearly show data flow direction
- User icons appear in both Command and Query flows, showing the entry points
- Good visual hierarchy across all three contexts

Educational value:
The diagram effectively communicates the CQRS command/query separation:
- Command path: User → PlaceOrderCmd → CommandHandler → Order Aggregate → Validate & Apply → OrderPlacedEvent → Event Store
- Synchronization: Event Bus → Subscribe → Event Handler → Projector → Update Projection
- Query path: User → GetOrderQuery → QueryHandler → Read Model → OrderStatusView → OrderDTO Response

The animation tells a complete story of how commands flow through the write path, events are published and projected, and queries read from optimized views - demonstrating eventual consistency in CQRS.

CommandQueryFlow.tsx (18 seconds / 540 frames)
Duration: 18 seconds (540 frames at 30fps)
Canvas: 1920x1080
*/
export const CommandQueryFlow: React.FC = () => {
  // Layout constants for 1920x1080
  const CONTEXT_WIDTH = 580;
  const CONTEXT_HEIGHT = 560;
  const CONTEXT_GAP = 30;
  const CONTEXT_Y = 130;

  const COMMAND_X = 30;
  const SYNC_X = COMMAND_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const QUERY_X = SYNC_X + CONTEXT_WIDTH + CONTEXT_GAP;

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
  const eventSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fed7aa', border: '2px solid #f97316' };
  const querySwatchStyle = { ...legendSwatchBase, backgroundColor: '#bbf7d0', border: '2px solid #22c55e' };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Title */}
      <Sequence from={0} durationInFrames={540}>
        <div style={titleStyle}>Command & Query Flow in CQRS</div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={540}>
        <div style={legendContainerStyle}>
          <div style={legendItemStyle}>
            <div style={commandSwatchStyle} />
            <span>Command</span>
          </div>
          <div style={legendItemStyle}>
            <div style={eventSwatchStyle} />
            <span>Event</span>
          </div>
          <div style={legendItemStyle}>
            <div style={querySwatchStyle} />
            <span>Query</span>
          </div>
        </div>
      </Sequence>

      {/* ============ COMMAND FLOW ============ */}
      <Sequence from={0} durationInFrames={540}>
        <BoundedContext name="Command Flow (Write Path)" color="orange" x={COMMAND_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* User Action */}
      <Sequence from={30} durationInFrames={510}>
        <div style={{ position: 'absolute', left: COMMAND_X + 30, top: ROW1_Y, fontSize: 40, width: 40, textAlign: 'center' }}>👤</div>
        <div style={{ position: 'absolute', left: COMMAND_X + 30, top: ROW1_Y + 48, width: 40, textAlign: 'center', fontFamily: 'system-ui', fontSize: 21, color: '#9a3412' }}>User</div>
      </Sequence>

      {/* Commands */}
      <Sequence from={60} durationInFrames={480}>
        <StickyNote text="PlaceOrderCmd" color="blue" x={COMMAND_X + 100} y={ROW1_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={90} durationInFrames={450}>
        <StickyNote text="CommandHandler" color="orange" x={COMMAND_X + 300} y={ROW1_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      {/* Domain */}
      <Sequence from={120} durationInFrames={420}>
        <StickyNote text="Order Aggregate" color="yellow" x={COMMAND_X + 120} y={ROW2_Y} delay={0} width={CARD_WIDTH + 20} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={150} durationInFrames={390}>
        <StickyNote text="Validate & Apply" color="orange" x={COMMAND_X + 330} y={ROW2_Y} delay={0} width={CARD_WIDTH + 20} fontSize={CARD_FONT} />
      </Sequence>

      {/* Events & Store */}
      <Sequence from={180} durationInFrames={360}>
        <StickyNote text="OrderPlacedEvent" color="orange" x={COMMAND_X + 120} y={ROW3_Y} delay={0} width={CARD_WIDTH + 30} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={210} durationInFrames={330}>
        <StickyNote text="Event Store" color="pink" x={COMMAND_X + 350} y={ROW3_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ SYNCHRONIZATION ============ */}
      <Sequence from={240} durationInFrames={300}>
        <BoundedContext name="Event Synchronization" color="purple" x={SYNC_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Event Bus */}
      <Sequence from={270} durationInFrames={270}>
        <StickyNote text="Event Bus" color="pink" x={SYNC_X + 200} y={ROW1_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={300} durationInFrames={240}>
        <StickyNote text="Subscribe" color="blue" x={SYNC_X + 60} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={330} durationInFrames={210}>
        <StickyNote text="Event Handler" color="orange" x={SYNC_X + 210} y={ROW2_Y} delay={0} width={CARD_WIDTH} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={360} durationInFrames={180}>
        <StickyNote text="Projector" color="pink" x={SYNC_X + 400} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      {/* Update Read Model */}
      <Sequence from={390} durationInFrames={150}>
        <StickyNote text="Update Projection" color="green" x={SYNC_X + 180} y={ROW3_Y} delay={0} width={210} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ QUERY FLOW ============ */}
      <Sequence from={420} durationInFrames={120}>
        <BoundedContext name="Query Flow (Read Path)" color="green" x={QUERY_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* User Request */}
      <Sequence from={450} durationInFrames={90}>
        <div style={{ position: 'absolute', left: QUERY_X + 30, top: ROW1_Y, fontSize: 40, width: 40, textAlign: 'center' }}>👤</div>
        <div style={{ position: 'absolute', left: QUERY_X + 30, top: ROW1_Y + 48, width: 40, textAlign: 'center', fontFamily: 'system-ui', fontSize: 21, color: '#166534' }}>User</div>
      </Sequence>

      <Sequence from={465} durationInFrames={75}>
        <StickyNote text="GetOrderQuery" color="blue" x={QUERY_X + 100} y={ROW1_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={480} durationInFrames={60}>
        <StickyNote text="QueryHandler" color="orange" x={QUERY_X + 290} y={ROW1_Y} delay={0} width={CARD_WIDTH} fontSize={CARD_FONT} />
      </Sequence>

      {/* Read Model */}
      <Sequence from={495} durationInFrames={45}>
        <StickyNote text="Read Model" color="yellow" x={QUERY_X + 120} y={ROW2_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={510} durationInFrames={30}>
        <StickyNote text="OrderStatusView" color="green" x={QUERY_X + 290} y={ROW2_Y} delay={0} width={CARD_WIDTH + 20} fontSize={CARD_FONT} />
      </Sequence>

      {/* Response */}
      <Sequence from={525} durationInFrames={15}>
        <StickyNote text="OrderDTO Response" color="green" x={QUERY_X + 180} y={ROW3_Y} delay={0} width={230} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ FLOW ARROWS ============ */}

      {/* Command → Sync */}
      <Sequence from={255} durationInFrames={285}>
        <Arrow fromX={COMMAND_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={SYNC_X} toY={CONTEXT_Y + 200} delay={0} color="#f97316" label="publishes events" />
      </Sequence>

      {/* Sync → Query */}
      <Sequence from={435} durationInFrames={105}>
        <Arrow fromX={SYNC_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={QUERY_X} toY={CONTEXT_Y + 200} delay={0} color="#22c55e" label="updates read model" />
      </Sequence>
    </AbsoluteFill>
  );
};
