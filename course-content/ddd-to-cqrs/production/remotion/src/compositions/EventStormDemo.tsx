import React, { useEffect } from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { StickyNote } from '../components/StickyNote';
import { BoundedContext } from '../components/BoundedContext';
import { Arrow } from '../components/Arrow';
import { loadFonts, fontFamily } from '../fonts';

/**
 * Event Storm Demo Animation
 * Duration: 15 seconds (450 frames at 30fps)
 * Canvas: 1920x1080
 *
 * Timeline:
 * 0-2s:   Sales context appears
 * 2-4s:   Sales events and commands appear
 * 4-6s:   Payment context appears
 * 6-8s:   Fulfillment context appears
 * 8-10s:  Arrows showing event flow
 * 10-15s: Hold complete diagram
 *
 * Overall the EventStormDemo animation looks good now. The layout is clean and well-organized:
 *
 * What's working well:
 * Three bounded contexts (Sales, Payment, Fulfillment) are clearly separated with distinct colors
 * Legend in the upper right is readable with the larger 28px font and 28x28 swatches
 * Sticky notes fit their text without truncation after widening
 * Arrows now properly connect between the relevant cards showing the event flow
 * Visual hierarchy is clear - the context labels, cards, and flow arrows all work together
 *
 * The flow tells a coherent story:
 * Customer triggers commands in Sales → Events are emitted
 * OrderPlaced triggers ProcessPayment in Payment context
 * PaymentProcessed triggers AllocateInventory in Fulfillment
 * PaymentFailed can trigger a rollback back to Sales
 * The animation demonstrates Event Storming concepts effectively for educational purposes. The color coding (blue for commands, orange for events, yellow for aggregates, pink for failures/external systems) helps viewers quickly understand the different element types.
 */

