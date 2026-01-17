import React, { useEffect } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { BoundedContext } from '../components/BoundedContext';
import { StickyNote } from '../components/StickyNote';
import { Arrow } from '../components/Arrow';
import { loadFonts, fontFamily } from '../fonts';

/**
CQRS Architecture Animation
Shows the separation of Command and Query sides
Visualizes CQRS architecture with Command and Query separation
Shows Command side: Client → Command Handlers → Domain Model → Write Database
Shows Query side: Client → Query Handlers → Read Database
Includes Event Bus connecting Write to Read side for synchronization

What's working well:
- Clear visual separation of the three main sections (Command Side, Event Store, Query Side) with distinct colors (orange, purple, green)
- Legend is readable and positioned well in the upper right
- The flow arrows with labels ("publishes", "projects", "reads from optimized views") clearly show data flow direction
- Sticky notes are properly sized and readable
- The "Append-Only Log" with the floppy disk icon effectively communicates event sourcing storage
- Good visual hierarchy with bounded context labels, cards, and flow indicators

Educational value:
The diagram effectively communicates the core CQRS concepts:
- Commands go through handlers to the write side
- Events are published to the Event Store
- Projectors create read models from events
- Queries read from optimized views

The animation tells a coherent story about how write and read paths are separated while staying eventually consistent through events.

CQRSArchitecture.tsx (15 seconds / 450 frames)
Duration: 15 seconds (450 frames at 30fps)
Canvas: 1920x1080
*/
export const CQRSArchitecture: React.FC = () => {
  useEffect(() => {
    loadFonts();
  }, []);

  // Layout constants for 1920x1080
  const CONTEXT_WIDTH = 580;
  const CONTEXT_HEIGHT = 560;
  const CONTEXT_GAP = 30;
  const CONTEXT_Y = 130;

  const COMMAND_X = 30;
  const EVENT_X = COMMAND_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const QUERY_X = EVENT_X + CONTEXT_WIDTH + CONTEXT_GAP;

  const ROW1_Y = 220;
  const ROW2_Y = 400;
  const ROW3_Y = 560;

  const CARD_FONT = 20;

  const containerStyle = { backgroundColor: '#f8fafc', padding: 20 };
  const titleStyle = { position: 'absolute' as const, top: 20, left: 30, fontFamily, fontSize: 36, fontWeight: 700, color: '#0f172a' };
  const legendContainerStyle = { position: 'absolute' as const, top: 25, right: 30, display: 'flex', gap: 30, fontFamily, fontSize: 28 };
  const legendItemStyle = { display: 'flex', alignItems: 'center', gap: 10 };
  const legendSwatchBase = { width: 28, height: 28, borderRadius: 4 };
  const commandSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fed7aa', border: '2px solid #f97316' };
  const eventSwatchStyle = { ...legendSwatchBase, backgroundColor: '#e9d5ff', border: '2px solid #a855f7' };
  const querySwatchStyle = { ...legendSwatchBase, backgroundColor: '#bbf7d0', border: '2px solid #22c55e' };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Title */}
      <Sequence from={0} durationInFrames={450}>
        <div style={titleStyle}>CQRS: Command Query Responsibility Segregation</div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={450}>
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

      {/* ============ COMMAND SIDE ============ */}
      <Sequence from={0} durationInFrames={450}>
        <BoundedContext name="Command Side (Write)" color="orange" x={COMMAND_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* User */}
      <Sequence from={30} durationInFrames={420}>
        <div style={{ position: 'absolute', left: COMMAND_X + 30, top: ROW1_Y, fontSize: 40, width: 40, textAlign: 'center' }}>👤</div>
        <div style={{ position: 'absolute', left: COMMAND_X + 30, top: ROW1_Y + 48, width: 40, textAlign: 'center', fontFamily, fontSize: 21, color: '#9a3412' }}>User</div>
      </Sequence>

      {/* Commands */}
      <Sequence from={45} durationInFrames={405}>
        <StickyNote text="PlaceOrder" color="blue" x={COMMAND_X + 90} y={ROW1_Y} delay={0} width={140} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={60} durationInFrames={390}>
        <StickyNote text="UpdateOrder" color="blue" x={COMMAND_X + 250} y={ROW1_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={75} durationInFrames={375}>
        <StickyNote text="CancelOrder" color="blue" x={COMMAND_X + 410} y={ROW1_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      {/* Command Handlers */}
      <Sequence from={90} durationInFrames={360}>
        <StickyNote text="CommandHandler" color="orange" x={COMMAND_X + 100} y={ROW2_Y} delay={0} width={220} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={105} durationInFrames={345}>
        <StickyNote text="Validator" color="orange" x={COMMAND_X + 350} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      {/* Aggregates */}
      <Sequence from={120} durationInFrames={330}>
        <StickyNote text="Order" color="yellow" x={COMMAND_X + 180} y={ROW3_Y} delay={0} width={110} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={135} durationInFrames={315}>
        <StickyNote text="WriteDB" color="pink" x={COMMAND_X + 320} y={ROW3_Y} delay={0} width={110} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ EVENT STORE ============ */}
      <Sequence from={150} durationInFrames={300}>
        <BoundedContext name="Event Store" color="purple" x={EVENT_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Events */}
      <Sequence from={180} durationInFrames={270}>
        <StickyNote text="OrderPlaced" color="orange" x={EVENT_X + 40} y={ROW1_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={195} durationInFrames={255}>
        <StickyNote text="OrderUpdated" color="orange" x={EVENT_X + 210} y={ROW1_Y} delay={0} width={160} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={210} durationInFrames={240}>
        <StickyNote text="OrderCancelled" color="orange" x={EVENT_X + 380} y={ROW1_Y} delay={0} width={190} fontSize={CARD_FONT} />
      </Sequence>

      {/* Event Bus */}
      <Sequence from={225} durationInFrames={225}>
        <StickyNote text="EventBus" color="pink" x={EVENT_X + 180} y={ROW2_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={240} durationInFrames={210}>
        <StickyNote text="Projector" color="pink" x={EVENT_X + 340} y={ROW2_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      {/* Event Storage */}
      <Sequence from={255} durationInFrames={195}>
        <div style={{ position: 'absolute', left: EVENT_X + 240, top: ROW3_Y, fontSize: 32 }}>💾</div>
        <div style={{ position: 'absolute', left: EVENT_X + 180, top: ROW3_Y + 40, fontFamily, fontSize: 21, color: '#7e22ce' }}>Append-Only Log</div>
      </Sequence>

      {/* ============ QUERY SIDE ============ */}
      <Sequence from={270} durationInFrames={180}>
        <BoundedContext name="Query Side (Read)" color="green" x={QUERY_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Queries */}
      <Sequence from={300} durationInFrames={150}>
        <StickyNote text="GetOrder" color="blue" x={QUERY_X + 50} y={ROW1_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={315} durationInFrames={135}>
        <StickyNote text="ListOrders" color="blue" x={QUERY_X + 190} y={ROW1_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={330} durationInFrames={120}>
        <StickyNote text="SearchOrders" color="blue" x={QUERY_X + 340} y={ROW1_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      {/* Query Handlers */}
      <Sequence from={345} durationInFrames={105}>
        <StickyNote text="QueryHandler" color="orange" x={QUERY_X + 100} y={ROW2_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={360} durationInFrames={90}>
        <StickyNote text="ReadModel" color="yellow" x={QUERY_X + 310} y={ROW2_Y} delay={0} width={150} fontSize={CARD_FONT} />
      </Sequence>

      {/* Read Database */}
      <Sequence from={375} durationInFrames={75}>
        <StickyNote text="ReadDB" color="green" x={QUERY_X + 180} y={ROW3_Y} delay={0} width={110} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={390} durationInFrames={60}>
        <StickyNote text="Optimized Views" color="green" x={QUERY_X + 310} y={ROW3_Y} delay={0} width={220} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ FLOW ARROWS ============ */}

      {/* Command → Event Store */}
      <Sequence from={165} durationInFrames={285}>
        <Arrow fromX={COMMAND_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={EVENT_X} toY={CONTEXT_Y + 200} delay={0} color="#f97316" label="publishes" />
      </Sequence>

      {/* Event Store → Query */}
      <Sequence from={285} durationInFrames={165}>
        <Arrow fromX={EVENT_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={QUERY_X} toY={CONTEXT_Y + 200} delay={0} color="#a855f7" label="projects" />
      </Sequence>

      {/* Client to Query (return) */}
      <Sequence from={405} durationInFrames={45}>
        <Arrow fromX={QUERY_X + 250} fromY={CONTEXT_Y + CONTEXT_HEIGHT + 20} toX={COMMAND_X + 250} toY={CONTEXT_Y + CONTEXT_HEIGHT + 20} delay={0} color="#22c55e" label="reads from optimized views" dashed />
      </Sequence>
    </AbsoluteFill>
  );
};
