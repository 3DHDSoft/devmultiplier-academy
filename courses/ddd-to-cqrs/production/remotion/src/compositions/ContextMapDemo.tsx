import React, { useEffect } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { BoundedContext } from '../components/BoundedContext';
import { Arrow } from '../components/Arrow';
import { StickyNote } from '../components/StickyNote';
import { loadFonts, fontFamily } from '../fonts';

/**
Context Map Demo Animation
Shows relationships between bounded contexts: Customer/Supplier, Shared Kernel, ACL
Shows relationships between bounded contexts in an e-commerce domain
Displays Sales, Inventory, and Shipping contexts
Illustrates Customer/Supplier and Partnership relationships

What's working well:
- Clear visual distinction between the three bounded contexts using color coding (green/Upstream, orange/Downstream, blue/Partnership)
- The legend effectively explains the relationship types
- Role labels ("UPSTREAM", "DOWNSTREAM", "PARTNER") at the bottom of each context clearly identify their relationship roles
- Arrow labels ("Customer/Supplier", "Partnership") explain how contexts interact
- Entities (yellow) and events (orange) are well-differentiated within each context
- Sticky notes are properly sized and readable

Educational value:
- The diagram effectively communicates Context Mapping concepts:

Sales Context is upstream (provides data/services)
- Inventory Context is downstream (consumes from Sales)
- Shipping Context has a partnership relationship with Inventory (mutual collaboration)
- Each context has its own domain model (entities like Customer, StockItem, Shipment)
- Events flow between contexts (OrderPlaced → StockReserved → ShipmentDispatched)

The flow makes sense:
- Sales drives orders (upstream supplier)
- Inventory reacts to sales (downstream customer)
- Shipping collaborates with Inventory (partnership)

The animation demonstrates how bounded contexts in DDD relate to each other and maintain their autonomy while still integrating through well-defined relationships.

ContextMapDemo.tsx (12 seconds / 360 frames)
Duration: 12 seconds (360 frames at 30fps)
Canvas: 1920x1080
*/
export const ContextMapDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useEffect(() => {
    loadFonts();
  }, []);

  // Layout constants for 1920x1080
  const CONTEXT_WIDTH = 580;
  const CONTEXT_HEIGHT = 560;
  const CONTEXT_GAP = 30;
  const CONTEXT_Y = 130;

  const SALES_X = 30;
  const INVENTORY_X = SALES_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const SHIPPING_X = INVENTORY_X + CONTEXT_WIDTH + CONTEXT_GAP;

  const ROW1_Y = 220;
  const ROW2_Y = 400;

  const CARD_WIDTH = 160;
  const CARD_FONT = 20;

  const containerStyle = { backgroundColor: '#f8fafc', padding: 20 };
  const titleStyle = { position: 'absolute' as const, top: 20, left: 30, fontFamily, fontSize: 36, fontWeight: 700, color: '#0f172a' };
  const legendContainerStyle = { position: 'absolute' as const, top: 25, right: 30, display: 'flex', gap: 30, fontFamily, fontSize: 28 };
  const legendItemStyle = { display: 'flex', alignItems: 'center', gap: 10 };
  const legendSwatchBase = { width: 28, height: 28, borderRadius: 4 };
  const upstreamSwatchStyle = { ...legendSwatchBase, backgroundColor: '#dcfce7', border: '2px solid #22c55e' };
  const downstreamSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fef3c7', border: '2px solid #f59e0b' };
  const partnerSwatchStyle = { ...legendSwatchBase, backgroundColor: '#dbeafe', border: '2px solid #3b82f6' };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Title */}
      <Sequence from={0} durationInFrames={360}>
        <div style={titleStyle}>Context Map: E-Commerce Domain</div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={360}>
        <div style={legendContainerStyle}>
          <div style={legendItemStyle}>
            <div style={upstreamSwatchStyle} />
            <span>Upstream</span>
          </div>
          <div style={legendItemStyle}>
            <div style={downstreamSwatchStyle} />
            <span>Downstream</span>
          </div>
          <div style={legendItemStyle}>
            <div style={partnerSwatchStyle} />
            <span>Partnership</span>
          </div>
        </div>
      </Sequence>

      {/* ============ SALES CONTEXT (Upstream) ============ */}
      <Sequence from={0} durationInFrames={360}>
        <BoundedContext name="Sales Context" color="green" x={SALES_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Sales Entities */}
      <Sequence from={30} durationInFrames={330}>
        <StickyNote text="Customer" color="yellow" x={SALES_X + 50} y={ROW1_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={45} durationInFrames={315}>
        <StickyNote text="Order" color="yellow" x={SALES_X + 200} y={ROW1_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={60} durationInFrames={300}>
        <StickyNote text="Product" color="yellow" x={SALES_X + 350} y={ROW1_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      {/* Sales Events */}
      <Sequence from={75} durationInFrames={285}>
        <StickyNote text="OrderPlaced" color="orange" x={SALES_X + 120} y={ROW2_Y} delay={0} width={CARD_WIDTH} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={90} durationInFrames={270}>
        <StickyNote text="OrderConfirmed" color="orange" x={SALES_X + 310} y={ROW2_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      {/* Role Label */}
      <Sequence from={105} durationInFrames={255}>
        <RoleLabel x={SALES_X + CONTEXT_WIDTH / 2} y={CONTEXT_Y + CONTEXT_HEIGHT - 30} text="UPSTREAM" color="#22c55e" delay={0} frame={frame} fps={fps} />
      </Sequence>

      {/* ============ INVENTORY CONTEXT (Downstream) ============ */}
      <Sequence from={120} durationInFrames={240}>
        <BoundedContext name="Inventory Context" color="orange" x={INVENTORY_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Inventory Entities */}
      <Sequence from={150} durationInFrames={210}>
        <StickyNote text="StockItem" color="yellow" x={INVENTORY_X + 50} y={ROW1_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={165} durationInFrames={195}>
        <StickyNote text="Warehouse" color="yellow" x={INVENTORY_X + 210} y={ROW1_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <StickyNote text="Reservation" color="yellow" x={INVENTORY_X + 370} y={ROW1_Y} delay={0} width={140} fontSize={CARD_FONT} />
      </Sequence>

      {/* Inventory Events */}
      <Sequence from={195} durationInFrames={165}>
        <StickyNote text="StockReserved" color="orange" x={INVENTORY_X + 120} y={ROW2_Y} delay={0} width={CARD_WIDTH + 10} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={210} durationInFrames={150}>
        <StickyNote text="StockDepleted" color="pink" x={INVENTORY_X + 320} y={ROW2_Y} delay={0} width={CARD_WIDTH + 10} fontSize={CARD_FONT} />
      </Sequence>

      {/* Role Label */}
      <Sequence from={225} durationInFrames={135}>
        <RoleLabel x={INVENTORY_X + CONTEXT_WIDTH / 2} y={CONTEXT_Y + CONTEXT_HEIGHT - 30} text="DOWNSTREAM" color="#f59e0b" delay={0} frame={frame} fps={fps} />
      </Sequence>

      {/* ============ SHIPPING CONTEXT (Partner) ============ */}
      <Sequence from={240} durationInFrames={120}>
        <BoundedContext name="Shipping Context" color="blue" x={SHIPPING_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Shipping Entities */}
      <Sequence from={260} durationInFrames={100}>
        <StickyNote text="Shipment" color="yellow" x={SHIPPING_X + 50} y={ROW1_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={275} durationInFrames={85}>
        <StickyNote text="Carrier" color="yellow" x={SHIPPING_X + 210} y={ROW1_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={290} durationInFrames={70}>
        <StickyNote text="DeliveryRoute" color="yellow" x={SHIPPING_X + 350} y={ROW1_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      {/* Shipping Events */}
      <Sequence from={300} durationInFrames={60}>
        <StickyNote text="ShipmentDispatched" color="orange" x={SHIPPING_X + 60} y={ROW2_Y} delay={0} width={240} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={315} durationInFrames={45}>
        <StickyNote text="ShipmentDelivered" color="orange" x={SHIPPING_X + 320} y={ROW2_Y} delay={0} width={220} fontSize={CARD_FONT} />
      </Sequence>

      {/* Role Label */}
      <Sequence from={330} durationInFrames={30}>
        <RoleLabel x={SHIPPING_X + CONTEXT_WIDTH / 2} y={CONTEXT_Y + CONTEXT_HEIGHT - 30} text="PARTNER" color="#3b82f6" delay={0} frame={frame} fps={fps} />
      </Sequence>

      {/* ============ RELATIONSHIP ARROWS ============ */}

      {/* Sales → Inventory (Customer/Supplier) */}
      <Sequence from={135} durationInFrames={225}>
        <Arrow fromX={SALES_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={INVENTORY_X} toY={CONTEXT_Y + 200} delay={0} color="#22c55e" label="Customer/Supplier" />
      </Sequence>

      {/* Inventory ↔ Shipping (Partnership) */}
      <Sequence from={255} durationInFrames={105}>
        <Arrow fromX={INVENTORY_X + CONTEXT_WIDTH} fromY={CONTEXT_Y + 200} toX={SHIPPING_X} toY={CONTEXT_Y + 200} delay={0} color="#3b82f6" label="Partnership" />
      </Sequence>
    </AbsoluteFill>
  );
};

interface RoleLabelProps {
  x: number;
  y: number;
  text: string;
  color: string;
  delay: number;
  frame: number;
  fps: number;
}

const RoleLabel: React.FC<RoleLabelProps> = ({ x, y, text, color, delay, frame, fps }) => {
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 100 } });

  if (frame < delay) return null;

  const labelStyle = { position: 'absolute' as const, left: x, top: y, transform: `translateX(-50%) scale(${scale})`, fontFamily, fontSize: 18, fontWeight: 700, color, backgroundColor: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: 6, border: `2px solid ${color}`, opacity, letterSpacing: 1 };

  return <div style={labelStyle}>{text}</div>;
};