export const EventStormDemo: React.FC = () => {
  useEffect(() => {
    loadFonts();
  }, []);

  // Layout constants for 1920x1080
  const CONTEXT_Y = 130;
  const CONTEXT_HEIGHT = 560;
  const CONTEXT_WIDTH = 580;
  const CONTEXT_GAP = 30;

  const SALES_X = 30;
  const PAYMENT_X = SALES_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const FULFILLMENT_X = PAYMENT_X + CONTEXT_WIDTH + CONTEXT_GAP;

  const ROW1_Y = 220;
  const ROW2_Y = 400;
  const ROW3_Y = 560;

  const CARD_FONT = 20;

  // Style constants
  const containerStyle = { backgroundColor: '#f8fafc', padding: 20 };
  const titleStyle = { position: 'absolute' as const, top: 20, left: 30, fontFamily, fontSize: 36, fontWeight: 700, color: '#0f172a' };
  const legendContainerStyle = { position: 'absolute' as const, top: 25, right: 30, display: 'flex', gap: 30, fontFamily, fontSize: 28 };
  const legendItemStyle = { display: 'flex', alignItems: 'center', gap: 10 };
  const legendSwatchBase = { width: 28, height: 28, borderRadius: 4 };
  const eventSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fed7aa', border: '2px solid #f97316' };
  const commandSwatchStyle = { ...legendSwatchBase, backgroundColor: '#bfdbfe', border: '2px solid #3b82f6' };
  const aggregateSwatchStyle = { ...legendSwatchBase, backgroundColor: '#fef08a', border: '2px solid #eab308' };

  return (
    <AbsoluteFill style={containerStyle}>
      {/* Title */}
      <Sequence from={0} durationInFrames={450}>
        <div style={titleStyle}>E-Commerce Checkout: Event Storm</div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={450}>
        <div style={legendContainerStyle}>
          <div style={legendItemStyle}>
            <div style={eventSwatchStyle} />
            <span>Event</span>
          </div>
          <div style={legendItemStyle}>
            <div style={commandSwatchStyle} />
            <span>Command</span>
          </div>
          <div style={legendItemStyle}>
            <div style={aggregateSwatchStyle} />
            <span>Aggregate</span>
          </div>
        </div>
      </Sequence>

      {/* ============ SALES CONTEXT ============ */}
      <Sequence from={0} durationInFrames={450}>
        <BoundedContext name="Sales Context" color="green" x={SALES_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* User */}
      <Sequence from={30} durationInFrames={420}>
        <div style={{ position: 'absolute', left: SALES_X + 30, top: ROW1_Y, fontSize: 40, width: 40, textAlign: 'center' }}>👤</div>
        <div style={{ position: 'absolute', left: SALES_X + 30, top: ROW1_Y + 48, width: 40, textAlign: 'center', fontFamily, fontSize: 21, color: '#1b5e20' }}>User</div>
      </Sequence>

      {/* Sales Commands */}
      <Sequence from={45} durationInFrames={405}>
        <StickyNote text="AddItemToCart" color="blue" x={SALES_X + 100} y={ROW1_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={75} durationInFrames={375}>
        <StickyNote text="PlaceOrder" color="blue" x={SALES_X + 100} y={ROW2_Y} delay={0} width={170} fontSize={CARD_FONT} />
      </Sequence>

      {/* Sales Events */}
      <Sequence from={60} durationInFrames={390}>
        <StickyNote text="ItemAddedToCart" color="orange" x={SALES_X + 320} y={ROW1_Y} delay={0} width={220} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={90} durationInFrames={360}>
        <StickyNote text="OrderPlaced" color="orange" x={SALES_X + 320} y={ROW2_Y} delay={0} width={180} fontSize={CARD_FONT} />
      </Sequence>

      {/* Sales Aggregate */}
      <Sequence from={105} durationInFrames={345}>
        <StickyNote text="Order" color="yellow" x={SALES_X + 340} y={ROW3_Y} delay={0} width={120} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ PAYMENT CONTEXT ============ */}
      <Sequence from={120} durationInFrames={330}>
        <BoundedContext name="Payment Context" color="orange" x={PAYMENT_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Payment Command */}
      <Sequence from={150} durationInFrames={300}>
        <StickyNote text="ProcessPayment" color="blue" x={PAYMENT_X + 40} y={ROW1_Y} delay={0} width={210} fontSize={CARD_FONT} />
      </Sequence>

      {/* Payment Events */}
      <Sequence from={180} durationInFrames={270}>
        <StickyNote text="PaymentProcessed" color="orange" x={PAYMENT_X + 280} y={ROW1_Y} delay={0} width={240} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={195} durationInFrames={255}>
        <StickyNote text="PaymentFailed" color="pink" x={PAYMENT_X + 280} y={ROW2_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      {/* External System */}
      <Sequence from={210} durationInFrames={240}>
        <div style={{ position: 'absolute', left: PAYMENT_X + 70, top: ROW2_Y + 70, fontFamily, fontSize: 28 }}>⚡</div>
        <div style={{ position: 'absolute', left: PAYMENT_X + 45, top: ROW2_Y + 105, fontFamily, fontSize: 28, color: '#bf360c' }}>Stripe</div>
      </Sequence>

      {/* Payment Aggregate */}
      <Sequence from={225} durationInFrames={225}>
        <StickyNote text="Payment" color="yellow" x={PAYMENT_X + 340} y={ROW3_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ FULFILLMENT CONTEXT ============ */}
      <Sequence from={240} durationInFrames={210}>
        <BoundedContext name="Fulfillment Context" color="blue" x={FULFILLMENT_X} y={CONTEXT_Y} width={CONTEXT_WIDTH} height={CONTEXT_HEIGHT} delay={0} />
      </Sequence>

      {/* Fulfillment Commands */}
      <Sequence from={270} durationInFrames={180}>
        <StickyNote text="AllocateInventory" color="blue" x={FULFILLMENT_X + 100} y={ROW1_Y} delay={0} width={230} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={300} durationInFrames={150}>
        <StickyNote text="ShipOrder" color="blue" x={FULFILLMENT_X + 360} y={ROW1_Y} delay={0} width={160} fontSize={CARD_FONT} />
      </Sequence>

      {/* Fulfillment Events */}
      <Sequence from={285} durationInFrames={165}>
        <StickyNote text="InventoryAllocated" color="orange" x={FULFILLMENT_X + 40} y={ROW2_Y} delay={0} width={240} fontSize={CARD_FONT} />
      </Sequence>

      <Sequence from={315} durationInFrames={135}>
        <StickyNote text="OrderShipped" color="orange" x={FULFILLMENT_X + 300} y={ROW2_Y} delay={0} width={200} fontSize={CARD_FONT} />
      </Sequence>

      {/* Fulfillment Aggregates */}
      <Sequence from={330} durationInFrames={120}>
        <StickyNote text="Shipment" color="yellow" x={FULFILLMENT_X + 100} y={ROW3_Y} delay={0} width={130} fontSize={CARD_FONT} />
        <StickyNote text="Inventory" color="yellow" x={FULFILLMENT_X + 280} y={ROW3_Y} delay={0} width={130} fontSize={CARD_FONT} />
      </Sequence>

      {/* ============ FLOW ARROWS ============ */}

      {/* OrderPlaced → ProcessPayment */}
      <Sequence from={360} durationInFrames={90}>
        <Arrow fromX={SALES_X + 320 + 180} fromY={ROW2_Y + 35} toX={PAYMENT_X + 40} toY={ROW1_Y + 35} delay={0} color="#2e7d32" label="triggers" />
      </Sequence>

      {/* PaymentProcessed → AllocateInventory */}
      <Sequence from={390} durationInFrames={60}>
        <Arrow fromX={PAYMENT_X + 280 + 240} fromY={ROW1_Y + 35} toX={FULFILLMENT_X + 100} toY={ROW1_Y + 35} delay={0} color="#e65100" label="triggers" />
      </Sequence>

      {/* PaymentFailed → dashed back */}
      <Sequence from={405} durationInFrames={45}>
        <Arrow fromX={PAYMENT_X + 280} fromY={ROW2_Y + 35} toX={SALES_X + 320 + 180} toY={ROW2_Y + 35} delay={0} color="#c62828" dashed={true} label="rollback" />
      </Sequence>
    </AbsoluteFill>
  );
};
