import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { StickyNote } from '../components/StickyNote';
import { BoundedContext } from '../components/BoundedContext';
import { Arrow } from '../components/Arrow';

/**
 * Event Storm Demo Animation
 * Duration: 15 seconds (450 frames at 30fps)
 * Canvas: 1600x450
 *
 * Timeline:
 * 0-2s:   Sales context appears
 * 2-4s:   Sales events and commands appear
 * 4-6s:   Payment context appears
 * 6-8s:   Fulfillment context appears
 * 8-10s:  Arrows showing event flow
 * 10-15s: Hold complete diagram
 */
export const EventStormDemo: React.FC = () => {
  // Layout constants (2x resolution: 3200x900)
  const SCALE = 2;
  const CONTEXT_Y = 110;
  const CONTEXT_HEIGHT = 520;
  const CONTEXT_WIDTH = 980;
  const CONTEXT_GAP = 40;

  const SALES_X = 40;
  const PAYMENT_X = SALES_X + CONTEXT_WIDTH + CONTEXT_GAP;
  const FULFILLMENT_X = PAYMENT_X + CONTEXT_WIDTH + CONTEXT_GAP;

  const ROW1_Y = 200;
  const ROW2_Y = 360;
  const ROW3_Y = 510;

  const CARD_WIDTH = 280;
  const CARD_FONT = 24;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#f8fafc',
        padding: 30,
      }}
    >
      {/* Title */}
      <Sequence from={0} durationInFrames={450}>
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 48,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          E-Commerce Checkout: Event Storm
        </div>
      </Sequence>

      {/* Legend */}
      <Sequence from={0} durationInFrames={450}>
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 30,
            display: 'flex',
            gap: 30,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#fed7aa',
                border: '3px solid #f97316',
                borderRadius: 4,
              }}
            />
            <span>Event</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#bfdbfe',
                border: '3px solid #3b82f6',
                borderRadius: 4,
              }}
            />
            <span>Command</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: '#fef08a',
                border: '3px solid #eab308',
                borderRadius: 4,
              }}
            />
            <span>Aggregate</span>
          </div>
        </div>
      </Sequence>

      {/* ============ SALES CONTEXT ============ */}
      <Sequence from={0} durationInFrames={450}>
        <BoundedContext
          name="Sales Context"
          color="green"
          x={SALES_X}
          y={CONTEXT_Y}
          width={CONTEXT_WIDTH}
          height={CONTEXT_HEIGHT}
          delay={0}
        />
      </Sequence>

      {/* Actor */}
      <Sequence from={30} durationInFrames={420}>
        <div
          style={{
            position: 'absolute',
            left: SALES_X + 50,
            top: ROW1_Y,
            fontSize: 64,
          }}
        >
          👤
        </div>
        <div
          style={{
            position: 'absolute',
            left: SALES_X + 30,
            top: ROW1_Y + 76,
            fontFamily: 'system-ui',
            fontSize: 20,
            color: '#1b5e20',
          }}
        >
          Customer
        </div>
      </Sequence>

      {/* Sales Commands */}
      <Sequence from={45} durationInFrames={405}>
        <StickyNote
          text="AddItemToCart"
          color="blue"
          x={SALES_X + 180}
          y={ROW1_Y}
          delay={0}
          width={CARD_WIDTH}
          fontSize={CARD_FONT}
        />
      </Sequence>

      <Sequence from={75} durationInFrames={375}>
        <StickyNote
          text="PlaceOrder"
          color="blue"
          x={SALES_X + 180}
          y={ROW2_Y}
          delay={0}
          width={CARD_WIDTH}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* Sales Events */}
      <Sequence from={60} durationInFrames={390}>
        <StickyNote
          text="ItemAddedToCart"
          color="orange"
          x={SALES_X + 500}
          y={ROW1_Y}
          delay={0}
          width={CARD_WIDTH + 20}
          fontSize={CARD_FONT}
        />
      </Sequence>

      <Sequence from={90} durationInFrames={360}>
        <StickyNote
          text="OrderPlaced"
          color="orange"
          x={SALES_X + 500}
          y={ROW2_Y}
          delay={0}
          width={CARD_WIDTH + 20}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* Sales Aggregate */}
      <Sequence from={105} durationInFrames={345}>
        <StickyNote
          text="Order"
          color="yellow"
          x={SALES_X + 580}
          y={ROW3_Y}
          delay={0}
          width={200}
          fontSize={28}
        />
      </Sequence>

      {/* ============ PAYMENT CONTEXT ============ */}
      <Sequence from={120} durationInFrames={330}>
        <BoundedContext
          name="Payment Context"
          color="orange"
          x={PAYMENT_X}
          y={CONTEXT_Y}
          width={CONTEXT_WIDTH}
          height={CONTEXT_HEIGHT}
          delay={0}
        />
      </Sequence>

      {/* Payment Command */}
      <Sequence from={150} durationInFrames={300}>
        <StickyNote
          text="ProcessPayment"
          color="blue"
          x={PAYMENT_X + 60}
          y={ROW1_Y + 20}
          delay={0}
          width={CARD_WIDTH + 40}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* Payment Events */}
      <Sequence from={180} durationInFrames={270}>
        <StickyNote
          text="PaymentProcessed"
          color="orange"
          x={PAYMENT_X + 420}
          y={ROW1_Y}
          delay={0}
          width={CARD_WIDTH + 80}
          fontSize={CARD_FONT}
        />
      </Sequence>

      <Sequence from={195} durationInFrames={255}>
        <StickyNote
          text="PaymentFailed"
          color="pink"
          x={PAYMENT_X + 420}
          y={ROW2_Y}
          delay={0}
          width={CARD_WIDTH + 60}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* External System */}
      <Sequence from={210} durationInFrames={240}>
        <div
          style={{
            position: 'absolute',
            left: PAYMENT_X + 100,
            top: ROW2_Y + 60,
            fontFamily: 'system-ui',
            fontSize: 40,
          }}
        >
          ⚡
        </div>
        <div
          style={{
            position: 'absolute',
            left: PAYMENT_X + 84,
            top: ROW2_Y + 110,
            fontFamily: 'system-ui',
            fontSize: 20,
            color: '#bf360c',
          }}
        >
          Stripe
        </div>
      </Sequence>

      {/* Payment Aggregate */}
      <Sequence from={225} durationInFrames={225}>
        <StickyNote
          text="Payment"
          color="yellow"
          x={PAYMENT_X + 560}
          y={ROW3_Y}
          delay={0}
          width={220}
          fontSize={28}
        />
      </Sequence>

      {/* ============ FULFILLMENT CONTEXT ============ */}
      <Sequence from={240} durationInFrames={210}>
        <BoundedContext
          name="Fulfillment Context"
          color="blue"
          x={FULFILLMENT_X}
          y={CONTEXT_Y}
          width={CONTEXT_WIDTH}
          height={CONTEXT_HEIGHT}
          delay={0}
        />
      </Sequence>

      {/* Fulfillment Commands */}
      <Sequence from={270} durationInFrames={180}>
        <StickyNote
          text="AllocateInventory"
          color="blue"
          x={FULFILLMENT_X + 60}
          y={ROW1_Y + 20}
          delay={0}
          width={CARD_WIDTH + 60}
          fontSize={CARD_FONT}
        />
      </Sequence>

      <Sequence from={300} durationInFrames={150}>
        <StickyNote
          text="ShipOrder"
          color="blue"
          x={FULFILLMENT_X + 450}
          y={ROW1_Y + 20}
          delay={0}
          width={220}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* Fulfillment Events */}
      <Sequence from={285} durationInFrames={165}>
        <StickyNote
          text="InventoryAllocated"
          color="orange"
          x={FULFILLMENT_X + 60}
          y={ROW2_Y}
          delay={0}
          width={CARD_WIDTH + 80}
          fontSize={CARD_FONT}
        />
      </Sequence>

      <Sequence from={315} durationInFrames={135}>
        <StickyNote
          text="OrderShipped"
          color="orange"
          x={FULFILLMENT_X + 450}
          y={ROW2_Y}
          delay={0}
          width={CARD_WIDTH + 40}
          fontSize={CARD_FONT}
        />
      </Sequence>

      {/* Fulfillment Aggregates */}
      <Sequence from={330} durationInFrames={120}>
        <StickyNote
          text="Shipment"
          color="yellow"
          x={FULFILLMENT_X + 140}
          y={ROW3_Y}
          delay={0}
          width={220}
          fontSize={24}
        />
        <StickyNote
          text="Inventory"
          color="yellow"
          x={FULFILLMENT_X + 440}
          y={ROW3_Y}
          delay={0}
          width={220}
          fontSize={24}
        />
      </Sequence>

      {/* ============ FLOW ARROWS ============ */}

      {/* OrderPlaced → ProcessPayment */}
      <Sequence from={360} durationInFrames={90}>
        <Arrow
          fromX={SALES_X + 820}
          fromY={ROW2_Y + 20}
          toX={PAYMENT_X + 40}
          toY={ROW1_Y + 60}
          delay={0}
          color="#2e7d32"
          label="triggers"
        />
      </Sequence>

      {/* PaymentProcessed → AllocateInventory */}
      <Sequence from={390} durationInFrames={60}>
        <Arrow
          fromX={PAYMENT_X + 800}
          fromY={ROW1_Y + 40}
          toX={FULFILLMENT_X + 40}
          toY={ROW1_Y + 60}
          delay={0}
          color="#e65100"
          label="triggers"
        />
      </Sequence>

      {/* PaymentFailed → dashed back */}
      <Sequence from={405} durationInFrames={45}>
        <Arrow
          fromX={PAYMENT_X + 400}
          fromY={ROW2_Y + 40}
          toX={SALES_X + 820}
          toY={ROW2_Y + 50}
          delay={0}
          color="#c62828"
          dashed={true}
          label="rollback"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
